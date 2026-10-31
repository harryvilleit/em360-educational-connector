<?php

declare(strict_types=1);

namespace EM360\ParentPortal;

use EM360\SchoolConnector\Contracts\BrowserSessionStoreInterface;
use EM360\SchoolConnector\Contracts\ClockInterface;
use EM360\SchoolConnector\Contracts\ConnectionStoreInterface;
use EM360\SchoolConnector\Contracts\UserManagementGatewayInterface;
use EM360\SchoolConnector\Domain\ConnectorException;
use EM360\SchoolConnector\Domain\ModuleRequest;
use EM360\SchoolConnector\Domain\PortalAudience;

/** The parent portal: only a parent session can use it, and only through the parent gateway. */
final class ParentPortal
{
    public function __construct(
        private readonly UserManagementGatewayInterface $api,
        private readonly BrowserSessionStoreInterface $sessions,
        private readonly ConnectionStoreInterface $connections,
        private readonly ClockInterface $clock,
    ) {
    }

    /** @return array<string, mixed> */
    public function context(): array
    {
        return $this->api->context($this->token());
    }

    /** @return array<string, mixed> */
    public function execute(ModuleRequest $request): array
    {
        return $this->api->execute($this->token(), $request);
    }

    private function token(): string
    {
        $session = $this->sessions->read()?->portal;
        if ($session === null || !$session->opens(PortalAudience::Parent, $this->connections->get(), $this->clock->now())) {
            throw new ConnectorException('Sign in to the parent portal.', 401, 'em360_session');
        }
        return $session->token;
    }
}
