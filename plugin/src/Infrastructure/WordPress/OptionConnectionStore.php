<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Infrastructure\WordPress;

use EM360\SchoolConnector\Contracts\ConnectionStoreInterface;
use EM360\SchoolConnector\Contracts\CredentialCipherInterface;
use EM360\SchoolConnector\Domain\ConnectorException;
use EM360\SchoolConnector\Domain\SchoolConnection;
use EM360\SchoolConnector\Infrastructure\Storage\RecordCodec;

final class OptionConnectionStore implements ConnectionStoreInterface
{
    public const OPTION = 'em360_connector_connection';

    public function __construct(private readonly CredentialCipherInterface $cipher)
    {
    }

    public function get(): ?SchoolConnection
    {
        $value = get_option(self::OPTION, '');
        if (!is_string($value) || $value === '') {
            return null;
        }
        try {
            return RecordCodec::connection($this->cipher->decrypt($value));
        } catch (ConnectorException) {
            return null;
        }
    }

    public function save(SchoolConnection $connection): void
    {
        $value = $this->cipher->encrypt(RecordCodec::connectionRecord($connection));
        if (!update_option(self::OPTION, $value, false) && get_option(self::OPTION) !== $value) {
            throw new ConnectorException('The website could not save the school connection. Start again.', 503);
        }
    }

    public function clear(): void
    {
        delete_option(self::OPTION);
    }
}
