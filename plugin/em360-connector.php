<?php
/**
 * Plugin Name: EM360 School Connector
 * Description: Register or connect an EM360 school. Secure owner/staff sign-in, module navigation and a school overview.
 * Version: 0.28.1
 * Requires at least: 6.6
 * Requires PHP: 8.1
 * Author: HarryVille Solutions Ltd
 * License: GPL-2.0-or-later
 * Text Domain: em360-educational-management
 * Update URI: https://em360s.com/wordpress/em360-connector
 */
declare(strict_types=1);

if (!defined('ABSPATH')) {
    exit;
}

define('EM360_CONNECTOR_VERSION', '0.28.1');
define('EM360_CONNECTOR_FILE', __FILE__);
require_once __DIR__ . '/vendor/autoload.php';

// wp_salt() and the other pluggable WordPress functions load after active plugins.
add_action('plugins_loaded', static function (): void {
    // Unsupported sites keep the plugin active but idle, with a notice explaining what is missing.
    $problems = \EM360\SchoolConnector\Bootstrap\Requirements::problems();
    if ($problems !== []) {
        \EM360\SchoolConnector\Bootstrap\Requirements::notify($problems);
        return;
    }
    (new \EM360\SchoolConnector\Bootstrap\PluginFactory())->create(EM360_CONNECTOR_FILE, EM360_CONNECTOR_VERSION)->register();
});
