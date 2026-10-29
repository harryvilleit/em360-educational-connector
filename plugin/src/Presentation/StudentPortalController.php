<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Presentation;

use EM360\SchoolConnector\Application\StudentPortal;
use EM360\SchoolConnector\Contracts\SettingsStoreInterface;
use EM360\SchoolConnector\Domain\ConnectorException;
use EM360\SchoolConnector\Domain\ModuleRequest;

/** Serves the student portal frame and forwards its operations to the EM360 student gateway. */
final class StudentPortalController
{
    /** Student screens the frame can open directly (paths below /student-home/{school}). */
    private const SCREENS = [
        'chat', 'profile', 'timetable', 'calendar', 'results', 'subjects', 'attendance', 'support', 'hostel',
        'health', 'cafeteria', 'library', 'elearning', 'voting', 'rate-school', 'lifelab',
    ];
    private const ASSETS = 'assets/student-portal-v024/';

    public function __construct(
        private readonly StudentPortal $portal,
        private readonly RequestGuard $guard,
        private readonly ErrorResponder $errors,
        private readonly string $pluginFile,
        private readonly SettingsStoreInterface $settings,
    ) {
    }

    public function register(): void
    {
        add_action('rest_api_init', [$this, 'routes']);
        add_action('admin_post_em360_student_portal', [$this, 'frame']);
        add_action('admin_post_nopriv_em360_student_portal', [$this, 'frame']);
    }

    public function routes(): void
    {
        register_rest_route('em360/v1', '/student-portal/context', [
            'methods' => 'GET', 'callback' => [$this, 'context'], 'permission_callback' => [$this->guard, 'csrf'],
        ]);
        register_rest_route('em360/v1', '/student-portal', [
            'methods' => 'POST', 'callback' => [$this, 'execute'], 'permission_callback' => [$this->guard, 'csrf'],
        ]);
    }

    public function context(): \WP_REST_Response|\WP_Error
    {
        nocache_headers();
        try {
            return new \WP_REST_Response($this->portal->context());
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
            return new \WP_REST_Response($this->portal->execute(ModuleRequest::fromArray($request->get_json_params())));
        } catch (\Throwable $error) {
            return $this->errors->rest($error);
        }
    }

    /** The public document contains only the local application shell. Every operation still needs a student session. */
    public function frame(): void
    {
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- read-only shell; checked against the screen allow-list below.
        $requested = isset($_GET['path']) && is_string($_GET['path']) ? trim(wp_unslash($_GET['path']), "/ \t") : '';
        $path = in_array($requested, self::SCREENS, true) ? $requested : '';
        (new AppFrame($this->pluginFile))->output(self::ASSETS, [
            'restBase' => rest_url('em360/v1/'), 'initialPath' => $path,
            'module' => 'student-portal', 'frontendBase' => $this->settings->get()->frontendUrl,
        ]);
    }
}
