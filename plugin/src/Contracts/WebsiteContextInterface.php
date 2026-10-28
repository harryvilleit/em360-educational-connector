<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Contracts;

use EM360\SchoolConnector\Domain\WebsiteContext;

interface WebsiteContextInterface
{
    public function get(): WebsiteContext;
}
