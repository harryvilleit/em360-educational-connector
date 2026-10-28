<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Infrastructure\Storage;

use EM360\SchoolConnector\Contracts\BrowserSessionStoreInterface;
use EM360\SchoolConnector\Contracts\ClockInterface;
use EM360\SchoolConnector\Contracts\CookieJarInterface;
use EM360\SchoolConnector\Contracts\ExpiringStoreInterface;
use EM360\SchoolConnector\Contracts\TokenGeneratorInterface;
use EM360\SchoolConnector\Domain\BrowserSession;
use EM360\SchoolConnector\Domain\ConnectorException;
use EM360\SchoolConnector\Domain\PortalSession;

final class BrowserSessionStore implements BrowserSessionStoreInterface
{
    private const MAX_TTL = 86400;

    public function __construct(
        private readonly ExpiringStoreInterface $storage,
        private readonly CookieJarInterface $cookies,
        private readonly TokenGeneratorInterface $tokens,
        private readonly ClockInterface $clock,
    ) {
    }

    public function read(): ?BrowserSession
    {
        $cookie = $this->cookies->read();
        if ($cookie === null) {
            return null;
        }
        $key = $this->key($cookie);
        $record = $this->storage->get($key);
        if ($record === null) {
            return null;
        }
        try {
            return RecordCodec::browser($key, $record);
        } catch (ConnectorException) {
            return null;
        }
    }

    public function ensure(): BrowserSession
    {
        return $this->read() ?? $this->create(null);
    }

    public function rotate(PortalSession $session): BrowserSession
    {
        $previous = $this->cookies->read();
        $fresh = $this->create($session);
        if ($previous !== null) {
            $this->storage->delete($this->key($previous));
        }
        return $fresh;
    }

    public function clear(): void
    {
        $cookie = $this->cookies->read();
        if ($cookie !== null) {
            $this->storage->delete($this->key($cookie));
        }
        $this->cookies->clear();
    }

    private function create(?PortalSession $portal): BrowserSession
    {
        $ttl = $portal === null ? self::MAX_TTL : min(self::MAX_TTL, $portal->expiresAt - $this->clock->now());
        if ($ttl <= 0) {
            throw new ConnectorException('The portal session has expired. Sign in again.', 401);
        }
        $cookie = $this->tokens->generate();
        $session = new BrowserSession($this->key($cookie), $this->tokens->generate(), $portal);
        $this->storage->put($session->key, RecordCodec::browserRecord($session), $ttl);
        try {
            $this->cookies->write($cookie, $this->clock->now() + self::MAX_TTL);
        } catch (ConnectorException $error) {
            $this->storage->delete($session->key);
            throw $error;
        }
        return $session;
    }

    private function key(string $cookie): string
    {
        return 'em360_browser_' . hash('sha256', $cookie);
    }
}
