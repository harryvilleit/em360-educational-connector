<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Infrastructure\Storage;

use EM360\SchoolConnector\Contracts\ExpiringStoreInterface;
use EM360\SchoolConnector\Contracts\PendingRequestStoreInterface;
use EM360\SchoolConnector\Domain\ConnectorException;
use EM360\SchoolConnector\Domain\PendingAuthorization;

final class PendingRequestStore implements PendingRequestStoreInterface
{
    public function __construct(private readonly ExpiringStoreInterface $storage)
    {
    }

    public function get(string $state): ?PendingAuthorization
    {
        $record = $this->storage->get($this->key($state));
        if ($record === null) {
            return null;
        }
        try {
            return RecordCodec::pending($record);
        } catch (ConnectorException) {
            return null;
        }
    }

    public function put(string $state, PendingAuthorization $request, int $ttl): void
    {
        $this->storage->put($this->key($state), RecordCodec::pendingRecord($request), $ttl);
    }

    public function delete(string $state): void
    {
        $this->storage->delete($this->key($state));
    }

    private function key(string $state): string
    {
        return 'em360_pending_' . hash('sha256', $state);
    }
}
