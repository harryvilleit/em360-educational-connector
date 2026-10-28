<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Application;

use EM360\SchoolConnector\Contracts\AuthorizationGatewayInterface;
use EM360\SchoolConnector\Contracts\BrowserSessionStoreInterface;
use EM360\SchoolConnector\Contracts\ConnectionGatewayInterface;
use EM360\SchoolConnector\Contracts\ConnectionStoreInterface;
use EM360\SchoolConnector\Contracts\PendingRequestStoreInterface;
use EM360\SchoolConnector\Contracts\SettingsStoreInterface;
use EM360\SchoolConnector\Contracts\TokenGeneratorInterface;
use EM360\SchoolConnector\Contracts\WebsiteContextInterface;
use EM360\SchoolConnector\Domain\AuthorizationPurpose;
use EM360\SchoolConnector\Domain\ConnectorException;
use EM360\SchoolConnector\Domain\PendingAuthorization;
use EM360\SchoolConnector\Domain\PortalAudience;
use EM360\SchoolConnector\Domain\Token;
use EM360\SchoolConnector\Domain\UrlPolicy;

final class StartAuthorization
{
    public function __construct(
        private readonly ConnectionGatewayInterface $connectionApi,
        private readonly AuthorizationGatewayInterface $authApi,
        private readonly SettingsStoreInterface $settings,
        private readonly ConnectionStoreInterface $connections,
        private readonly BrowserSessionStoreInterface $sessions,
        private readonly PendingRequestStoreInterface $pending,
        private readonly TokenGeneratorInterface $tokens,
        private readonly WebsiteContextInterface $website,
    ) {
    }

    public function execute(AuthorizationPurpose $purpose, int $adminId = 0, bool $registerNewSchool = false, PortalAudience $audience = PortalAudience::Staff): string
    {
        $site = $this->website->get();
        if ($registerNewSchool && $purpose !== AuthorizationPurpose::Connect) {
            throw new ConnectorException('School registration must start from website setup.', 400);
        }
        $site->requireSecure();
        $config = $this->settings->get();
        if (!UrlPolicy::isHttps($config->frontendUrl)) {
            throw new ConnectorException('Configure the HTTPS EM360 website address first.', 503);
        }
        if ($purpose === AuthorizationPurpose::Connect && $adminId <= 0) {
            throw new ConnectorException('A WordPress administrator must start the school connection.', 403);
        }
        $connection = $this->connections->get();
        if ($purpose === AuthorizationPurpose::Login && $connection === null) {
            throw new ConnectorException('Connect this website to a school first.', 401);
        }
        $browser = $this->sessions->ensure();
        $state = $this->tokens->generate();
        $verifier = $this->tokens->generate();
        $requestId = $purpose === AuthorizationPurpose::Connect
            ? $this->connectionApi->startConnection($site, $state, Token::challenge($verifier), $registerNewSchool)
            : $this->authApi->startLogin($connection->secret, $state, Token::challenge($verifier), $audience);
        if (!Token::valid($requestId)) {
            throw new ConnectorException('EM360 returned an invalid connection response.', 502);
        }
        $this->pending->put($state, new PendingAuthorization(
            $purpose,
            $verifier,
            $requestId,
            $browser->key,
            $purpose === AuthorizationPurpose::Connect ? $adminId : 0,
            $connection->id ?? '',
            $purpose === AuthorizationPurpose::Login ? $audience : PortalAudience::Staff,
        ), $registerNewSchool ? 3600 : 600);
        // The return destination comes from saved settings, never a remote redirect value.
        return rtrim($config->frontendUrl, '/') . '/wordpress/authorize?request=' . rawurlencode($requestId);
    }
}
