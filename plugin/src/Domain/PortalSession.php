<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Domain;

final class PortalSession
{
    public function __construct(
        public readonly string $token,
        public readonly int $expiresAt,
        public readonly string $connectionId,
        public readonly PortalAudience $audience = PortalAudience::Staff,
    ) {
        if (!Token::valid($token) || $connectionId === '' || $expiresAt <= 0) {
            throw new ConnectorException('Invalid portal session response.', 502);
        }
    }

    public function permits(?SchoolConnection $connection, int $now): bool
    {
        return $connection !== null && $this->connectionId === $connection->id && $this->expiresAt > $now;
    }

    /** A live session for this school that belongs to the given portal. */
    public function opens(PortalAudience $audience, ?SchoolConnection $connection, int $now): bool
    {
        return $this->audience === $audience && $this->permits($connection, $now);
    }
}
