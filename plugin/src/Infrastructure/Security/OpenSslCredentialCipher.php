<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Infrastructure\Security;

use EM360\SchoolConnector\Contracts\CredentialCipherInterface;
use EM360\SchoolConnector\Domain\ConnectorException;

final class OpenSslCredentialCipher implements CredentialCipherInterface
{
    private readonly string $key;

    public function __construct(string $authenticationSalt)
    {
        $this->key = hash('sha256', $authenticationSalt . '|em360-school-connector', true);
    }

    /** @param array<string, mixed> $value */
    public function encrypt(array $value): string
    {
        $json = wp_json_encode($value);
        if ($json === false) {
            throw new ConnectorException('Credential encoding failed.', 500);
        }
        $iv = random_bytes(12);
        $tag = '';
        $ciphertext = openssl_encrypt($json, 'aes-256-gcm', $this->key, OPENSSL_RAW_DATA, $iv, $tag, 'em360:v1');
        if ($ciphertext === false) {
            throw new ConnectorException('Credential encryption failed.', 500);
        }
        return base64_encode($iv . $tag . $ciphertext);
    }

    /** @return array<string, mixed> */
    public function decrypt(string $value): array
    {
        $raw = base64_decode($value, true);
        if ($raw === false || strlen($raw) < 29) {
            return [];
        }
        $clear = openssl_decrypt(substr($raw, 28), 'aes-256-gcm', $this->key, OPENSSL_RAW_DATA, substr($raw, 0, 12), substr($raw, 12, 16), 'em360:v1');
        if ($clear === false) {
            return [];
        }
        $decoded = json_decode($clear, true);
        return is_array($decoded) ? $decoded : [];
    }
}
