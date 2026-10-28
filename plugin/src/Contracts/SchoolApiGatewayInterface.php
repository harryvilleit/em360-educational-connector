<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Contracts;

interface SchoolApiGatewayInterface
{
    /** @return array<string, mixed> School-scoped dashboard returned by EM360. */
    public function dashboard(string $sessionToken): array;
}
