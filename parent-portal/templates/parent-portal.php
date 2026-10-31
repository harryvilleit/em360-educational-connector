<?php

declare(strict_types=1);

if (!defined('ABSPATH')) {
    exit;
}
/** @var string $restBase */
/** @var string $frameUrl */
/** @var string $homeUrl */
?>
<div class="em360-portal em360-parent-portal" data-em360-parent-root data-rest-base="<?php echo esc_attr($restBase); ?>" data-home-url="<?php echo esc_url($homeUrl); ?>" data-frame-url="<?php echo esc_attr($frameUrl); ?>"><p role="status">Loading your parent portal…</p></div>
