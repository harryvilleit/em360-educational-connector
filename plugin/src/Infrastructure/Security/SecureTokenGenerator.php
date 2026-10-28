<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Infrastructure\Security;

use EM360\SchoolConnector\Contracts\TokenGeneratorInterface;

final class SecureTokenGenerator implements TokenGeneratorInterface
{
    public function generate(): string
    {
        return rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');
    }
}
