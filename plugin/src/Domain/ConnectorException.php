<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Domain;

final class ConnectorException extends \RuntimeException
{
    public function __construct(string $message, public readonly int $status = 400, public readonly string $errorCode = 'em360_error')
    {
        parent::__construct($message);
    }
}
