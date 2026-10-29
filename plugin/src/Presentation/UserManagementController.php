<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Presentation;

use EM360\SchoolConnector\Application\UserManagement;
use EM360\SchoolConnector\Domain\ConnectorException;
use EM360\SchoolConnector\Domain\ModuleRequest;
use EM360\SchoolConnector\Contracts\SettingsStoreInterface;

final class UserManagementController
{
    public function __construct(
        private readonly UserManagement $management,
        private readonly RequestGuard $guard,
        private readonly ErrorResponder $errors,
        private readonly string $pluginFile,
        private readonly SettingsStoreInterface $settings,
    ) {
    }

    public function register(): void
    {
        add_action('rest_api_init', [$this, 'routes']);
        add_action('admin_post_em360_user_management', [$this, 'frame']);
        add_action('admin_post_nopriv_em360_user_management', [$this, 'frame']);
    }

    public function routes(): void
    {
        register_rest_route('em360/v1', '/user-management/context', [
            'methods' => 'GET', 'callback' => [$this, 'context'], 'permission_callback' => [$this->guard, 'csrf'],
        ]);
        register_rest_route('em360/v1', '/user-management', [
            'methods' => 'POST', 'callback' => [$this, 'execute'], 'permission_callback' => [$this->guard, 'csrf'],
        ]);
    }

    /** @param \WP_REST_Request<array<string, mixed>> $request */
    public function context(\WP_REST_Request $request): \WP_REST_Response|\WP_Error
    {
        nocache_headers();
        try {
            return new \WP_REST_Response($this->management->context(is_string($request->get_param('module')) ? $request->get_param('module') : 'users'));
        } catch (\Throwable $error) {
            return $this->errors->rest($error);
        }
    }

    /** @param \WP_REST_Request<array<string, mixed>> $request */
    public function execute(\WP_REST_Request $request): \WP_REST_Response|\WP_Error
    {
        nocache_headers();
        try {
            if (strlen($request->get_body()) > 22 * 1024 * 1024) {
                throw new ConnectorException('The request exceeds the upload limit.', 413);
            }
            $data = $request->get_json_params();
            if (
                !is_string($data['method'] ?? null) || !is_string($data['path'] ?? null) ||
                !is_array($data['query'] ?? null) || !is_array($data['files'] ?? null) ||
                (isset($data['body']) && !is_array($data['body'])) ||
                (isset($data['multipart']) && !is_bool($data['multipart']))
            ) {
                throw new ConnectorException('Invalid school module request.', 400);
            }
            // AI course drafts can take up to three minutes; keep PHP alive for that single operation.
            if ($data['method'] === 'POST' && preg_match('~^/Training/Courses/[a-fA-F0-9-]{36}/Generate$~D', $data['path']) && function_exists('set_time_limit')) {
                @set_time_limit(200);
            }
            foreach ($data['files'] as $file) {
                if (!is_array($file) || count(array_filter($file, 'is_string')) !== count($file)) {
                    throw new ConnectorException('Invalid image upload.', 400);
                }
            }
            return new \WP_REST_Response($this->management->execute(new ModuleRequest(
                $data['method'],
                $data['path'],
                $data['query'],
                $data['body'] ?? null,
                $data['files'],
                $data['multipart'] ?? false,
            )));
        } catch (\Throwable $error) {
            return $this->errors->rest($error);
        }
    }

    /** The public document contains only the local application shell. API access still requires the bound portal session. */
    public function frame(): void
    {
        nocache_headers();
        header('Content-Type: text/html; charset=utf-8');
        header('Referrer-Policy: no-referrer');
        header('X-Frame-Options: SAMEORIGIN');
        header("Content-Security-Policy: frame-ancestors 'self'");
        $path = isset($_GET['path']) && is_string($_GET['path']) ? wp_unslash($_GET['path']) : '/dashboard/users';
        if (!preg_match('~^/dashboard(?:/[a-zA-Z0-9_-]+)*/?(?:\?[a-zA-Z0-9_=&%.-]*)?$~iD', trim($path)) || strlen($path) > 500) {
            $path = '/invalid-menu';
        }
        $menu = isset($_GET['menu']) && is_string($_GET['menu']) ? sanitize_text_field(wp_unslash($_GET['menu'])) : '';
        $modules = ['students', 'parents', 'exams', 'fees', 'elearning', 'timetable', 'attendance', 'hostel', 'staff', 'health', 'training', 'learner-support', 'voting', 'reports', 'safeguarding', 'document-designer'];
        $module = isset($_GET['module']) && in_array($_GET['module'], $modules, true) ? $_GET['module'] : 'users';
        // Hostel, Staff (with availability) and Lesson Notes run in their own build of the staff portal.
        $usesRebuiltPortal = in_array($module, ['hostel', 'staff'], true)
            || ($module === 'elearning' && preg_match('~/elearning/lesson-notes(?:[/?]|$)~', $path) === 1);
        $assetDirectory = $usesRebuiltPortal ? 'assets/rebuilt-v0172/' : match ($module) {
            'health' => 'assets/health-v017/',
            'training' => 'assets/training-v018/',
            'learner-support' => 'assets/learner-support-v019/',
            'voting' => 'assets/voting-v020/',
            'reports' => 'assets/reports-v021/',
            'safeguarding' => 'assets/safeguarding-v022/',
            'document-designer' => 'assets/document-designer-v022/',
            default => 'assets/user-management-v016/',
        };
        $html = file_get_contents(dirname($this->pluginFile) . '/' . $assetDirectory . 'index.html');
        if ($html === false) {
            wp_die(esc_html('The school portal application is missing. Install the complete plugin ZIP.'));
        }
        $configuration = wp_json_encode(
            [
                'restBase' => rest_url('em360/v1/'), 'initialPath' => trim($path), 'menuId' => $menu,
                'module' => $module, 'frontendBase' => $this->settings->get()->frontendUrl,
            ],
            JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT
        );
        $runtime = '<base href="' . esc_url(plugins_url($assetDirectory, $this->pluginFile)) . '">' .
            '<script id="em360-runtime" type="application/json">' . $configuration . '</script>';
        // The static document is built from the shipped React application; the inserted values are encoded above.
        echo str_replace('<!-- EM360_RUNTIME -->', $runtime, $html);
        exit;
    }
}
