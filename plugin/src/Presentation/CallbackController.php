<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Presentation;

use EM360\SchoolConnector\Application\CompleteAuthorization;
use EM360\SchoolConnector\Domain\AuthorizationPurpose;

final class CallbackController
{
    public function __construct(
        private readonly CompleteAuthorization $complete,
        private readonly Navigation $navigation,
        private readonly ErrorResponder $errors,
    ) {
    }

    public function register(): void
    {
        add_action('admin_post_em360_callback', [$this, 'handle']);
        add_action('admin_post_nopriv_em360_callback', [$this, 'handle']);
    }

    public function handle(): never
    {
        nocache_headers();
        header('Referrer-Policy: no-referrer');
        try {
            $result = $this->complete->execute(
                $this->field('state'),
                $this->field('code'),
                isset($_GET['error']),
                get_current_user_id(),
                current_user_can('manage_options'),
            );
        } catch (\Throwable $error) {
            $response = $this->errors->rest($error);
            $data = $response->get_error_data();
            $status = is_array($data) && is_int($data['status'] ?? null) ? $data['status'] : 500;
            wp_die(esc_html($response->get_error_message()), '', ['response' => $status]);
        }
        if ($result->purpose === AuthorizationPurpose::Connect) {
            $this->navigation->admin($result->cancelled ? 'Connection cancelled.' : 'School connected. Create or open your portal page.');
        }
        $this->navigation->portal($result->audience);
    }

    private function field(string $name): string
    {
        $value = $_GET[$name] ?? '';
        return is_string($value) ? wp_unslash($value) : '';
    }
}
