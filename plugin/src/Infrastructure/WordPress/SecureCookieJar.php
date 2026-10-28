<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Infrastructure\WordPress;

use EM360\SchoolConnector\Contracts\CookieJarInterface;
use EM360\SchoolConnector\Domain\ConnectorException;
use EM360\SchoolConnector\Domain\Token;

final class SecureCookieJar implements CookieJarInterface
{
    private function name(): string
    {
        return '__Host-em360-' . substr(hash('sha256', home_url('/')), 0, 10);
    }

    public function read(): ?string
    {
        $value = $_COOKIE[$this->name()] ?? null;
        return is_ssl() && is_string($value) && Token::valid($value) ? $value : null;
    }

    public function write(string $value, int $expiresAt): void
    {
        if (!is_ssl() || headers_sent() || !Token::valid($value)) {
            throw new ConnectorException('The school portal requires HTTPS and a secure browser session.', 503);
        }
        if (!setcookie($this->name(), $value, ['expires' => $expiresAt, 'path' => '/', 'secure' => true, 'httponly' => true, 'samesite' => 'Lax'])) {
            throw new ConnectorException('A secure browser cookie could not be created.', 503);
        }
        $_COOKIE[$this->name()] = $value;
    }

    public function clear(): void
    {
        unset($_COOKIE[$this->name()]);
        if (!headers_sent()) {
            setcookie($this->name(), '', ['expires' => 1, 'path' => '/', 'secure' => true, 'httponly' => true, 'samesite' => 'Lax']);
        }
    }
}
