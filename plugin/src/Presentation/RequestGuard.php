<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Presentation;

use EM360\SchoolConnector\Contracts\BrowserSessionStoreInterface;
use EM360\SchoolConnector\Contracts\WebsiteContextInterface;
use EM360\SchoolConnector\Domain\UrlPolicy;

final class RequestGuard
{
    public function __construct(private readonly BrowserSessionStoreInterface $sessions, private readonly WebsiteContextInterface $website)
    {
    }

    public function sameOrigin(): bool|\WP_Error
    {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        $expected = UrlPolicy::origin($this->website->get()->siteUrl);
        if (!is_string($origin) || ($origin !== '' && ($expected === '' || UrlPolicy::origin($origin) !== $expected))) {
            return new \WP_Error('em360_origin', 'Cross-site requests are not allowed.', ['status' => 403]);
        }
        return true;
    }

    /** @param \WP_REST_Request<array<string, mixed>> $request */
    public function csrf(\WP_REST_Request $request): bool|\WP_Error
    {
        $origin = $this->sameOrigin();
        if (is_wp_error($origin)) {
            return $origin;
        }
        $browser = $this->sessions->read();
        $provided = $request->get_header('X-EM360-CSRF');
        if ($browser === null || !is_string($provided) || !hash_equals($browser->csrf, $provided)) {
            return new \WP_Error('em360_csrf', 'Refresh the portal and try again.', ['status' => 403]);
        }
        return true;
    }
}
