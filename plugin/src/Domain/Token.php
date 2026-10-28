<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Domain;

final class Token
{
    public static function valid(string $value): bool
    {
        return (bool) preg_match('/^[A-Za-z0-9_-]{43}$/D', $value);
    }

    public static function challenge(string $verifier): string
    {
        return rtrim(strtr(base64_encode(hash('sha256', $verifier, true)), '+/', '-_'), '=');
    }
}
