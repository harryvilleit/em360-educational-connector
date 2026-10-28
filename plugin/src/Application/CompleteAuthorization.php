<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Application;

use EM360\SchoolConnector\Contracts\AuthorizationGatewayInterface;
use EM360\SchoolConnector\Contracts\BrowserSessionStoreInterface;
use EM360\SchoolConnector\Contracts\ClockInterface;
use EM360\SchoolConnector\Contracts\ConnectionStoreInterface;
use EM360\SchoolConnector\Contracts\PendingRequestStoreInterface;
use EM360\SchoolConnector\Domain\AuthorizationPurpose;
use EM360\SchoolConnector\Domain\CallbackOutcome;
use EM360\SchoolConnector\Domain\ConnectorException;
use EM360\SchoolConnector\Domain\PortalSession;
use EM360\SchoolConnector\Domain\Token;

final class CompleteAuthorization
{
    public function __construct(
        private readonly AuthorizationGatewayInterface $api,
        private readonly ConnectionStoreInterface $connections,
        private readonly BrowserSessionStoreInterface $sessions,
        private readonly PendingRequestStoreInterface $pending,
        private readonly ClockInterface $clock,
    ) {
    }

    public function execute(string $state, string $code, bool $denied, int $adminId, bool $canManage): CallbackOutcome
    {
        if (!Token::valid($state)) {
            throw new ConnectorException('Invalid sign-in state. Return to the portal and start again.');
        }
        $request = $this->pending->get($state);
        $browser = $this->sessions->read();
        if ($request === null || $browser === null || !hash_equals($request->browserKey, $browser->key)) {
            throw new ConnectorException('This sign-in request expired or belongs to another browser. Start again from WordPress.');
        }
        if ($request->purpose === AuthorizationPurpose::Connect && (!$canManage || $adminId <= 0 || $adminId !== $request->adminId)) {
            throw new ConnectorException('Sign in to the WordPress administrator account that started this connection.', 403);
        }
        if ($request->purpose === AuthorizationPurpose::Login && $request->connectionId !== $this->connections->get()?->id) {
            throw new ConnectorException('The connected school changed. Start again from the portal.');
        }
        $this->pending->delete($state);
        if ($denied) {
            return new CallbackOutcome($request->purpose, true, $request->audience);
        }
        if (!Token::valid($code)) {
            throw new ConnectorException('Invalid authorisation code.');
        }
        // The API atomically consumes the code, including concurrent callback attempts.
        $grant = $this->api->exchange($request->requestId, $code, $request->verifier);
        if ($grant->purpose !== $request->purpose) {
            throw new ConnectorException('Invalid authorisation response.', 502);
        }
        if ($grant->purpose === AuthorizationPurpose::Connect) {
            if ($grant->connection === null) {
                throw new ConnectorException('Invalid school connection response.', 502);
            }
            $this->connections->save($grant->connection);
            return new CallbackOutcome($grant->purpose);
        }
        if ($grant->audience !== $request->audience) {
            throw new ConnectorException('EM360 opened a different portal than the one requested. Start again.', 502);
        }
        if ($grant->expiresAt <= $this->clock->now()) {
            throw new ConnectorException('The portal session has expired. Sign in again.', 401);
        }
        $this->sessions->rotate(new PortalSession($grant->sessionToken, $grant->expiresAt, $request->connectionId, $grant->audience));
        if ($browser->portal !== null) {
            try {
                $this->api->logout($browser->portal->token);
            } catch (ConnectorException) {
                // New session is already established. The previous remote token expires independently.
            }
        }
        return new CallbackOutcome($grant->purpose, false, $grant->audience);
    }
}
