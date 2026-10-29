<?php
/**
 * Plugin Name: EM360 School Connector
 * Description: Register or connect an EM360 school. Secure owner/staff sign-in, module navigation and a school overview.
 * Version: 0.26.1
 * Requires at least: 6.6
 * Requires PHP: 8.1
 * Author: HarryVille Solutions Ltd
 * License: GPL-2.0-or-later
 * Text Domain: em360-connector
 * Update URI: https://em360s.com/wordpress/em360-connector
 */
declare(strict_types=1);

if (!defined('ABSPATH')) {
    exit;
}

define('EM360_CONNECTOR_VERSION', '0.26.1');
define('EM360_CONNECTOR_FILE', __FILE__);
require_once __DIR__ . '/vendor/autoload.php';

register_activation_hook(__FILE__, [\EM360\SchoolConnector\Bootstrap\Activation::class, 'check']);
// wp_salt() and the other pluggable WordPress functions load after active plugins.
add_action('plugins_loaded', static function (): void {
    (new \EM360\SchoolConnector\Bootstrap\PluginFactory())->create(EM360_CONNECTOR_FILE, EM360_CONNECTOR_VERSION)->register();
});
