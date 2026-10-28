<?php
declare(strict_types=1);
if (!defined('ABSPATH')) {
    exit;
}
/** @var string $restBase */
/** @var string $moduleUrl */
/** @var string $homeUrl */
?>
<div class="em360-portal" data-em360-root data-rest-base="<?php echo esc_attr($restBase); ?>" data-home-url="<?php echo esc_url($homeUrl); ?>" data-module-url="<?php echo esc_attr($moduleUrl); ?>"><p role="status">Loading your school portal…</p></div>
