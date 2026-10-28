<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Contracts;

interface ExpiringStoreInterface
{
    /** @return array<string, mixed>|null */
    public function get(string $key): ?array;
    /** @param array<string, mixed> $value */
    public function put(string $key, array $value, int $ttl): void;
    public function delete(string $key): void;
}
