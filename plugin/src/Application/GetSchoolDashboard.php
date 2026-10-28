<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Application;

use EM360\SchoolConnector\Contracts\BrowserSessionStoreInterface;
use EM360\SchoolConnector\Contracts\ClockInterface;
use EM360\SchoolConnector\Contracts\ConnectionStoreInterface;
use EM360\SchoolConnector\Contracts\SchoolApiGatewayInterface;
use EM360\SchoolConnector\Domain\ConnectorException;
use EM360\SchoolConnector\Domain\PortalAudience;

final class GetSchoolDashboard
{
    public function __construct(
        private readonly SchoolApiGatewayInterface $api,
        private readonly BrowserSessionStoreInterface $sessions,
        private readonly ConnectionStoreInterface $connections,
        private readonly ClockInterface $clock,
    ) {
    }

    /** @return array<string, mixed> */
    public function execute(): array
    {
        $session = $this->sessions->read()?->portal;
        if ($session === null || !$session->opens(PortalAudience::Staff, $this->connections->get(), $this->clock->now())) {
            throw new ConnectorException('Sign in to the school portal.', 401, 'em360_session');
        }
        return $this->api->dashboard($session->token);
    }
}
