<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Infrastructure\WordPress;

use EM360\SchoolConnector\Contracts\CredentialCipherInterface;
use EM360\SchoolConnector\Contracts\ExpiringStoreInterface;
use EM360\SchoolConnector\Domain\ConnectorException;

final class EncryptedTransientStore implements ExpiringStoreInterface
{
    public function __construct(private readonly CredentialCipherInterface $cipher)
    {
    }

    /** @return array<string, mixed>|null */
    public function get(string $key): ?array
    {
        $raw = get_transient($key);
        if (!is_string($raw) || $raw === '') {
            return null;
        }
        return $this->cipher->decrypt($raw) ?: null;
    }

    /** @param array<string, mixed> $value */
    public function put(string $key, array $value, int $ttl): void
    {
        if ($ttl <= 0 || !set_transient($key, $this->cipher->encrypt($value), $ttl)) {
            throw new ConnectorException('The website could not save the secure session. Try again.', 503);
        }
    }

    public function delete(string $key): void
    {
        delete_transient($key);
    }
}
