<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Domain;

final class HttpResponse
{
    public function __construct(public readonly int $status, public readonly string $body)
    {
    }
}
