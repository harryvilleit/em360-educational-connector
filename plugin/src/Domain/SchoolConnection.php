<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Domain;

final class SchoolConnection
{
    public function __construct(
        public readonly string $id,
        public readonly string $secret,
        public readonly string $schoolId,
        public readonly string $schoolName,
    ) {
        if ($id === '' || $schoolId === '' || !Token::valid($secret)) {
            throw new ConnectorException('Invalid school connection response.', 502);
        }
    }
}
