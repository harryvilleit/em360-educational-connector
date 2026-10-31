<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Bootstrap;

use EM360\SchoolConnector\Application\CompleteAuthorization;
use EM360\SchoolConnector\Application\CreatePortalPage;
use EM360\SchoolConnector\Application\DisconnectSchool;
use EM360\SchoolConnector\Application\GetPortalBootstrap;
use EM360\SchoolConnector\Application\GetSchoolDashboard;
use EM360\SchoolConnector\Application\SaveSettings;
use EM360\SchoolConnector\Application\SignOut;
use EM360\SchoolConnector\Application\StartAuthorization;
use EM360\SchoolConnector\Application\UserManagement;
use EM360\SchoolConnector\Extension\Connector;
use EM360\SchoolConnector\Infrastructure\Http\UserManagementApi;
use EM360\SchoolConnector\Presentation\UserManagementController;
use EM360\SchoolConnector\Infrastructure\Http\Em360ApiClient;
use EM360\SchoolConnector\Infrastructure\Security\OpenSslCredentialCipher;
use EM360\SchoolConnector\Infrastructure\Security\SecureTokenGenerator;
use EM360\SchoolConnector\Infrastructure\Storage\BrowserSessionStore;
use EM360\SchoolConnector\Infrastructure\Storage\PendingRequestStore;
use EM360\SchoolConnector\Infrastructure\SystemClock;
use EM360\SchoolConnector\Infrastructure\WordPress\EncryptedTransientStore;
use EM360\SchoolConnector\Infrastructure\WordPress\OptionConnectionStore;
use EM360\SchoolConnector\Infrastructure\WordPress\OptionSettingsStore;
use EM360\SchoolConnector\Infrastructure\WordPress\SecureCookieJar;
use EM360\SchoolConnector\Infrastructure\WordPress\PluginUpdater;
use EM360\SchoolConnector\Infrastructure\WordPress\WordPressHttpClient;
use EM360\SchoolConnector\Infrastructure\WordPress\WordPressPortalPages;
use EM360\SchoolConnector\Infrastructure\WordPress\WordPressWebsiteContext;
use EM360\SchoolConnector\Presentation\AdminController;
use EM360\SchoolConnector\Presentation\AdminGuard;
use EM360\SchoolConnector\Presentation\AdminNotices;
use EM360\SchoolConnector\Presentation\CallbackController;
use EM360\SchoolConnector\Presentation\ErrorResponder;
use EM360\SchoolConnector\Presentation\Navigation;
use EM360\SchoolConnector\Presentation\PortalRestController;
use EM360\SchoolConnector\Presentation\PortalShortcode;
use EM360\SchoolConnector\Presentation\PortalPageLayout;
use EM360\SchoolConnector\Presentation\RequestGuard;
use EM360\SchoolConnector\Presentation\TemplateRenderer;

/** The only composition root: dependencies are passed explicitly, never located by services. */
final class PluginFactory
{
    public function create(string $pluginFile, string $version): Plugin
    {
        $clock = new SystemClock();
        $tokens = new SecureTokenGenerator();
        $cipher = new OpenSslCredentialCipher(wp_salt('auth'));
        $settings = new OptionSettingsStore();
        $connections = new OptionConnectionStore($cipher);
        $storage = new EncryptedTransientStore($cipher);
        $sessions = new BrowserSessionStore($storage, new SecureCookieJar(), $tokens, $clock);
        $pending = new PendingRequestStore($storage);
        $website = new WordPressWebsiteContext();
        $pages = new WordPressPortalPages();
        $api = new Em360ApiClient(new WordPressHttpClient(), $settings);
        $start = new StartAuthorization($api, $api, $settings, $connections, $sessions, $pending, $tokens, $website);
        $complete = new CompleteAuthorization($api, $connections, $sessions, $pending, $clock);
        $views = new TemplateRenderer(dirname($pluginFile) . '/templates');
        $notices = new AdminNotices();
        $navigation = new Navigation($notices, $settings, $pages);
        $errors = new ErrorResponder();
        $guard = new RequestGuard($sessions, $website);

        return new Plugin(
            new AdminController(
                new SaveSettings($settings, $connections),
                $start,
                new DisconnectSchool($api, $connections),
                new CreatePortalPage($settings, $pages),
                $settings,
                $connections,
                $pages,
                new AdminGuard(),
                $notices,
                $navigation,
                $views,
                $errors,
                $pluginFile,
                $version,
            ),
            new CallbackController($complete, $navigation, $errors),
            new PortalRestController(
                new GetPortalBootstrap($sessions, $connections, $clock),
                new GetSchoolDashboard($api, $sessions, $connections, $clock),
                $start,
                new SignOut($api, $sessions),
                new RequestGuard($sessions, $website),
                $errors,
            ),
            new PortalShortcode($views, $pluginFile, $version),
            new UserManagementController(
                new UserManagement(
                    new UserManagementApi(new WordPressHttpClient(), $settings, self::catalogue(dirname($pluginFile) . '/resources/user-management-routes.json')),
                    $sessions,
                    $connections,
                    $clock,
                ),
                new RequestGuard($sessions, $website),
                $errors,
                $pluginFile,
                $settings,
            ),
            new PortalPageLayout(dirname($pluginFile) . '/templates/workspace.php'),
            // Add-ons (such as EM360 Student Portal) build on the connection, sessions and gateway set up here.
            new Connector($settings, $connections, $sessions, $clock, $guard, $errors, $pluginFile, $version),
            // The WordPress.org build ships without the self-updater and updates through WordPress.org.
            class_exists(PluginUpdater::class) ? new PluginUpdater($settings, $pluginFile, $version) : null,
        );
    }

    /** @return array<int, array<string, mixed>> The operation catalogue shipped with the plugin. */
    private static function catalogue(string $file): array
    {
        $routes = wp_json_file_decode($file, ['associative' => true]);
        if (!is_array($routes)) {
            throw new \RuntimeException('A plugin operation catalogue is missing or invalid. Reinstall the plugin.');
        }
        return $routes;
    }
}
