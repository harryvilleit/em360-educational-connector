<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Contracts;

interface CredentialCipherInterface
{
    /** @param array<string, mixed> $value */
    public function encrypt(array $value): string;
    /** @return array<string, mixed> Empty on corrupt or unreadable ciphertext. */
    public function decrypt(string $value): array;
}
