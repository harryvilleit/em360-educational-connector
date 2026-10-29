<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Infrastructure\Http;

use EM360\SchoolConnector\Contracts\HttpClientInterface;
use EM360\SchoolConnector\Contracts\SettingsStoreInterface;
use EM360\SchoolConnector\Contracts\UserManagementGatewayInterface;
use EM360\SchoolConnector\Domain\ConnectorException;
use EM360\SchoolConnector\Domain\ModuleRequest;
use EM360\SchoolConnector\Domain\UrlPolicy;

final class UserManagementApi implements UserManagementGatewayInterface
{
    /**
     * @param list<array<string, mixed>> $operations */
    public function __construct(
        private readonly HttpClientInterface $http,
        private readonly SettingsStoreInterface $settings,
        private readonly array $operations,
        /** "user-management" (staff modules) or "student-portal"; each forwards only to its own API gateway. */
        private readonly string $portal = 'user-management',
    ) {
        if (!in_array($portal, ['user-management', 'student-portal'], true)) {
            throw new ConnectorException('Unknown school portal.', 500);
        }
    }

    public function context(string $sessionToken, string $module = 'users'): array
    {
        if ($this->portal === 'student-portal') {
            return $this->send($sessionToken, 'GET', '/context', null, []);
        }
        if (!in_array($module, ['users', 'students', 'parents', 'exams', 'fees', 'elearning', 'timetable', 'attendance', 'hostel', 'staff', 'health', 'training', 'learner-support', 'voting', 'reports', 'safeguarding', 'document-designer'], true)) {
            throw new ConnectorException('Unknown school module.', 404);
        }
        return $this->send($sessionToken, 'GET', '/context?module=' . $module, null, []);
    }

    public function execute(string $sessionToken, ModuleRequest $request): array
    {
        $allowed = false;
        foreach ($this->operations as $operation) {
            $pattern = preg_quote((string) $operation['path'], '~');
            $pattern = str_replace('\{weekStartDate\}', '[0-9]{4}-[0-9]{2}-[0-9]{2}', $pattern);
            $pattern = preg_replace('~\\\\\{[A-Za-z]+\\\\\}~', '[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}', $pattern);
            if ($operation['method'] === $request->method && preg_match('~^' . $pattern . '$~D', $request->path)) {
                $allowed = true;
                break;
            }
        }
        if (!$allowed) {
            throw new ConnectorException('This operation is not available in this school portal.', 404);
        }
        $query = $request->query === [] ? '' : '?' . http_build_query($request->query, '', '&', PHP_QUERY_RFC3986);
        $headers = [];
        $body = null;
        if ($request->multipart || $request->files !== []) {
            $learning = str_starts_with($request->path, '/ELearning/') || str_starts_with($request->path, '/WordPressLearning/');
            $staffDocument = (bool) preg_match('~^/WordPressStaff/(?:Staff/[a-fA-F0-9-]{36}/Documents|LeaveAttachments)$~D', $request->path);
            $supportEvidence = (bool) preg_match('~^/LearnerSupport/schools/[a-fA-F0-9-]{36}/cases/[a-fA-F0-9-]{36}/documents$~D', $request->path);
            $safeguardingEvidence = (bool) preg_match('~^/Safeguarding/schools/[a-fA-F0-9-]{36}/cases/[a-fA-F0-9-]{36}/documents$~D', $request->path);
            // Student e-learning: spoken answers are audio; answer snapshots and written pages are images.
            $voiceAnswer = $this->portal === 'student-portal'
                && (bool) preg_match('~^/ELearning/Student/Assignments/Attempts/[a-fA-F0-9-]{36}/Questions/[a-fA-F0-9-]{36}/Voice$~D', $request->path);
            [$body, $contentType] = MultipartBody::encode(
                $request->body ?? [],
                $request->files,
                $request->path === '/Chat/Attachments' || $learning || $staffDocument || $supportEvidence || $safeguardingEvidence,
                $learning,
                $staffDocument || $supportEvidence || $safeguardingEvidence,
                $supportEvidence || $safeguardingEvidence,
                !$safeguardingEvidence,
                $voiceAnswer,
            );
            $headers['Content-Type'] = $contentType;
        } elseif ($request->body !== null) {
            $body = wp_json_encode($request->body);
            if ($body === false) {
                throw new ConnectorException('The school operation could not be encoded.', 400);
            }
            $headers['Content-Type'] = 'application/json';
        }
        return $this->send($sessionToken, $request->method, '/api' . $request->path . $query, $body, $headers);
    }

    /**
     * @param array<string, string> $headers
     * @return array<string, mixed> */
    private function send(string $token, string $method, string $path, ?string $body, array $headers): array
    {
        $base = $this->settings->get()->apiUrl;
        if (!UrlPolicy::isHttps($base)) {
            throw new ConnectorException('Configure the HTTPS School API address.', 503);
        }
        $response = $this->http->request(
            $method,
            rtrim($base, '/') . '/WordPress/' . $this->portal . $path,
            $body,
            ['Accept' => 'application/json', 'Authorization' => 'Bearer ' . $token] + $headers
        );
        $data = json_decode($response->body, true);
        if ($response->status < 200 || $response->status >= 300) {
            $message = is_array($data) ? ($data['message'] ?? $data['Message'] ?? $data['title'] ?? '') : '';
            $text = is_string($message) && $message !== '' ? $message : 'The school operation failed.';
            $status = $response->status >= 400 ? $response->status : 502;
            // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped -- plain API text returned as JSON; escaped wherever it is printed.
            throw ConnectorException::fromApi($text, $status);
        }
        if ($response->status === 204) {
            return [];
        }
        if (!is_array($data)) {
            throw new ConnectorException('EM360 returned an unreadable response.', 502);
        }
        return $data;
    }
}
