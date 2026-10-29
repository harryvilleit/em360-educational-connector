<?php
declare(strict_types=1);
if (!defined('ABSPATH')) { exit; }
/** @var array{title: string, base: string, configuration: string, styles: list<string>} $frame */
?><!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="referrer" content="no-referrer">
<title><?php echo esc_html($frame['title']); ?></title>
<base href="<?php echo esc_url($frame['base']); ?>">
<?php
wp_print_inline_script_tag($frame['configuration'], ['id' => 'em360-runtime', 'type' => 'application/json']);
wp_print_styles($frame['styles']);
wp_script_modules()->print_enqueued_script_modules();
?>
</head>
<body><div id="root"></div></body>
</html>
