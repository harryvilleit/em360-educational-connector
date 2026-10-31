<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Presentation;

/**
 * Serves one of the plugin's built React applications as a framed document.
 *
 * The build's index.html is only read for its title, script and stylesheet file names;
 * the document itself is written by templates/frame.php with every value escaped.
 */
final class AppFrame
{
    /**
     * @param string $pluginFile The main file of the plugin that ships the application.
     * @param string|null $template The document template; defaults to this plugin's templates/frame.php.
     */
    public function __construct(private readonly string $pluginFile, private readonly ?string $template = null)
    {
    }

    /** @param array<string, mixed> $configuration Values the application reads at start-up. */
    public function output(string $assetDirectory, array $configuration): never
    {
        nocache_headers();
        header('Content-Type: text/html; charset=utf-8');
        header('Referrer-Policy: no-referrer');
        header('X-Frame-Options: SAMEORIGIN');
        header("Content-Security-Policy: frame-ancestors 'self'");
        $index = dirname($this->pluginFile) . '/' . $assetDirectory . 'index.html';
        // A file shipped inside this plugin, not a remote URL.
        $html = is_readable($index) ? file_get_contents($index) : false; // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
        // Only the built file names are taken from index.html.
        if ($html === false || !preg_match('~ src="\./(assets/[A-Za-z0-9_.-]+\.js)"~', $html, $script)) {
            wp_die(esc_html('The school portal application is missing. Install the complete plugin ZIP.'));
        }
        preg_match_all('~ href="\./(assets/[A-Za-z0-9_.-]+\.css)"~', $html, $styles);
        $title = preg_match('~<title>([^<]*)</title>~', $html, $match) ? html_entity_decode($match[1], ENT_QUOTES | ENT_HTML5) : 'EM360';
        $base = plugins_url($assetDirectory, $this->pluginFile);
        // The application and its styles go through the WordPress script-module and style queues.
        $version = defined('EM360_CONNECTOR_VERSION') ? (string) EM360_CONNECTOR_VERSION : false;
        // No "?ver=" on the module: its lazily loaded screens import it by its plain file name, and a second URL
        // would load a second copy of the application (and of React). The built file names already carry a content hash.
        wp_enqueue_script_module('em360-frame', $base . $script[1], [], null);
        $handles = [];
        foreach ($styles[1] as $i => $file) {
            $handles[] = $handle = 'em360-frame-' . $i;
            wp_enqueue_style($handle, $base . $file, [], $version);
        }
        $frame = [
            'title' => $title,
            'base' => $base,
            'configuration' => (string) wp_json_encode($configuration, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT),
            'styles' => $handles,
        ];
        require $this->template ?? dirname(__DIR__, 2) . '/templates/frame.php';
        exit;
    }
}
