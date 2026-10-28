<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Contracts;

use EM360\SchoolConnector\Domain\SchoolConnection;

interface ConnectionStoreInterface
{
    public function get(): ?SchoolConnection;
    public function save(SchoolConnection $connection): void;
    public function clear(): void;
}
