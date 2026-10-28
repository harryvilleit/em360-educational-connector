<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Domain;

final class AuthorizationGrant
{
    private function __construct(
        public readonly AuthorizationPurpose $purpose,
        public readonly ?SchoolConnection $connection,
        public readonly string $sessionToken,
        public readonly int $expiresAt,
        public readonly PortalAudience $audience = PortalAudience::Staff,
    ) {
    }

    public static function connection(SchoolConnection $connection): self
    {
        return new self(AuthorizationPurpose::Connect, $connection, '', 0);
    }

    public static function login(string $token, int $expiresAt, PortalAudience $audience = PortalAudience::Staff): self
    {
        if (!Token::valid($token) || $expiresAt <= 0) {
            throw new ConnectorException('Invalid portal session response.', 502);
        }
        return new self(AuthorizationPurpose::Login, null, $token, $expiresAt, $audience);
    }
}
