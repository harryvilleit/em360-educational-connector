<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Domain;

final class CallbackOutcome
{
    public function __construct(
        public readonly AuthorizationPurpose $purpose,
        public readonly bool $cancelled = false,
        public readonly PortalAudience $audience = PortalAudience::Staff,
    )
    {
    }
}
