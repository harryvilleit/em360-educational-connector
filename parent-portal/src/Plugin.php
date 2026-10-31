<?php

declare(strict_types=1);

namespace EM360\ParentPortal;

use EM360\SchoolConnector\Extension\Connector;

/** Wires the parent portal into the EM360 School Connector plugin. */
final class Plugin
{
    /** The connector extension API this add-on was written for. */
    private const CONNECTOR_API = 1;

    public function __construct(private readonly object $connector, private readonly string $pluginFile, private readonly string $version)
    {
    }

    public function register(): void
    {
        if (!$this->connector instanceof Connector || $this->connector::API_VERSION !== self::CONNECTOR_API
            || !defined(Connector::class . '::PORTALS') || !in_array('parent-portal', Connector::PORTALS, true)) {
            add_action('admin_notices', static function (): void {
                if (current_user_can('activate_plugins')) {
                    echo '<div class="notice notice-warning"><p>' . esc_html('EM360 Parent Portal needs EM360 School Connector 0.28 or later. Update both plugins.') . '</p></div>';
                }
            });
            return;
        }
        $routes = wp_json_file_decode(dirname($this->pluginFile) . '/resources/parent-portal-routes.json', ['associative' => true]);
        if (!is_array($routes)) {
            return;
        }
        $portal = new ParentPortal(
            $this->connector->gateway('parent-portal', $routes),
            $this->connector->sessions(),
            $this->connector->connections(),
            $this->connector->clock(),
        );
        (new ParentPortalController($portal, $this->connector, $this->pluginFile))->register();
        (new ParentPortalShortcode($this->connector, $this->pluginFile, $this->version))->register();
        // Shows the "Publish the parent portal" step on the EM360 setup screen.
        add_filter('em360_connector_parent_portal', '__return_true');
    }
}
