<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Application;

use EM360\SchoolConnector\Domain\PortalAudience;
use EM360\SchoolConnector\Contracts\BrowserSessionStoreInterface;
use EM360\SchoolConnector\Contracts\ClockInterface;
use EM360\SchoolConnector\Contracts\ConnectionStoreInterface;

final class GetPortalBootstrap
{
    public function __construct(
        private readonly BrowserSessionStoreInterface $sessions,
        private readonly ConnectionStoreInterface $connections,
        private readonly ClockInterface $clock,
    ) {
    }

    /** @return array{csrf: string, connected: bool, schoolName: string, signedIn: bool, signedInElsewhere: string} */
    public function execute(PortalAudience $audience = PortalAudience::Staff): array
    {
        $browser = $this->sessions->ensure();
        $connection = $this->connections->get();
        $now = $this->clock->now();
        $live = $browser->portal?->permits($connection, $now) ?? false;
        $here = $browser->portal?->opens($audience, $connection, $now) ?? false;
        return [
            'csrf' => $browser->csrf,
            'connected' => $connection !== null,
            'schoolName' => $connection->schoolName ?? '',
            'signedIn' => $here,
            // The portal this browser is signed in to instead, so the page can offer to sign out of it.
            'signedInElsewhere' => $live && !$here ? $browser->portal->audience->value : '',
        ];
    }
}
