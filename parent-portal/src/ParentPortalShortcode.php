<?php

declare(strict_types=1);

namespace EM360\ParentPortal;

use EM360\SchoolConnector\Extension\Connector;

/** [em360_parent_portal]: the parent sign-in page, then the React parent portal once signed in. */
final class ParentPortalShortcode
{
    public function __construct(private readonly Connector $connector, private readonly string $pluginFile, private readonly string $version)
    {
    }

    public function register(): void
    {
        add_action('init', fn () => add_shortcode('em360_parent_portal', [$this, 'render']));
        add_action('wp_enqueue_scripts', [$this, 'enqueueForPage']);
    }

    public function render(): string
    {
        $this->enqueueAssets();
        $restBase = rest_url('em360/v1/');
        $frameUrl = admin_url('admin-post.php?action=em360_parent_portal');
        $homeUrl = home_url('/');
        ob_start();
        require dirname($this->pluginFile) . '/templates/parent-portal.php';
        return (string) ob_get_clean();
    }

    public function enqueueForPage(): void
    {
        if (is_singular() && ($post = get_post()) !== null && has_shortcode($post->post_content, 'em360_parent_portal')) {
            $this->enqueueAssets();
        }
    }

    private function enqueueAssets(): void
    {
        wp_enqueue_style('em360-portal', $this->connector->stylesheetUrl(), [], $this->connector->version());
        wp_enqueue_script('em360-parent-portal', plugins_url('assets/parent-portal.js', $this->pluginFile), [], $this->version, true);
    }
}
