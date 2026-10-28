<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Bootstrap;

use EM360\SchoolConnector\Infrastructure\WordPress\PluginUpdater;
use EM360\SchoolConnector\Presentation\AdminController;
use EM360\SchoolConnector\Presentation\CallbackController;
use EM360\SchoolConnector\Presentation\PortalRestController;
use EM360\SchoolConnector\Presentation\PortalShortcode;
use EM360\SchoolConnector\Presentation\PortalPageLayout;
use EM360\SchoolConnector\Presentation\StudentPortalController;
use EM360\SchoolConnector\Presentation\UserManagementController;

final class Plugin
{
    public function __construct(
        private readonly AdminController $admin,
        private readonly CallbackController $callback,
        private readonly PortalRestController $portal,
        private readonly PortalShortcode $shortcode,
        private readonly UserManagementController $userManagement,
        private readonly PortalPageLayout $layout,
        private readonly PluginUpdater $updater,
        private readonly StudentPortalController $studentPortal,
    ) {
    }

    public function register(): void
    {
        $this->admin->register();
        $this->callback->register();
        $this->portal->register();
        $this->shortcode->register();
        $this->userManagement->register();
        $this->layout->register();
        $this->updater->register();
        $this->studentPortal->register();
    }
}
