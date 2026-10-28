<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Domain;

final class PendingAuthorization
{
    public function __construct(
        public readonly AuthorizationPurpose $purpose,
        public readonly string $verifier,
        public readonly string $requestId,
        public readonly string $browserKey,
        public readonly int $adminId,
        public readonly string $connectionId,
        public readonly PortalAudience $audience = PortalAudience::Staff,
    ) {
        if (!Token::valid($verifier) || !Token::valid($requestId) || $browserKey === '') {
            throw new ConnectorException('Invalid pending sign-in request. Start again.');
        }
    }
}
