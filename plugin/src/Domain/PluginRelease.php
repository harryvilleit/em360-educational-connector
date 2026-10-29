<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Domain;

/**
 * A plugin release advertised by the EM360 School API. Only releases signed with the EM360 release key are
 * accepted, so a changed API response or package host cannot install code on the school's website.
 */
final class PluginRelease
{
    public const SLUG = 'em360-connector';

    private function __construct(
        public readonly string $version,
        public readonly string $package,
        public readonly string $sha256,
        public readonly string $requires,
        public readonly string $requiresPhp,
        public readonly string $tested,
        public readonly string $releasedAt,
        public readonly string $changelog,
    ) {
    }

    /** The exact bytes the release tool signs. */
    public static function signedMessage(string $version, string $sha256): string
    {
        return self::SLUG . "\n" . $version . "\n" . strtolower($sha256);
    }

    /**
     * @param array<string, mixed> $data
     * @throws ConnectorException when the manifest is malformed or not signed with the release key.
     */
    public static function fromManifest(array $data, string $publicKey): self
    {
        $text = static fn (string $key, int $max = 200): string =>
            is_string($data[$key] ?? null) && strlen($data[$key]) <= $max ? trim($data[$key]) : '';
        $version = $text('version', 20);
        $package = $text('package', 2000);
        $sha256 = strtolower($text('sha256', 64));
        $signature = base64_decode($text('signature', 100), true);
        if (
            ($data['slug'] ?? self::SLUG) !== self::SLUG
            || !preg_match('/^[0-9]+\.[0-9]+\.[0-9]+$/D', $version)
            || !UrlPolicy::isHttps($package) && !self::isHttpsWithQuery($package)
            || !preg_match('/^[a-f0-9]{64}$/D', $sha256)
            || $signature === false || strlen($signature) !== 64
        ) {
            throw new ConnectorException('The EM360 plugin release information is invalid.', 502, 'em360_release_invalid');
        }
        self::requireSignature(self::signedMessage($version, $sha256), $signature, $publicKey);
        $versionText = static fn (string $key): string => preg_match('/^[0-9]+(?:\.[0-9]+){0,2}$/D', $text($key, 20)) ? $text($key, 20) : '';
        return new self(
            $version,
            $package,
            $sha256,
            $versionText('requires'),
            $versionText('requiresPhp'),
            $versionText('tested'),
            $text('releasedAtUtc', 40),
            $text('changelog', 20000),
        );
    }

    public function isNewerThan(string $installed): bool
    {
        return version_compare($this->version, $installed, '>');
    }

    /** @throws ConnectorException when the downloaded package is not the signed one. */
    public function requirePackage(string $file): void
    {
        $hash = is_file($file) ? hash_file('sha256', $file) : false;
        if (!is_string($hash) || !hash_equals($this->sha256, $hash)) {
            throw new ConnectorException('The downloaded EM360 plugin package failed its integrity check and was not installed.', 502, 'em360_release_tampered');
        }
    }

    private static function requireSignature(string $message, string $signature, string $publicKey): void
    {
        $key = base64_decode(trim($publicKey), true);
        if ($key === false || strlen($key) !== 32) {
            throw new ConnectorException('The plugin release key is missing.', 500, 'em360_release_key');
        }
        if (!function_exists('sodium_crypto_sign_verify_detached') && defined('ABSPATH') && defined('WPINC')
            && is_file(ABSPATH . WPINC . '/sodium_compat/autoload.php')) {
            require_once ABSPATH . WPINC . '/sodium_compat/autoload.php';
        }
        try {
            $valid = function_exists('sodium_crypto_sign_verify_detached') && sodium_crypto_sign_verify_detached($signature, $message, $key);
        } catch (\Throwable) {
            $valid = false;
        }
        if (!$valid) {
            throw new ConnectorException('The EM360 plugin release is not signed by EM360 and was ignored.', 502, 'em360_release_unsigned');
        }
    }

    /** Signed storage links (for example an Azure SAS URL) carry a query string. */
    private static function isHttpsWithQuery(string $url): bool
    {
        $parts = wp_parse_url($url);
        return is_array($parts) && isset($parts['query']) && !isset($parts['fragment'])
            && UrlPolicy::isHttps(substr($url, 0, (int) strpos($url, '?')));
    }
}
