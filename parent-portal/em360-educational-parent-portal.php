<?php
/**
 * Plugin Name: EM360 Parent Portal
 * Description: Adds the EM360 parent portal to your school website: parents sign in with their EM360 account to follow their children — fees and payments, results, attendance, timetable, consent and chat.
 * Version: 1.0.0
 * Requires at least: 6.6
 * Requires PHP: 8.1
 * Requires Plugins: em360-educational-management
 * Author: HarryVille Solutions Ltd
 * License: GPL-2.0-or-later
 * Text Domain: em360-educational-parent-portal
 */
declare(strict_types=1);

if (!defined('ABSPATH')) {
    exit;
}

define('EM360_PARENT_PORTAL_VERSION', '1.0.0');
define('EM360_PARENT_PORTAL_FILE', __FILE__);

spl_autoload_register(static function (string $class): void {
    $prefix = 'EM360\\ParentPortal\\';
    if (str_starts_with($class, $prefix)) {
        $file = __DIR__ . '/src/' . str_replace('\\', '/', substr($class, strlen($prefix))) . '.php';
        if (is_readable($file)) {
            require $file;
        }
    }
});

// The EM360 School Connector plugin hands over its school connection, sessions and gateway here.
add_action('em360_connector_loaded', static function (object $connector): void {
    (new \EM360\ParentPortal\Plugin($connector, EM360_PARENT_PORTAL_FILE, EM360_PARENT_PORTAL_VERSION))->register();
});
add_action('admin_notices', static function (): void {
    if (!did_action('em360_connector_loaded') && current_user_can('activate_plugins')) {
        echo '<div class="notice notice-warning"><p>' . esc_html('EM360 Parent Portal needs the EM360 School Connector plugin (version 0.28 or later) to be installed and active.') . '</p></div>';
    }
});
