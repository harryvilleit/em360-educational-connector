<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Presentation;

use EM360\SchoolConnector\Application\GetPortalBootstrap;
use EM360\SchoolConnector\Application\GetSchoolDashboard;
use EM360\SchoolConnector\Application\SignOut;
use EM360\SchoolConnector\Application\StartAuthorization;
use EM360\SchoolConnector\Domain\AuthorizationPurpose;
use EM360\SchoolConnector\Domain\PortalAudience;

final class PortalRestController extends \WP_REST_Controller
{
    public function __construct(
        private readonly GetPortalBootstrap $bootstrap,
        private readonly GetSchoolDashboard $dashboard,
        private readonly StartAuthorization $start,
        private readonly SignOut $signOut,
        private readonly RequestGuard $guard,
        private readonly ErrorResponder $errors,
    ) {
        $this->namespace = 'em360/v1';
    }

    public function register(): void
    {
        add_action('rest_api_init', [$this, 'register_routes']);
        add_filter('rest_post_dispatch', [$this, 'headers'], 10, 3);
    }

    // WordPress defines this inherited method name.
    // phpcs:ignore PSR1.Methods.CamelCapsMethodName.NotCamelCaps
    public function register_routes(): void
    {
        foreach (['bootstrap' => 'GET', 'login' => 'POST', 'dashboard' => 'GET', 'logout' => 'POST'] as $path => $method) {
            register_rest_route($this->namespace, '/' . $path, [
                'methods' => $method,
                'callback' => [$this, $path === 'bootstrap' ? 'boot' : $path],
                'permission_callback' => [$this->guard, $path === 'bootstrap' ? 'sameOrigin' : 'csrf'],
            ]);
        }
    }

    /** @param \WP_REST_Request<array<string, mixed>> $request */
    public function boot(\WP_REST_Request $request): \WP_REST_Response|\WP_Error
    {
        return $this->respond(fn (): array => $this->bootstrap->execute(self::audience($request)));
    }

    /** @param \WP_REST_Request<array<string, mixed>> $request */
    public function login(\WP_REST_Request $request): \WP_REST_Response|\WP_Error
    {
        return $this->respond(fn (): array => ['authorizeUrl' => $this->start->execute(AuthorizationPurpose::Login, 0, false, self::audience($request))]);
    }

    /** @param \WP_REST_Request<array<string, mixed>> $request */
    private static function audience(\WP_REST_Request $request): PortalAudience
    {
        return $request->get_param('audience') === 'student' ? PortalAudience::Student : PortalAudience::Staff;
    }

    public function dashboard(): \WP_REST_Response|\WP_Error
    {
        return $this->respond(fn (): array => $this->dashboard->execute());
    }

    public function logout(): \WP_REST_Response|\WP_Error
    {
        return $this->respond(fn (): array => $this->signOut->execute());
    }

    /** @param \WP_REST_Request<array<string, mixed>> $request */
    public function headers(\WP_HTTP_Response $response, \WP_REST_Server $server, \WP_REST_Request $request): \WP_HTTP_Response
    {
        if (str_starts_with($request->get_route(), '/' . $this->namespace . '/')) {
            $response->header('Cache-Control', 'no-store, private, max-age=0');
            $response->header('Vary', 'Cookie, Origin');
            $response->header('Referrer-Policy', 'no-referrer');
        }
        return $response;
    }

    /** @param callable(): array<string, mixed> $operation */
    private function respond(callable $operation): \WP_REST_Response|\WP_Error
    {
        nocache_headers();
        try {
            return new \WP_REST_Response($operation());
        } catch (\Throwable $error) {
            return $this->errors->rest($error);
        }
    }
}
