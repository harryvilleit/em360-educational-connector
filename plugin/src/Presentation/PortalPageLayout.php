<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Presentation;

/** Gives dedicated portal pages an application canvas without changing the site's theme. */
final class PortalPageLayout
{
    public function __construct(private readonly string $templateFile)
    {
    }

    public function register(): void
    {
        add_filter('template_include', [$this, 'template'], 99);
        add_filter('body_class', [$this, 'bodyClasses']);
    }

    public function template(string $template): string
    {
        return $this->isWorkspacePage() ? $this->templateFile : $template;
    }

    /**
     * @param list<string> $classes
     * @return list<string>
     */
    public function bodyClasses(array $classes): array
    {
        if ($this->isWorkspacePage()) {
            $classes[] = 'em360-workspace-page';
        }
        return $classes;
    }

    private function isWorkspacePage(): bool
    {
        if (!is_singular('page') || ($post = get_post()) === null) {
            return false;
        }
        // A generated portal or a Gutenberg Shortcode block gets the full-width canvas.
        // Pages with other content keep their theme layout and can still embed the portal.
        $content = trim((string) preg_replace('/<!--.*?-->/s', '', $post->post_content));
        if (!preg_match('/^\[em360_(?:school|student|parent)_portal(\s[^\]]*)?\s*\/?\]$/D', $content, $matches)) {
            return false;
        }
        $attributes = shortcode_parse_atts($matches[1] ?? '');
        return ($attributes['layout'] ?? '') !== 'embedded';
    }
}
