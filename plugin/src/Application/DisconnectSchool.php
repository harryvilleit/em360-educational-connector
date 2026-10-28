<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Application;

use EM360\SchoolConnector\Contracts\ConnectionGatewayInterface;
use EM360\SchoolConnector\Contracts\ConnectionStoreInterface;
use EM360\SchoolConnector\Domain\ConnectorException;

final class DisconnectSchool
{
    public function __construct(private readonly ConnectionGatewayInterface $api, private readonly ConnectionStoreInterface $connections)
    {
    }

    public function execute(): void
    {
        $connection = $this->connections->get();
        if ($connection !== null) {
            try {
                $this->api->disconnect($connection->secret);
            } catch (ConnectorException $error) {
                if ($error->status !== 401) {
                    throw $error;
                }
            }
        }
        $this->connections->clear();
    }
}
