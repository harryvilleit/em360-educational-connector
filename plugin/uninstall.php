<?php
declare(strict_types=1);
if (!defined('WP_UNINSTALL_PLUGIN')) { exit; }
// Central records and the owner's published portal page are intentionally retained.
// Disconnect or revoke the website in EM360 before uninstalling to revoke remote access.
delete_option('em360_connector_settings');
delete_option('em360_connector_connection');
global $wpdb;
// The plugin's encrypted session transients have per-session names, so they are removed by prefix;
// WordPress has no API for that. This runs once, on uninstall.
foreach (['_transient_em360_', '_transient_timeout_em360_'] as $em360_prefix) {
    $wpdb->query($wpdb->prepare("DELETE FROM {$wpdb->options} WHERE option_name LIKE %s", $wpdb->esc_like($em360_prefix) . '%')); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
}
