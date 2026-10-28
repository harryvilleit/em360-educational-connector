<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Contracts;

use EM360\SchoolConnector\Domain\ConnectorConfig;

interface SettingsStoreInterface
{
    public function get(): ConnectorConfig;
    public function save(ConnectorConfig $config): void;
}
