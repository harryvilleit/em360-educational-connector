<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Application;

use EM360\SchoolConnector\Contracts\ConnectionStoreInterface;
use EM360\SchoolConnector\Contracts\SettingsStoreInterface;
use EM360\SchoolConnector\Domain\ConnectorException;

final class SaveSettings
{
    public function __construct(private readonly SettingsStoreInterface $settings, private readonly ConnectionStoreInterface $connections)
    {
    }

    public function execute(string $apiUrl, string $frontendUrl): void
    {
        if ($this->connections->get() !== null) {
            throw new ConnectorException('Disconnect the school before changing service addresses.');
        }
        $this->settings->save($this->settings->get()->withUrls($apiUrl, $frontendUrl));
    }
}
