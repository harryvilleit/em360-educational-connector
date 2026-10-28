<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Application;

use EM360\SchoolConnector\Contracts\BrowserSessionStoreInterface;
use EM360\SchoolConnector\Contracts\ClockInterface;
use EM360\SchoolConnector\Contracts\ConnectionStoreInterface;
use EM360\SchoolConnector\Contracts\UserManagementGatewayInterface;
use EM360\SchoolConnector\Domain\ConnectorException;
use EM360\SchoolConnector\Domain\ModuleRequest;
use EM360\SchoolConnector\Domain\PortalAudience;

/** The student portal: only a student session can use it, and only through the student gateway. */
final class StudentPortal
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
        if ($session === null || !$session->opens(PortalAudience::Student, $this->connections->get(), $this->clock->now())) {
            throw new ConnectorException('Sign in to the student portal.', 401, 'em360_session');
        }
        return $session->token;
    }
}
