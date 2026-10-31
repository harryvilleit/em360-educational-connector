<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Infrastructure\WordPress;

use EM360\SchoolConnector\Contracts\HttpClientInterface;
use EM360\SchoolConnector\Domain\ConnectorException;
use EM360\SchoolConnector\Domain\HttpResponse;

final class WordPressHttpClient implements HttpClientInterface
{
    /** @param array<string, string> $headers */
    public function request(string $method, string $url, ?string $body, array $headers): HttpResponse
    {
        $learning = str_contains($url, '/WordPress/user-management/api/ELearning/') ||
            str_contains($url, '/WordPress/user-management/api/WordPressLearning/');
        // Course generation waits for the AI draft; course content can exceed the default size cap.
        $training = str_contains($url, '/WordPress/user-management/api/Training/');
        // Learner-support case records carry plans, reviews and contributions in one response.
        $support = str_contains($url, '/WordPress/user-management/api/LearnerSupport/');
        // Report sources: whole-school rosters, broadsheets and overviews.
        $report = (bool) preg_match('~/WordPress/user-management/api/(?:Grade/Broadsheet|School/[a-fA-F0-9-]{36}/Overview|Student/GetSchoolStudents/)~', $url);
        // Safeguarding case files and document templates (layouts with embedded images, up to 1.5 MB).
        $records = str_contains($url, '/WordPress/user-management/api/Safeguarding/') ||
            str_contains($url, '/WordPress/user-management/api/SchoolDocuments/') ||
            // Student portal: course workspaces, results and timetables for one learner.
            str_contains($url, '/WordPress/student-portal/') || str_contains($url, '/WordPress/parent-portal/');
        $generation = $training && (bool) preg_match('~/Training/Courses/[a-fA-F0-9-]{36}/Generate(?:\?|$)~', $url);
        $response = wp_safe_remote_request($url, [
            'method' => $method, 'headers' => $headers, 'body' => $body,
            'timeout' => $generation ? 180 : ($learning ? 120 : ($training ? 45 : 25)), 'redirection' => 0, 'sslverify' => true,
            'limit_response_size' => $learning || $training || $support || $report || $records ? 4194304 : 1048576,
        ]);
        if (is_wp_error($response)) {
            throw new ConnectorException('EM360 is temporarily unavailable. Please try again.', 503, 'em360_network');
        }
        return new HttpResponse((int) wp_remote_retrieve_response_code($response), wp_remote_retrieve_body($response));
    }
}
