<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Contracts;

interface CookieJarInterface
{
    public function read(): ?string;
    public function write(string $value, int $expiresAt): void;
    public function clear(): void;
}
