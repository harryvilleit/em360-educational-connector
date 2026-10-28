<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Infrastructure\Storage;

use EM360\SchoolConnector\Domain\AuthorizationPurpose;
use EM360\SchoolConnector\Domain\BrowserSession;
use EM360\SchoolConnector\Domain\ConnectorException;
use EM360\SchoolConnector\Domain\PendingAuthorization;
use EM360\SchoolConnector\Domain\PortalAudience;
use EM360\SchoolConnector\Domain\PortalSession;
use EM360\SchoolConnector\Domain\SchoolConnection;

/** Keeps version 0.1's persisted field names compatible with the typed models. */
final class RecordCodec
{
    /** @param array<string, mixed> $record */
    public static function text(array $record, string $key): string
    {
        return is_string($record[$key] ?? null) ? $record[$key] : '';
    }

    /** @param array<string, mixed> $record */
    public static function number(array $record, string $key): int
    {
        $value = $record[$key] ?? 0;
        return is_int($value) || (is_string($value) && ctype_digit($value)) ? (int) $value : 0;
    }

    /**
     * Records written before 0.24.0 have no audience: they are staff sign-ins.
     * @param array<string, mixed> $record
     */
    public static function audience(array $record): PortalAudience
    {
        return PortalAudience::tryFrom(self::text($record, 'audience') ?: 'staff')
            ?? throw new ConnectorException('Invalid portal session.', 401);
    }

    /** @param array<string, mixed> $record */
    public static function connection(array $record): SchoolConnection
    {
        return new SchoolConnection(
            self::text($record, 'connectionId'),
            self::text($record, 'connectionSecret'),
            self::text($record, 'schoolId'),
            self::text($record, 'schoolName'),
        );
    }

    /** @return array<string, mixed> */
    public static function connectionRecord(SchoolConnection $value): array
    {
        return [
            'purpose' => 'connect',
            'connectionId' => $value->id,
            'connectionSecret' => $value->secret,
            'schoolId' => $value->schoolId,
            'schoolName' => $value->schoolName,
        ];
    }

    /** @param array<string, mixed> $record */
    public static function pending(array $record): PendingAuthorization
    {
        $purpose = AuthorizationPurpose::tryFrom(self::text($record, 'purpose'));
        if ($purpose === null) {
            throw new ConnectorException('Invalid pending sign-in request.');
        }
        return new PendingAuthorization(
            $purpose,
            self::text($record, 'verifier'),
            self::text($record, 'requestId'),
            self::text($record, 'browserKey'),
            self::number($record, 'adminId'),
            self::text($record, 'connectionId'),
            self::audience($record),
        );
    }

    /** @return array<string, mixed> */
    public static function pendingRecord(PendingAuthorization $value): array
    {
        return [
            'purpose' => $value->purpose->value,
            'verifier' => $value->verifier,
            'requestId' => $value->requestId,
            'browserKey' => $value->browserKey,
            'adminId' => $value->adminId,
            'connectionId' => $value->connectionId,
            'audience' => $value->audience->value,
        ];
    }

    /** @param array<string, mixed> $record */
    public static function browser(string $key, array $record): BrowserSession
    {
        $token = self::text($record, 'sessionToken');
        $portal = $token === '' ? null : new PortalSession($token, self::number($record, 'expiresAt'), self::text($record, 'connectionId'), self::audience($record));
        return new BrowserSession($key, self::text($record, 'csrf'), $portal);
    }

    /** @return array<string, mixed> */
    public static function browserRecord(BrowserSession $value): array
    {
        $record = ['csrf' => $value->csrf];
        if ($value->portal !== null) {
            $record += ['sessionToken' => $value->portal->token, 'expiresAt' => $value->portal->expiresAt, 'connectionId' => $value->portal->connectionId, 'audience' => $value->portal->audience->value];
        }
        return $record;
    }
}
