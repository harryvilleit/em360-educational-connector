<?php
declare(strict_types=1);
if (!defined('ABSPATH')) {
    exit;
}
?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="em360-skip-link" href="#em360-workspace-content">Skip to school workspace</a>
<?php while (have_posts()) : ?>
    <?php the_post(); ?>
    <?php the_content(); ?>
<?php endwhile; ?>
<?php wp_footer(); ?>
</body>
</html>
