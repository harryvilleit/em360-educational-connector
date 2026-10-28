<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Domain;

final class ConnectorConfig
{
    public function __construct(
        public readonly string $apiUrl = '',
        public readonly string $frontendUrl = 'https://em360s.com',
        public readonly int $pageId = 0,
        public readonly int $studentPageId = 0,
    ) {
    }

    public function pageFor(PortalAudience $audience): int
    {
        return $audience === PortalAudience::Student ? $this->studentPageId : $this->pageId;
    }

    public function withPage(PortalAudience $audience, int $id): self
    {
        return $audience === PortalAudience::Student
            ? new self($this->apiUrl, $this->frontendUrl, $this->pageId, $id)
            : new self($this->apiUrl, $this->frontendUrl, $id, $this->studentPageId);
    }

    public function withUrls(string $apiUrl, string $frontendUrl): self
    {
        $apiUrl = rtrim(trim($apiUrl), '/');
        $frontendUrl = rtrim(trim($frontendUrl), '/');
        if (!UrlPolicy::isHttps($apiUrl) || !UrlPolicy::isHttps($frontendUrl)) {
            throw new ConnectorException('Both service addresses must be HTTPS URLs without query strings.');
        }
        return new self($apiUrl, $frontendUrl, $this->pageId, $this->studentPageId);
    }
}
