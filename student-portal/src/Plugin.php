<?php

declare(strict_types=1);

namespace EM360\StudentPortal;

use EM360\SchoolConnector\Extension\Connector;

/** Wires the student portal into the EM360 School Connector plugin. */
final class Plugin
{
    /** The connector extension API this add-on was written for. */
    private const CONNECTOR_API = 1;

    public function __construct(private readonly object $connector, private readonly string $pluginFile, private readonly string $version)
    {
    }

    public function register(): void
    {
        if (!$this->connector instanceof Connector || $this->connector::API_VERSION !== self::CONNECTOR_API) {
            add_action('admin_notices', static function (): void {
                if (current_user_can('activate_plugins')) {
                    echo '<div class="notice notice-warning"><p>' . esc_html('EM360 Student Portal does not support the installed version of EM360 School Connector. Update both plugins.') . '</p></div>';
                }
            });
            return;
        }
        $routes = wp_json_file_decode(dirname($this->pluginFile) . '/resources/student-portal-routes.json', ['associative' => true]);
        if (!is_array($routes)) {
            return;
        }
        $portal = new StudentPortal(
            $this->connector->gateway('student-portal', $routes),
            $this->connector->sessions(),
            $this->connector->connections(),
            $this->connector->clock(),
        );
        (new StudentPortalController($portal, $this->connector, $this->pluginFile))->register();
        (new StudentPortalShortcode($this->connector, $this->pluginFile, $this->version))->register();
        // Shows step 4 (Publish the student portal) on the EM360 setup screen.
        add_filter('em360_connector_student_portal', '__return_true');
    }
}
