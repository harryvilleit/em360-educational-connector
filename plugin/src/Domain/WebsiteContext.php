<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Domain;

final class WebsiteContext
{
    public function __construct(public readonly string $siteUrl, public readonly string $callbackUrl, public readonly bool $secure)
    {
    }

    public function requireSecure(): void
    {
        if (!$this->secure || !UrlPolicy::isHttps($this->siteUrl)) {
            throw new ConnectorException('Your WordPress website must use HTTPS.', 503);
        }
        UrlPolicy::requireCallback($this->siteUrl, $this->callbackUrl);
    }
}
