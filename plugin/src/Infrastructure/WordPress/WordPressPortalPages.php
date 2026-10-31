<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Infrastructure\WordPress;

use EM360\SchoolConnector\Contracts\PortalPageGatewayInterface;
use EM360\SchoolConnector\Domain\ConnectorException;
use EM360\SchoolConnector\Domain\PortalAudience;

final class WordPressPortalPages implements PortalPageGatewayInterface
{
    public function isPublished(int $id): bool
    {
        return $id > 0 && get_post_status($id) === 'publish';
    }

    public function create(string $title, PortalAudience $audience = PortalAudience::Staff): int
    {
        $slug = match ($audience) {
            PortalAudience::Student => 'student-portal',
            PortalAudience::Parent => 'parent-portal',
            PortalAudience::Staff => 'school-portal',
        };
        $id = wp_insert_post([
            'post_title' => $title,
            'post_name' => $slug,
            'post_content' => '[em360_' . str_replace('-', '_', $slug) . ']',
            'post_type' => 'page',
            'post_status' => 'publish',
        ], true);
        if (is_wp_error($id)) {
            throw new ConnectorException('The portal page could not be created.', 503);
        }
        return $id;
    }

    public function url(int $id): string
    {
        return $this->isPublished($id) ? (get_permalink($id) ?: home_url('/')) : home_url('/');
    }
}
