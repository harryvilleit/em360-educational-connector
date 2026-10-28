<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Application;

use EM360\SchoolConnector\Contracts\PortalPageGatewayInterface;
use EM360\SchoolConnector\Contracts\SettingsStoreInterface;
use EM360\SchoolConnector\Domain\PortalAudience;

final class CreatePortalPage
{
    public function __construct(private readonly SettingsStoreInterface $settings, private readonly PortalPageGatewayInterface $pages)
    {
    }

    public function execute(string $title, PortalAudience $audience = PortalAudience::Staff): int
    {
        $config = $this->settings->get();
        $existing = $config->pageFor($audience);
        if ($existing > 0 && $this->pages->isPublished($existing)) {
            return $existing;
        }
        $fallback = $audience === PortalAudience::Student ? 'Student portal' : 'School portal';
        $id = $this->pages->create(trim($title) ?: $fallback, $audience);
        $this->settings->save($config->withPage($audience, $id));
        return $id;
    }
}
