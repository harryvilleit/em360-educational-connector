<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Presentation;

final class AdminNotices
{
    public function put(string $message): void
    {
        set_transient('em360_notice_' . get_current_user_id(), $message, 120);
    }

    public function take(): string
    {
        $key = 'em360_notice_' . get_current_user_id();
        $value = get_transient($key);
        delete_transient($key);
        return is_string($value) ? $value : '';
    }
}
