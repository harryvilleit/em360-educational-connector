<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Infrastructure\WordPress;

/**
 * Reads the plugin's readme.txt for the "View details" window of the self-hosted updater, so it shows
 * the same Description, Installation, FAQ and Changelog as a WordPress.org listing.
 */
final class PluginReadme
{
    /** @var array<string, string> Section title => body text. */
    private array $sections = [];
    private string $tested = '';
    private string $summary = '';

    public function __construct(string $file)
    {
        $text = is_readable($file) ? (string) file_get_contents($file) : ''; // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- local plugin file
        $text = str_replace("\r\n", "\n", $text);
        if (preg_match('/^Tested up to:\s*([0-9.]+)\s*$/mi', $text, $match)) {
            $this->tested = $match[1];
        }
        $parts = preg_split('/^==\s*(.+?)\s*==\s*$/m', $text, -1, PREG_SPLIT_DELIM_CAPTURE) ?: [];
        $header = (string) array_shift($parts);
        $lines = array_values(array_filter(array_map('trim', explode("\n", $header)), static fn (string $line): bool => $line !== ''));
        foreach ($lines as $line) {
            if (!str_starts_with($line, '===') && !preg_match('/^[A-Za-z ]+:\s/', $line)) {
                $this->summary = $line;
            }
        }
        for ($i = 0; $i + 1 < count($parts); $i += 2) {
            $this->sections[strtolower($parts[$i])] = trim($parts[$i + 1]);
        }
    }

    public function tested(): string
    {
        return $this->tested;
    }

    public function summary(): string
    {
        return $this->summary;
    }

    /** @return array<string, string> The window's tabs, as safe HTML. */
    public function sections(string $releaseChangelog = ''): array
    {
        $description = $this->html($this->sections['description'] ?? '');
        foreach (['external service', 'source code'] as $extra) {
            if (isset($this->sections[$extra])) {
                $description .= '<h3>' . esc_html(ucwords($extra)) . '</h3>' . $this->html($this->sections[$extra]);
            }
        }
        $changelog = $releaseChangelog !== ''
            ? $this->html($releaseChangelog)
            : $this->html($this->latestChanges($this->sections['changelog'] ?? '', 6));
        $tabs = [
            'description' => $description,
            'installation' => $this->html($this->sections['installation'] ?? ''),
            'faq' => $this->html($this->sections['frequently asked questions'] ?? ''),
            'changelog' => $changelog,
        ];
        return array_map('wp_kses_post', array_filter($tabs, static fn (string $html): bool => $html !== ''));
    }

    /** The newest `$count` "= x.y.z =" entries of the changelog. */
    private function latestChanges(string $changelog, int $count): string
    {
        $entries = preg_split('/(?=^=\s*[0-9])/m', $changelog, -1, PREG_SPLIT_NO_EMPTY) ?: [];
        return implode("\n", array_slice($entries, 0, $count));
    }

    /** Converts the readme subset used here (= headings =, * lists, **bold**, `code`, links) to HTML. */
    private function html(string $text): string
    {
        $out = '';
        $list = false;
        $paragraph = [];
        $flush = function () use (&$out, &$paragraph): void {
            if ($paragraph !== []) {
                $out .= '<p>' . implode(' ', $paragraph) . '</p>';
                $paragraph = [];
            }
        };
        foreach (explode("\n", $text) as $raw) {
            $line = trim($raw);
            if (preg_match('/^=\s*(.+?)\s*=$/', $line, $match)) {
                $flush();
                if ($list) {
                    $out .= '</ul>';
                    $list = false;
                }
                $out .= '<h4>' . $this->inline($match[1]) . '</h4>';
            } elseif (preg_match('/^[*-]\s+(.+)$/', $line, $match)) {
                $flush();
                if (!$list) {
                    $out .= '<ul>';
                    $list = true;
                }
                $out .= '<li>' . $this->inline($match[1]) . '</li>';
            } elseif ($line === '') {
                $flush();
                if ($list) {
                    $out .= '</ul>';
                    $list = false;
                }
            } else {
                if ($list) {
                    $out .= '</ul>';
                    $list = false;
                }
                $paragraph[] = $this->inline(preg_replace('/^\d+\.\s+/', '', $line) ?? $line);
            }
        }
        $flush();
        return $list ? $out . '</ul>' : $out;
    }

    private function inline(string $text): string
    {
        $html = esc_html($text);
        $html = preg_replace('/\*\*(.+?)\*\*/', '<strong>$1</strong>', $html) ?? $html;
        $html = preg_replace('/`([^`]+)`/', '<code>$1</code>', $html) ?? $html;
        $html = preg_replace_callback('/\[([^\]]+)\]\((https:\/\/[^)\s]+)\)/', static fn (array $m): string =>
            '<a href="' . esc_url(html_entity_decode($m[2])) . '" target="_blank" rel="noopener noreferrer">' . $m[1] . '</a>', $html) ?? $html;
        return preg_replace_callback('/(?<!["\'>])\bhttps:\/\/[^\s<]+[^\s<.,;:)]/', static fn (array $m): string =>
            '<a href="' . esc_url(html_entity_decode($m[0])) . '" target="_blank" rel="noopener noreferrer">' . $m[0] . '</a>', $html) ?? $html;
    }
}
