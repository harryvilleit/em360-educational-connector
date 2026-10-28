<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Application;

use EM360\SchoolConnector\Contracts\AuthorizationGatewayInterface;
use EM360\SchoolConnector\Contracts\BrowserSessionStoreInterface;
use EM360\SchoolConnector\Domain\ConnectorException;

final class SignOut
{
    public function __construct(private readonly AuthorizationGatewayInterface $api, private readonly BrowserSessionStoreInterface $sessions)
    {
    }

    /** @return array{signedOut: true, message: string} */
    public function execute(): array
    {
        $token = $this->sessions->read()?->portal?->token;
        $this->sessions->clear();
        $message = 'You have signed out.';
        if ($token !== null) {
            try {
                $this->api->logout($token);
            } catch (ConnectorException) {
                $message = 'Signed out on this website. EM360 could not be reached to revoke the remote session; it will expire automatically.';
            }
        }
        return ['signedOut' => true, 'message' => $message];
    }
}
