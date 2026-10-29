<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Infrastructure\WordPress;

use EM360\SchoolConnector\Contracts\SettingsStoreInterface;
use EM360\SchoolConnector\Domain\ConnectorException;
use EM360\SchoolConnector\Domain\PluginRelease;
use EM360\SchoolConnector\Domain\UrlPolicy;

/**
 * Offers signed EM360 releases through the standard WordPress update screens ("Update now", bulk updates and the
 * per-plugin auto-update toggle). The plugin header's Update URI keeps WordPress.org out of the check, the
 * release comes from the configured School API, and every package is verified before WordPress installs it.
 */
final class PluginUpdater
{
    /** Must match the host in the plugin header's "Update URI". */
    public const UPDATE_HOST = 'em360s.com';
    private const CACHE = 'em360_connector_release';

    public function __construct(
        private readonly SettingsStoreInterface $settings,
        private readonly string $pluginFile,
        private readonly string $version,
    ) {
    }

    public function register(): void
    {
        if ($this->publicKey() === '') {
            return; // Development builds without a release key never update themselves.
        }
        add_filter('update_plugins_' . self::UPDATE_HOST, [$this, 'offer'], 10, 3);
        add_filter('plugins_api', [$this, 'details'], 10, 3);
        add_filter('upgrader_pre_download', [$this, 'download'], 10, 4);
        add_action('upgrader_process_complete', static fn () => delete_site_transient(self::CACHE));
    }

    /**
     * @param array<string, mixed>|false $update
     * @param array<string, mixed> $pluginData
     * @return array<string, mixed>|false
     */
    public function offer(array|false $update, array $pluginData, string $pluginFile): array|false
    {
        if ($pluginFile !== $this->basename()) {
            return $update;
        }
        // Dashboard › Updates › "Check again" adds force-check; it only bypasses the cached release check.
        $release = $this->release(!empty($_GET['force-check'])); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        if ($release === null) {
            return $update;
        }
        return [
            'id' => $this->basename(),
            'slug' => PluginRelease::SLUG,
            'plugin' => $this->basename(),
            'version' => $release->version,
            'new_version' => $release->version,
            'url' => $this->settings->get()->frontendUrl,
            'package' => $release->isNewerThan($this->version) ? $release->package : '',
            'requires' => $release->requires,
            'requires_php' => $release->requiresPhp,
            'tested' => $release->tested,
            'icons' => [], 'banners' => [], 'translations' => [],
        ];
    }

    public function details(mixed $result, string $action, object $args): mixed
    {
        if ($action !== 'plugin_information' || ($args->slug ?? '') !== PluginRelease::SLUG) {
            return $result;
        }
        $release = $this->release(false);
        if ($release === null) {
            return $result;
        }
        return (object) [
            'name' => 'EM360 School Connector',
            'slug' => PluginRelease::SLUG,
            'version' => $release->version,
            'author' => 'HarryVille Solutions Ltd',
            'homepage' => $this->settings->get()->frontendUrl,
            'requires' => $release->requires,
            'requires_php' => $release->requiresPhp,
            'tested' => $release->tested,
            'last_updated' => $release->releasedAt,
            'download_link' => $release->package,
            'sections' => [
                'changelog' => $release->changelog !== '' ? wpautop(esc_html($release->changelog)) : '<p>See the readme included with the plugin.</p>',
            ],
        ];
    }

    /**
     * Downloads the package for this plugin only after re-reading and verifying the signed release.
     *
     * @param array<string, mixed> $hookExtra
     */
    public function download(mixed $reply, string $package, object $upgrader, array $hookExtra = []): mixed
    {
        if ($reply !== false || ($hookExtra['plugin'] ?? '') !== $this->basename()) {
            return $reply;
        }
        try {
            $release = $this->release(true);
            if ($release === null || !$release->isNewerThan($this->version)) {
                throw new ConnectorException('No newer signed EM360 plugin release is available.', 409, 'em360_release_none');
            }
            if (!function_exists('download_url')) {
                require_once ABSPATH . 'wp-admin/includes/file.php';
            }
            $file = download_url($release->package, 300);
            if (is_wp_error($file)) {
                return $file;
            }
            try {
                $release->requirePackage($file);
            } catch (ConnectorException $error) {
                wp_delete_file($file);
                throw $error;
            }
            return $file;
        } catch (ConnectorException $error) {
            return new \WP_Error($error->errorCode, $error->getMessage());
        }
    }

    private function release(bool $fresh): ?PluginRelease
    {
        $cached = $fresh ? false : get_site_transient(self::CACHE);
        if (!is_array($cached)) {
            $cached = $this->fetch();
            // Failures are remembered briefly so an unreachable API never slows the admin screens.
            set_site_transient(self::CACHE, $cached, $cached === [] ? HOUR_IN_SECONDS : 6 * HOUR_IN_SECONDS);
        }
        if ($cached === []) {
            return null;
        }
        try {
            return PluginRelease::fromManifest($cached, $this->publicKey());
        } catch (ConnectorException) {
            return null;
        }
    }

    /** @return array<string, mixed> */
    private function fetch(): array
    {
        $url = $this->manifestUrl();
        if ($url === '') {
            return [];
        }
        $response = wp_safe_remote_get($url, [
            'timeout' => 10, 'redirection' => 0, 'limit_response_size' => 65536,
            'headers' => ['Accept' => 'application/json'],
            'user-agent' => 'EM360-School-Connector/' . $this->version . '; ' . home_url('/'),
        ]);
        if (is_wp_error($response) || (int) wp_remote_retrieve_response_code($response) !== 200) {
            return [];
        }
        $data = json_decode(wp_remote_retrieve_body($response), true);
        if (!is_array($data)) {
            return [];
        }
        try {
            PluginRelease::fromManifest($data, $this->publicKey());
        } catch (ConnectorException) {
            return []; // Never cache an unsigned or altered response as a release.
        }
        return $data;
    }

    private function manifestUrl(): string
    {
        $override = defined('EM360_CONNECTOR_UPDATE_URL') ? (string) constant('EM360_CONNECTOR_UPDATE_URL') : '';
        if ($override !== '') {
            return UrlPolicy::isHttps($override) ? $override : '';
        }
        $api = $this->settings->get()->apiUrl;
        return UrlPolicy::isHttps($api) ? rtrim($api, '/') . '/WordPress/plugin/release' : '';
    }

    private function publicKey(): string
    {
        $file = dirname($this->pluginFile) . '/resources/release-public-key.txt';
        return is_readable($file) ? trim((string) file_get_contents($file)) : ''; // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- local plugin file
    }

    private function basename(): string
    {
        return plugin_basename($this->pluginFile);
    }
}
