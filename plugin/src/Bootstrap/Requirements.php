<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Bootstrap;

/**
 * Checks what the plugin needs before it starts. The plugin always activates; when something is missing it stays
 * idle and tells administrators why, instead of stopping the activation.
 */
final class Requirements
{
    /** @return list<string> Problems that stop the plugin from running on this site. */
    public static function problems(): array
    {
        $problems = [];
        if (is_multisite()) {
            $problems[] = __('EM360 School Connector supports single-site WordPress installations only, so it is not running on this multisite network.', 'em360-educational-management');
        }
        if (!extension_loaded('openssl')) {
            $problems[] = __('EM360 School Connector needs the PHP OpenSSL extension to store school credentials securely, so it is not running. Ask your hosting provider to enable OpenSSL.', 'em360-educational-management');
        }
        return $problems;
    }

    /** @param list<string> $problems */
    public static function notify(array $problems): void
    {
        add_action('admin_notices', static function () use ($problems): void {
            if (!current_user_can('activate_plugins')) {
                return;
            }
            foreach ($problems as $problem) {
                echo '<div class="notice notice-warning"><p>' . esc_html($problem) . '</p></div>';
            }
        });
    }
}
