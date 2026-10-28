<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Infrastructure\WordPress;

use EM360\SchoolConnector\Contracts\WebsiteContextInterface;
use EM360\SchoolConnector\Domain\WebsiteContext;

final class WordPressWebsiteContext implements WebsiteContextInterface
{
    public function get(): WebsiteContext
    {
        return new WebsiteContext(rtrim(home_url('/'), '/'), admin_url('admin-post.php?action=em360_callback'), is_ssl());
    }
}
