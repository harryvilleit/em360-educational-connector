<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Contracts;

interface PortalPageGatewayInterface
{
    public function isPublished(int $id): bool;
    public function create(string $title, \EM360\SchoolConnector\Domain\PortalAudience $audience = \EM360\SchoolConnector\Domain\PortalAudience::Staff): int;
    public function url(int $id): string;
}
