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
        public readonly int $parentPageId = 0,
    ) {
    }

    public function pageFor(PortalAudience $audience): int
    {
        return match ($audience) {
            PortalAudience::Student => $this->studentPageId,
            PortalAudience::Parent => $this->parentPageId,
            PortalAudience::Staff => $this->pageId,
        };
    }

    public function withPage(PortalAudience $audience, int $id): self
    {
        return match ($audience) {
            PortalAudience::Student => new self($this->apiUrl, $this->frontendUrl, $this->pageId, $id, $this->parentPageId),
            PortalAudience::Parent => new self($this->apiUrl, $this->frontendUrl, $this->pageId, $this->studentPageId, $id),
            PortalAudience::Staff => new self($this->apiUrl, $this->frontendUrl, $id, $this->studentPageId, $this->parentPageId),
        };
    }

    public function withUrls(string $apiUrl, string $frontendUrl): self
    {
        $apiUrl = rtrim(trim($apiUrl), '/');
        $frontendUrl = rtrim(trim($frontendUrl), '/');
        if (!UrlPolicy::isHttps($apiUrl) || !UrlPolicy::isHttps($frontendUrl)) {
            throw new ConnectorException('Both service addresses must be HTTPS URLs without query strings.');
        }
        return new self($apiUrl, $frontendUrl, $this->pageId, $this->studentPageId, $this->parentPageId);
    }
}
