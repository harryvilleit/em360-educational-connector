<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Contracts;

use EM360\SchoolConnector\Domain\PendingAuthorization;

interface PendingRequestStoreInterface
{
    public function get(string $state): ?PendingAuthorization;
    public function put(string $state, PendingAuthorization $request, int $ttl): void;
    public function delete(string $state): void;
}
