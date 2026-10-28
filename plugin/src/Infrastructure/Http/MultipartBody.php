<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Infrastructure\Http;

use EM360\SchoolConnector\Domain\ConnectorException;

final class MultipartBody
{
    /**
     * @param array<string, mixed> $fields
     * @param list<array<string, string>> $files
     * @return array{string, string} */
    public static function encode(array $fields, array $files, bool $allowPdf = false, bool $learning = false, bool $preserveFilename = false, bool $officeDocuments = false, bool $spreadsheets = true, bool $audio = false): array
    {
        $boundary = 'em360-' . bin2hex(random_bytes(24));
        $body = '';
        foreach ($fields as $name => $values) {
            self::name($name);
            foreach (is_array($values) ? $values : [$values] as $value) {
                if (!is_scalar($value) && $value !== null) {
                    throw new ConnectorException('Invalid upload field.', 400);
                }
                $body .= '--' . $boundary . "\r\nContent-Disposition: form-data; name=\"" . $name . "\"\r\n\r\n" . (string) $value . "\r\n";
            }
        }
        $total = 0;
        foreach ($files as $file) {
            self::name($file['field'] ?? '');
            $bytes = base64_decode($file['base64'] ?? '', true);
            if ($bytes === false || strlen($bytes) > 5 * 1024 * 1024 || ($total += strlen($bytes)) > 15 * 1024 * 1024) {
                throw new ConnectorException('Uploads exceed the permitted file size.', 413);
            }
            $info = @getimagesizefromstring($bytes);
            $mime = $info['mime'] ?? '';
            if ($allowPdf && str_starts_with($bytes, '%PDF-')) {
                $mime = 'application/pdf';
            }
            $extensions = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
            if ($allowPdf) {
                $extensions['application/pdf'] = 'pdf';
            }
            if ($learning) {
                $ext = strtolower(pathinfo($file['name'] ?? '', PATHINFO_EXTENSION));
                // Match the school's existing lesson-material formats. The API performs its own validation.
                if (in_array($ext, ['docx', 'zip'], true) && str_starts_with($bytes, "PK\x03\x04")) {
                    $mime = $ext === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/zip';
                    $extensions[$mime] = $ext;
                } elseif ($ext === 'doc' && str_starts_with($bytes, "\xD0\xCF\x11\xE0\xA1\xB1\x1A\xE1")) {
                    $mime = 'application/msword';
                    $extensions[$mime] = 'doc';
                }
            }
            if ($officeDocuments) {
                // Case evidence also accepts Word (and, for learner support, Excel) files, matching each API's allow-list.
                $ext = strtolower(pathinfo($file['name'] ?? '', PATHINFO_EXTENSION));
                $office = [
                    'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'doc' => 'application/msword',
                    'xls' => 'application/vnd.ms-excel',
                ];
                if (!$spreadsheets) {
                    unset($office['xlsx'], $office['xls']);
                }
                $zip = str_starts_with($bytes, "PK\x03\x04");
                $ole = str_starts_with($bytes, "\xD0\xCF\x11\xE0\xA1\xB1\x1A\xE1");
                if (isset($office[$ext]) && (in_array($ext, ['docx', 'xlsx'], true) ? $zip : $ole)) {
                    $mime = $office[$ext];
                    $extensions[$mime] = $ext;
                }
            }
            if ($audio) {
                // Recorded answers from the browser: WebM/Opus (Chrome, Firefox), MP4/AAC (Safari), Ogg or WAV.
                $signature = match (true) {
                    str_starts_with($bytes, "\x1A\x45\xDF\xA3") => ['audio/webm', 'webm'],
                    str_starts_with($bytes, 'OggS') => ['audio/ogg', 'ogg'],
                    str_starts_with($bytes, 'RIFF') && substr($bytes, 8, 4) === 'WAVE' => ['audio/wav', 'wav'],
                    substr($bytes, 4, 4) === 'ftyp' => ['audio/mp4', 'm4a'],
                    default => null,
                };
                if ($signature !== null) {
                    [$mime, $extension] = $signature;
                    $extensions[$mime] = $extension;
                }
            }
            if (!isset($extensions[$mime])) {
                throw new ConnectorException($audio ? 'Upload a valid audio recording.' : ($officeDocuments ? ($spreadsheets ? 'Upload a PDF, Word, Excel or image file.' : 'Upload a PDF, Word, JPEG or PNG file.') : ($allowPdf ? 'Upload a valid image or PDF document.' : 'Upload a valid PNG, JPEG or WebP image.')), 400);
            }
            $extension = $extensions[$mime];
            $filename = ($learning || $preserveFilename)
                ? preg_replace('/[^A-Za-z0-9_.-]/', '_', pathinfo($file['name'] ?? 'material', PATHINFO_FILENAME)) : 'image';
            $body .= '--' . $boundary . "\r\nContent-Disposition: form-data; name=\"" . $file['field'] .
                '"; filename="' . substr($filename ?: 'material', 0, 120) . '.' . $extension . "\"\r\nContent-Type: " . $mime . "\r\n\r\n" . $bytes . "\r\n";
        }
        return [$body . '--' . $boundary . "--\r\n", 'multipart/form-data; boundary=' . $boundary];
    }

    private static function name(string $name): void
    {
        if (!preg_match('/^[A-Za-z][A-Za-z0-9_.\[\]]{0,100}$/D', $name)) {
            throw new ConnectorException('Invalid upload field name.', 400);
        }
    }
}
