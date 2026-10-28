<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Contracts;

use EM360\SchoolConnector\Domain\ModuleRequest;

interface UserManagementGatewayInterface
{
    /** @return array<string, mixed> */
    public function context(string $sessionToken, string $module = 'users'): array;

    /** @return array<string, mixed> */
    public function execute(string $sessionToken, ModuleRequest $request): array;
}
