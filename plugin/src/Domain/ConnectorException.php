<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Domain;

final class ConnectorException extends \RuntimeException
{
    public function __construct(string $message, public readonly int $status = 400, public readonly string $errorCode = 'em360_error')
    {
        parent::__construct($message);
    }

    /**
     * A failure reported by the EM360 School API. The message is plain text returned to the portal as JSON
     * (WP_Error over the REST API) and is escaped wherever WordPress prints it as HTML.
     */
    public static function fromApi(string $message, int $status, string $errorCode = 'em360_error'): self
    {
        return new self($message, $status, $errorCode);
    }
}
