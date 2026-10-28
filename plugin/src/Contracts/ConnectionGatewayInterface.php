<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Contracts;

use EM360\SchoolConnector\Domain\WebsiteContext;

interface ConnectionGatewayInterface
{
    public function startConnection(WebsiteContext $site, string $state, string $challenge, bool $registerNewSchool = false): string;
    public function disconnect(string $secret): void;
}
