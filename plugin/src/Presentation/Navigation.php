<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Presentation;

use EM360\SchoolConnector\Domain\PortalAudience;
use EM360\SchoolConnector\Contracts\PortalPageGatewayInterface;
use EM360\SchoolConnector\Contracts\SettingsStoreInterface;

final class Navigation
{
    public function __construct(
        private readonly AdminNotices $notices,
        private readonly SettingsStoreInterface $settings,
        private readonly PortalPageGatewayInterface $pages,
    ) {
    }

    public function admin(string $message): never
    {
        $this->notices->put($message);
        wp_safe_redirect(admin_url('admin.php?page=em360-connector'));
        exit;
    }

    public function portal(PortalAudience $audience = PortalAudience::Staff): never
    {
        wp_safe_redirect($this->pages->url($this->settings->get()->pageFor($audience)));
        exit;
    }

    public function authorization(string $url): never
    {
        // Supplied only by StartAuthorization, which constructs it from validated settings: the EM360 sign-in page.
        $host = (string) wp_parse_url($url, PHP_URL_HOST);
        add_filter('allowed_redirect_hosts', static fn (array $hosts): array => $host === '' ? $hosts : [...$hosts, $host]);
        wp_safe_redirect($url, 302, 'EM360');
        exit;
    }
}
