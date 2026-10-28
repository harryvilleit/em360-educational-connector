<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Domain;

final class UrlPolicy
{
    public static function isHttps(string $url): bool
    {
        $parts = parse_url($url);
        return is_array($parts) && ($parts['scheme'] ?? '') === 'https' && !empty($parts['host'])
            && !isset($parts['user']) && !isset($parts['pass'])
            && !isset($parts['query']) && !isset($parts['fragment']) && filter_var($url, FILTER_VALIDATE_URL) !== false;
    }

    public static function origin(string $url): string
    {
        $parts = parse_url($url);
        if (!is_array($parts) || empty($parts['scheme']) || empty($parts['host'])) {
            return '';
        }
        $scheme = strtolower($parts['scheme']);
        $port = $parts['port'] ?? ($scheme === 'https' ? 443 : 80);
        $suffix = ($scheme === 'https' && $port === 443) || ($scheme === 'http' && $port === 80) ? '' : ':' . $port;
        return $scheme . '://' . strtolower($parts['host']) . $suffix;
    }

    public static function requireCallback(string $site, string $callback): void
    {
        $parts = parse_url($callback);
        if (
            !self::isHttps($site) || !is_array($parts) || ($parts['scheme'] ?? '') !== 'https'
            || isset($parts['user']) || isset($parts['pass']) || isset($parts['fragment'])
            || self::origin($site) !== self::origin($callback)
            || !str_ends_with($parts['path'] ?? '', '/wp-admin/admin-post.php')
            || ($parts['query'] ?? '') !== 'action=em360_callback'
        ) {
            throw new ConnectorException('The callback must use HTTPS on this WordPress website.');
        }
    }
}
