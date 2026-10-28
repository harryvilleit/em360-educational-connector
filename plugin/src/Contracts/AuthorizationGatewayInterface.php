<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Contracts;

use EM360\SchoolConnector\Domain\AuthorizationGrant;
use EM360\SchoolConnector\Domain\PortalAudience;

interface AuthorizationGatewayInterface
{
    public function startLogin(string $secret, string $state, string $challenge, PortalAudience $audience = PortalAudience::Staff): string;
    public function exchange(string $requestId, string $code, string $verifier): AuthorizationGrant;
    public function logout(string $token): void;
}
