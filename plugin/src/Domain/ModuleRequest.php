<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Domain;

/** Immutable, bounded input. Endpoint admission is checked separately by the operation catalogue. */
final class ModuleRequest
{
    /**
     * @param array<string, mixed> $query
     * @param array<string, mixed>|null $body
     * @param list<array<string, string>> $files */
    public function __construct(
        public readonly string $method,
        public readonly string $path,
        public readonly array $query,
        public readonly ?array $body,
        public readonly array $files = [],
        public readonly bool $multipart = false,
    ) {
        if (
            !in_array($method, ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], true) || strlen($path) > 300 ||
            !preg_match('~^/[A-Za-z0-9_-]+(?:/[A-Za-z0-9_-]+)*$~D', $path) || count($query) > 30 || count($files) > 10
        ) {
            throw new ConnectorException('Invalid User Management operation.', 400);
        }
        foreach ($query as $key => $value) {
            if (!preg_match('/^[A-Za-z][A-Za-z0-9_]*$/D', (string) $key) || !is_scalar($value) || strlen((string) $value) > 500) {
                throw new ConnectorException('Invalid operation parameters.', 400);
            }
        }
        if ($method === 'GET' && ($body !== null || $files !== [] || $multipart)) {
            throw new ConnectorException('Read operations cannot contain uploads or a body.', 400);
        }
    }

    /**
     * Builds a request from the JSON a portal frame posts to the gateway route.
     * @param mixed $data
     */
    public static function fromArray(mixed $data): self
    {
        if (
            !is_array($data) || !is_string($data['method'] ?? null) || !is_string($data['path'] ?? null) ||
            !is_array($data['query'] ?? null) || !is_array($data['files'] ?? null) ||
            (isset($data['body']) && !is_array($data['body'])) ||
            (isset($data['multipart']) && !is_bool($data['multipart']))
        ) {
            throw new ConnectorException('Invalid school module request.', 400);
        }
        foreach ($data['files'] as $file) {
            if (!is_array($file) || count(array_filter($file, 'is_string')) !== count($file)) {
                throw new ConnectorException('Invalid upload.', 400);
            }
        }
        return new self($data['method'], $data['path'], $data['query'], $data['body'] ?? null, array_values($data['files']), $data['multipart'] ?? false);
    }
}
