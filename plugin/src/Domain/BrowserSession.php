<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Domain;

final class BrowserSession
{
    public function __construct(public readonly string $key, public readonly string $csrf, public readonly ?PortalSession $portal = null)
    {
        if ($key === '' || !Token::valid($csrf)) {
            throw new ConnectorException('Invalid browser session.', 401);
        }
    }
}
