<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Infrastructure\Http;

use EM360\SchoolConnector\Contracts\AuthorizationGatewayInterface;
use EM360\SchoolConnector\Contracts\ConnectionGatewayInterface;
use EM360\SchoolConnector\Contracts\HttpClientInterface;
use EM360\SchoolConnector\Contracts\SchoolApiGatewayInterface;
use EM360\SchoolConnector\Contracts\SettingsStoreInterface;
use EM360\SchoolConnector\Domain\AuthorizationGrant;
use EM360\SchoolConnector\Domain\ConnectorException;
use EM360\SchoolConnector\Domain\PortalAudience;
use EM360\SchoolConnector\Domain\UrlPolicy;
use EM360\SchoolConnector\Domain\WebsiteContext;
use EM360\SchoolConnector\Infrastructure\Storage\RecordCodec;

final class Em360ApiClient implements ConnectionGatewayInterface, AuthorizationGatewayInterface, SchoolApiGatewayInterface
{
    public function __construct(private readonly HttpClientInterface $http, private readonly SettingsStoreInterface $settings)
    {
    }

    public function startConnection(WebsiteContext $site, string $state, string $challenge, bool $registerNewSchool = false): string
    {
        $result = $this->send('POST', 'requests/connect', [
            'siteUrl' => $site->siteUrl,
            'callbackUrl' => $site->callbackUrl,
            'state' => $state,
            'codeChallenge' => $challenge,
            'registerNewSchool' => $registerNewSchool,
        ]);
        return RecordCodec::text($result, 'requestId');
    }

    public function startLogin(string $secret, string $state, string $challenge, PortalAudience $audience = PortalAudience::Staff): string
    {
        $result = $this->send('POST', 'requests/login', ['state' => $state, 'codeChallenge' => $challenge, 'audience' => $audience->value], ['X-EM360-Connection' => $secret]);
        return RecordCodec::text($result, 'requestId');
    }

    public function exchange(string $requestId, string $code, string $verifier): AuthorizationGrant
    {
        $result = $this->send('POST', 'exchange', ['requestId' => $requestId, 'code' => $code, 'codeVerifier' => $verifier]);
        if (($result['purpose'] ?? '') === 'connect') {
            return AuthorizationGrant::connection(RecordCodec::connection($result));
        }
        if (($result['purpose'] ?? '') !== 'login') {
            throw new ConnectorException('Invalid authorisation response.', 502);
        }
        $expiry = RecordCodec::text($result, 'expiresAtUtc');
        // EM360 may send an ISO UTC value with Z or with no explicit offset.
        if (!preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/D', $expiry)) {
            throw new ConnectorException('Invalid portal session expiry.', 502);
        }
        try {
            $date = new \DateTimeImmutable($expiry, new \DateTimeZone('UTC'));
        } catch (\Exception) {
            throw new ConnectorException('Invalid portal session expiry.', 502);
        }
        // APIs before 0.24.0 issue staff sessions only and do not name the audience.
        $audience = PortalAudience::tryFrom(RecordCodec::text($result, 'audience') ?: 'staff');
        if ($audience === null) {
            throw new ConnectorException('Invalid portal session audience.', 502);
        }
        return AuthorizationGrant::login(RecordCodec::text($result, 'sessionToken'), $date->getTimestamp(), $audience);
    }

    public function disconnect(string $secret): void
    {
        $this->send('POST', 'disconnect', null, ['X-EM360-Connection' => $secret]);
    }

    public function logout(string $token): void
    {
        $this->send('POST', 'portal/logout', null, ['Authorization' => 'Bearer ' . $token]);
    }

    /** @return array<string, mixed> */
    public function dashboard(string $sessionToken): array
    {
        $data = $this->send('GET', 'portal', null, ['Authorization' => 'Bearer ' . $sessionToken]);
        if (!is_array($data['school'] ?? null) || !is_string($data['school']['name'] ?? null)) {
            throw new ConnectorException('EM360 returned an invalid school dashboard.', 502);
        }
        $data['frontendUrl'] = $this->settings->get()->frontendUrl;
        return $data;
    }

    /**
     * @param array<string, mixed>|null $body
     * @param array<string, string> $credentials
     * @return array<string, mixed>
     */
    private function send(string $method, string $path, ?array $body = null, array $credentials = []): array
    {
        $base = $this->settings->get()->apiUrl;
        if (!UrlPolicy::isHttps($base)) {
            throw new ConnectorException('Set the HTTPS EM360 School API address in WordPress → EM360.', 503, 'em360_config');
        }
        $json = $body === null ? null : wp_json_encode($body);
        if ($json === false) {
            throw new ConnectorException('The API request could not be encoded.', 500);
        }
        $response = $this->http->request(
            $method,
            rtrim($base, '/') . '/WordPress/' . $path,
            $json,
            ['Accept' => 'application/json', 'Content-Type' => 'application/json'] + $credentials
        );
        $decoded = json_decode($response->body, true);
        if ($response->status < 200 || $response->status >= 300) {
            $data = is_array($decoded) ? $decoded : [];
            $message = RecordCodec::text($data, 'message') ?: RecordCodec::text($data, 'Message') ?: RecordCodec::text($data, 'title');
            $status = $response->status >= 400 && $response->status <= 599 ? $response->status : 502;
            // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped -- plain API text returned as JSON; escaped wherever it is printed.
            throw ConnectorException::fromApi($message ?: 'The EM360 request could not be completed.', $status, 'em360_api');
        }
        if ($response->status === 204 || ($response->body === '' && in_array($path, ['disconnect', 'portal/logout'], true))) {
            return [];
        }
        if (!is_array($decoded)) {
            throw new ConnectorException('EM360 returned an unreadable response.', 502);
        }
        return $decoded;
    }
}
