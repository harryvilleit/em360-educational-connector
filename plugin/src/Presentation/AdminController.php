<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Presentation;

use EM360\SchoolConnector\Application\CreatePortalPage;
use EM360\SchoolConnector\Application\DisconnectSchool;
use EM360\SchoolConnector\Application\SaveSettings;
use EM360\SchoolConnector\Application\StartAuthorization;
use EM360\SchoolConnector\Contracts\ConnectionStoreInterface;
use EM360\SchoolConnector\Contracts\PortalPageGatewayInterface;
use EM360\SchoolConnector\Contracts\SettingsStoreInterface;
use EM360\SchoolConnector\Domain\AuthorizationPurpose;
use EM360\SchoolConnector\Domain\PortalAudience;

final class AdminController
{
    public function __construct(
        private readonly SaveSettings $saveSettings,
        private readonly StartAuthorization $start,
        private readonly DisconnectSchool $disconnect,
        private readonly CreatePortalPage $createPage,
        private readonly SettingsStoreInterface $settings,
        private readonly ConnectionStoreInterface $connections,
        private readonly PortalPageGatewayInterface $pages,
        private readonly AdminGuard $guard,
        private readonly AdminNotices $notices,
        private readonly Navigation $navigation,
        private readonly TemplateRenderer $views,
        private readonly ErrorResponder $errors,
        private readonly string $pluginFile,
        private readonly string $version,
        /** False in the WordPress.org build, which has no student portal. */
        private readonly bool $studentPortal = true,
    ) {
    }

    public function register(): void
    {
        add_action('admin_menu', [$this, 'menu']);
        add_action('admin_enqueue_scripts', [$this, 'assets']);
        $actions = ['save', 'connect', 'register_school', 'disconnect', 'create_page'];
        if ($this->studentPortal) {
            $actions[] = 'create_student_page';
        }
        foreach ($actions as $action) {
            $method = match ($action) {
                'create_page' => 'createPage', 'create_student_page' => 'createStudentPage', 'register_school' => 'registerSchool', default => $action
            };
            add_action('admin_post_em360_' . $action, [$this, $method]);
        }
    }

    public function menu(): void
    {
        add_menu_page('EM360 School Connector', 'EM360', 'manage_options', 'em360-connector', [$this, 'render'], 'dashicons-welcome-learn-more');
    }

    public function assets(string $hook): void
    {
        if ($hook === 'toplevel_page_em360-connector') {
            wp_enqueue_style('em360-admin', plugins_url('assets/portal.css', $this->pluginFile), [], $this->version);
        }
    }

    public function render(): void
    {
        if (!current_user_can('manage_options')) {
            return;
        }
        $config = $this->settings->get();
        $connection = $this->connections->get();
        // Pass only display fields to the template; credentials never reach a view model.
        echo $this->views->render('admin', [
            's' => ['api_url' => $config->apiUrl, 'frontend_url' => $config->frontendUrl, 'page_id' => $config->pageId],
            'c' => $connection === null ? [] : ['schoolName' => $connection->schoolName],
            'notice' => $this->notices->take(),
            'portalUrl' => $this->pages->url($config->pageId),
            'pagePublished' => $this->pages->isPublished($config->pageId),
            'studentPortalUrl' => $this->pages->url($config->studentPageId),
            'studentPagePublished' => $this->pages->isPublished($config->studentPageId),
            'studentPortal' => $this->studentPortal,
        ]);
    }

    public function save(): never
    {
        $this->guard->requireAction('em360_save');
        $this->perform(function (): void {
            $this->saveSettings->execute($this->field('api_url'), $this->field('frontend_url'));
        }, 'Service addresses saved. You can now connect your school.');
    }

    public function connect(): never
    {
        $this->guard->requireAction('em360_connect');
        $this->startConnection(false);
    }

    public function registerSchool(): never
    {
        $this->guard->requireAction('em360_register_school');
        $this->startConnection(true);
    }

    private function startConnection(bool $registerNewSchool): never
    {
        if ($this->connections->get() !== null) {
            $this->navigation->admin('Disconnect the current school before connecting another school.');
        }
        try {
            $url = $this->start->execute(AuthorizationPurpose::Connect, get_current_user_id(), $registerNewSchool);
        } catch (\Throwable $error) {
            $this->navigation->admin($this->errors->rest($error)->get_error_message());
        }
        $this->navigation->authorization($url);
    }

    public function disconnect(): never
    {
        $this->guard->requireAction('em360_disconnect');
        $this->perform(fn () => $this->disconnect->execute(), 'Website disconnected. Your EM360 school records are retained.');
    }

    public function createPage(): never
    {
        $this->guard->requireAction('em360_create_page');
        $this->perform(
            fn () => $this->createPage->execute(sanitize_text_field($this->field('page_title'))),
            'Portal page ready. Add it to your website navigation when ready.',
        );
    }

    public function createStudentPage(): never
    {
        $this->guard->requireAction('em360_create_student_page');
        $this->perform(
            fn () => $this->createPage->execute(sanitize_text_field($this->field('page_title')), PortalAudience::Student),
            'Student portal page ready. Add it to your website navigation for students.',
        );
    }

    private function field(string $name): string
    {
        $value = $_POST[$name] ?? '';
        return is_string($value) ? wp_unslash($value) : '';
    }

    /** @param callable(): mixed $operation */
    private function perform(callable $operation, string $success): never
    {
        try {
            $operation();
        } catch (\Throwable $error) {
            $this->navigation->admin($this->errors->rest($error)->get_error_message());
        }
        $this->navigation->admin($success);
    }
}
