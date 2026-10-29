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
    public function __construct(private readonly string $pluginFile)
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
        if ($html === false || !preg_match('~<script type="module" crossorigin src="\./(assets/[A-Za-z0-9_.-]+\.js)"~', $html, $script)) {
            wp_die(esc_html('The school portal application is missing. Install the complete plugin ZIP.'));
        }
        preg_match_all('~<link rel="stylesheet" crossorigin href="\./(assets/[A-Za-z0-9_.-]+\.css)"~', $html, $styles);
        preg_match_all('~<link rel="modulepreload" crossorigin href="\./(assets/[A-Za-z0-9_.-]+\.js)"~', $html, $preloads);
        $title = preg_match('~<title>([^<]*)</title>~', $html, $match) ? html_entity_decode($match[1], ENT_QUOTES | ENT_HTML5) : 'EM360';
        $base = plugins_url($assetDirectory, $this->pluginFile);
        $frame = [
            'title' => $title,
            'base' => $base,
            'configuration' => (string) wp_json_encode($configuration, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT),
            'script' => $base . $script[1],
            'styles' => array_map(fn (string $file): string => $base . $file, $styles[1]),
            'preloads' => array_map(fn (string $file): string => $base . $file, $preloads[1]),
        ];
        require dirname($this->pluginFile) . '/templates/frame.php';
        exit;
    }
}
