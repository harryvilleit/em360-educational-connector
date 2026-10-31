<?php

declare(strict_types=1);

namespace EM360\ParentPortal;

use EM360\SchoolConnector\Domain\ConnectorException;
use EM360\SchoolConnector\Domain\ModuleRequest;
use EM360\SchoolConnector\Extension\Connector;

/** Serves the parent portal frame and forwards its operations to the EM360 parent gateway. */
final class ParentPortalController
{
    /** Parent screens the frame can open directly (paths below /parent-home/{school}). */
    private const SCREENS = [
        'profile', 'fees', 'timetable', 'calendar', 'results', 'attendance', 'electives', 'messages', 'chat',
        'visitation', 'consent', 'transcript', 'notifications', 'support', 'rate-school',
    ];
    private const ASSETS = 'assets/parent-portal-v027/';

    public function __construct(
        private readonly ParentPortal $portal,
        private readonly Connector $connector,
        private readonly string $pluginFile,
    ) {
    }

    public function register(): void
    {
        add_action('rest_api_init', [$this, 'routes']);
        add_action('admin_post_em360_parent_portal', [$this, 'frame']);
        add_action('admin_post_nopriv_em360_parent_portal', [$this, 'frame']);
    }

    public function routes(): void
    {
        register_rest_route('em360/v1', '/parent-portal/context', [
            'methods' => 'GET', 'callback' => [$this, 'context'], 'permission_callback' => [$this->connector->guard(), 'csrf'],
        ]);
        register_rest_route('em360/v1', '/parent-portal', [
            'methods' => 'POST', 'callback' => [$this, 'execute'], 'permission_callback' => [$this->connector->guard(), 'csrf'],
        ]);
    }

    public function context(): \WP_REST_Response|\WP_Error
    {
        nocache_headers();
        try {
            return new \WP_REST_Response($this->portal->context());
        } catch (\Throwable $error) {
            return $this->connector->errors()->rest($error);
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
            return $this->connector->errors()->rest($error);
        }
    }

    /** The public document contains only the local application shell. Every operation still needs a parent session. */
    public function frame(): void
    {
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- read-only shell; checked against the screen allow-list below.
        $requested = isset($_GET['path']) && is_string($_GET['path']) ? trim(wp_unslash($_GET['path']), "/ \t") : '';
        $path = in_array($requested, self::SCREENS, true) ? $requested : '';
        $this->connector->frame($this->pluginFile)->output(self::ASSETS, [
            'restBase' => rest_url('em360/v1/'), 'initialPath' => $path,
            'module' => 'parent-portal', 'frontendBase' => $this->connector->settings()->get()->frontendUrl,
        ]);
    }
}
