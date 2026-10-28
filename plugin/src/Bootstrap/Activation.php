<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Bootstrap;

final class Activation
{
    public static function check(): void
    {
        if (is_multisite()) {
            wp_die('Phase 1 supports a single WordPress site. Multisite support will follow separately.');
        }
        if (!extension_loaded('openssl')) {
            wp_die('EM360 requires the PHP OpenSSL extension for encrypted credential storage.');
        }
    }
}
