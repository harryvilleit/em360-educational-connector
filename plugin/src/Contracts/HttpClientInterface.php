<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Contracts;

use EM360\SchoolConnector\Domain\HttpResponse;

interface HttpClientInterface
{
    /** @param array<string, string> $headers */
    public function request(string $method, string $url, ?string $body, array $headers): HttpResponse;
}
