<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Presentation;

final class PortalShortcode
{
    public function __construct(
        private readonly TemplateRenderer $views,
        private readonly string $pluginFile,
        private readonly string $version,
        /** False in the WordPress.org build, which has no student portal. */
        private readonly bool $studentPortal = true,
    ) {
    }

    public function register(): void
    {
        add_shortcode('em360_school_portal', [$this, 'render']);
        if ($this->studentPortal) {
            add_shortcode('em360_student_portal', [$this, 'renderStudent']);
        }
        add_action('template_redirect', [$this, 'preventPageCache']);
        add_action('wp_enqueue_scripts', [$this, 'enqueueForPage']);
    }

    public function render(): string
    {
        $this->enqueueAssets();
        return $this->views->render('portal', [
            'restBase' => rest_url('em360/v1/'),
            'moduleUrl' => admin_url('admin-post.php?action=em360_user_management'),
            'homeUrl' => home_url('/'),
        ]);
    }

    /** The student portal page: its own sign-in, and the React student portal once signed in. */
    public function renderStudent(): string
    {
        $this->enqueueStudentAssets();
        return $this->views->render('student-portal', [
            'restBase' => rest_url('em360/v1/'),
            'frameUrl' => admin_url('admin-post.php?action=em360_student_portal'),
            'homeUrl' => home_url('/'),
        ]);
    }

    public function enqueueForPage(): void
    {
        if (is_singular() && ($post = get_post()) !== null) {
            if (has_shortcode($post->post_content, 'em360_school_portal')) {
                $this->enqueueAssets();
            }
            if ($this->studentPortal && has_shortcode($post->post_content, 'em360_student_portal')) {
                $this->enqueueStudentAssets();
            }
        }
    }

    private function enqueueStudentAssets(): void
    {
        wp_enqueue_style('em360-portal', plugins_url('assets/portal.css', $this->pluginFile), [], $this->version);
        wp_enqueue_script('em360-student-portal', plugins_url('assets/student-portal.js', $this->pluginFile), [], $this->version, true);
    }

    private function enqueueAssets(): void
    {
        wp_enqueue_style('em360-portal', plugins_url('assets/portal.css', $this->pluginFile), [], $this->version);
        wp_enqueue_script('em360-navigation', plugins_url('assets/navigation.js', $this->pluginFile), [], $this->version, true);
        wp_enqueue_script('em360-portal', plugins_url('assets/portal.js', $this->pluginFile), ['em360-navigation'], $this->version, true);
    }

    public function preventPageCache(): void
    {
        if (is_singular() && ($post = get_post()) !== null
            && (has_shortcode($post->post_content, 'em360_school_portal') || has_shortcode($post->post_content, 'em360_student_portal'))) {
            if (!defined('DONOTCACHEPAGE')) {
                define('DONOTCACHEPAGE', true);
            }
            nocache_headers();
            header('Referrer-Policy: no-referrer');
        }
    }
}
