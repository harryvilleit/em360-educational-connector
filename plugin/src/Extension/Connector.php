<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Extension;

use EM360\SchoolConnector\Contracts\BrowserSessionStoreInterface;
use EM360\SchoolConnector\Contracts\ClockInterface;
use EM360\SchoolConnector\Contracts\ConnectionStoreInterface;
use EM360\SchoolConnector\Contracts\SettingsStoreInterface;
use EM360\SchoolConnector\Contracts\UserManagementGatewayInterface;
use EM360\SchoolConnector\Infrastructure\Http\UserManagementApi;
use EM360\SchoolConnector\Infrastructure\WordPress\WordPressHttpClient;
use EM360\SchoolConnector\Presentation\AppFrame;
use EM360\SchoolConnector\Presentation\ErrorResponder;
use EM360\SchoolConnector\Presentation\RequestGuard;

/**
 * What EM360 add-on plugins (such as EM360 Student Portal) may use from this plugin.
 *
 * Passed to the `em360_connector_loaded` action once all plugins have loaded. Add-ons reuse the school
 * connection, browser sessions and server-side gateway set up here, so a school connects only once.
 */
final class Connector
{
    /** Raised when this API changes incompatibly. */
    public const API_VERSION = 1;

    public function __construct(
        private readonly SettingsStoreInterface $settings,
        private readonly ConnectionStoreInterface $connections,
        private readonly BrowserSessionStoreInterface $sessions,
        private readonly ClockInterface $clock,
        private readonly RequestGuard $guard,
        private readonly ErrorResponder $errors,
        private readonly string $pluginFile,
        private readonly string $version,
    ) {
    }

    public function version(): string
    {
        return $this->version;
    }

    public function settings(): SettingsStoreInterface
    {
        return $this->settings;
    }

    public function connections(): ConnectionStoreInterface
    {
        return $this->connections;
    }

    public function sessions(): BrowserSessionStoreInterface
    {
        return $this->sessions;
    }

    public function clock(): ClockInterface
    {
        return $this->clock;
    }

    /** Same-origin and CSRF checks for REST routes, as used by this plugin's own routes. */
    public function guard(): RequestGuard
    {
        return $this->guard;
    }

    public function errors(): ErrorResponder
    {
        return $this->errors;
    }

    /**
     * A gateway to one EM360 portal API ("student-portal" or "user-management") that forwards only the
     * operations in `$routes`, the add-on's own operation catalogue.
     *
     * @param array<int, array<string, mixed>> $routes
     */
    public function gateway(string $portal, array $routes): UserManagementGatewayInterface
    {
        return new UserManagementApi(new WordPressHttpClient(), $this->settings, $routes, $portal);
    }

    /** Serves a React application shipped in the add-on (`$addOnFile` is the add-on's main file). */
    public function frame(string $addOnFile): AppFrame
    {
        return new AppFrame($addOnFile, dirname($this->pluginFile) . '/templates/frame.php');
    }

    /** The portal page stylesheet, shared by the portal pages of this plugin and its add-ons. */
    public function stylesheetUrl(): string
    {
        return plugins_url('assets/portal.css', $this->pluginFile);
    }
}
