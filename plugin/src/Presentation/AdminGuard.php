<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Presentation;

final class AdminGuard
{
    public function requireAction(string $action): void
    {
        if (!current_user_can('manage_options')) {
            wp_die('You do not have permission to configure this website.', '', ['response' => 403]);
        }
        check_admin_referer($action);
    }
}
