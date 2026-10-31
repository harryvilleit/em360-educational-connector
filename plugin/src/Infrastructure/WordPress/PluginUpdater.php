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
    private const HOMEPAGE = 'https://em360s.com';

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
        add_filter('upgrader_source_selection', [$this, 'keepFolder'], 10, 4);
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
            'slug' => $this->slug(),
            'plugin' => $this->basename(),
            'version' => $release->version,
            'new_version' => $release->version,
            'url' => $this->settings->get()->frontendUrl,
            'package' => $release->isNewerThan($this->version) ? $release->package : '',
            'requires' => $release->requires,
            'requires_php' => $release->requiresPhp,
            'tested' => $this->tested($release),
            'icons' => $this->icons(), 'banners' => $this->banners(), 'translations' => [],
        ];
    }

    public function details(mixed $result, string $action, object $args): mixed
    {
        if ($action !== 'plugin_information' || ($args->slug ?? '') !== $this->slug()) {
            return $result;
        }
        $release = $this->release(false);
        if ($release === null) {
            return $result;
        }
        $readme = $this->readme();
        return (object) [
            'name' => 'EM360 School Connector',
            'slug' => $this->slug(),
            'version' => $release->version,
            'author' => '<a href="' . esc_url(self::HOMEPAGE) . '">HarryVille Solutions Ltd</a>',
            'author_profile' => self::HOMEPAGE,
            'homepage' => self::HOMEPAGE,
            'short_description' => $readme->summary(),
            'requires' => $release->requires,
            'requires_php' => $release->requiresPhp,
            'tested' => $this->tested($release),
            'last_updated' => $release->releasedAt,
            'download_link' => $release->package,
            'sections' => $readme->sections($release->changelog),
            'banners' => $this->banners(),
            'icons' => $this->icons(),
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

    /**
     * Release packages unpack to "em360-connector/". When this site installed the plugin under another folder
     * name, the update is unpacked into that same folder, so the plugin stays active and add-ons that
     * require it keep working.
     *
     * @param array<string, mixed> $hookExtra
     */
    public function keepFolder(mixed $source, string $remoteSource, object $upgrader, array $hookExtra = []): mixed
    {
        if (!is_string($source) || ($hookExtra['plugin'] ?? '') !== $this->basename()) {
            return $source;
        }
        $wanted = trailingslashit(trailingslashit($remoteSource) . $this->slug());
        if (untrailingslashit($source) === untrailingslashit($wanted)) {
            return $source;
        }
        global $wp_filesystem;
        if (!$wp_filesystem instanceof \WP_Filesystem_Base || !$wp_filesystem->move(untrailingslashit($source), untrailingslashit($wanted), true)) {
            return new \WP_Error('em360_release_folder', 'The update could not be unpacked into the plugin folder.');
        }
        return $wanted;
    }

    /** The folder this site installed the plugin in; WordPress identifies the plugin by it. */
    private function slug(): string
    {
        return dirname($this->basename());
    }

    private function readme(): PluginReadme
    {
        return new PluginReadme(dirname($this->pluginFile) . '/readme.txt');
    }

    /** The newer of the release's "tested up to" and the bundled readme's. */
    private function tested(PluginRelease $release): string
    {
        $readme = $this->readme()->tested();
        return version_compare($readme, $release->tested, '>') ? $readme : $release->tested;
    }

    /** @return array<string, string> */
    private function banners(): array
    {
        return [
            'low' => plugins_url('assets/images/banner-772x250.png', $this->pluginFile),
            'high' => plugins_url('assets/images/banner-1544x500.png', $this->pluginFile),
        ];
    }

    /** @return array<string, string> */
    private function icons(): array
    {
        return [
            '1x' => plugins_url('assets/images/icon-128x128.png', $this->pluginFile),
            '2x' => plugins_url('assets/images/icon-256x256.png', $this->pluginFile),
        ];
    }

    private function basename(): string
    {
        return plugin_basename($this->pluginFile);
    }
}
