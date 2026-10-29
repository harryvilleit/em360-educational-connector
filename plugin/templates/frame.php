<?php
declare(strict_types=1);
if (!defined('ABSPATH')) { exit; }
/** @var array{title: string, base: string, configuration: string, script: string, styles: list<string>, preloads: list<string>} $frame */
?><!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="referrer" content="no-referrer">
<title><?php echo esc_html($frame['title']); ?></title>
<base href="<?php echo esc_url($frame['base']); ?>">
<?php wp_print_inline_script_tag($frame['configuration'], ['id' => 'em360-runtime', 'type' => 'application/json']); ?>
<?php wp_print_script_tag(['type' => 'module', 'crossorigin' => true, 'src' => esc_url($frame['script'])]); ?>
<?php foreach ($frame['preloads'] as $em360_preload) : ?>
<link rel="modulepreload" crossorigin href="<?php echo esc_url($em360_preload); ?>">
<?php endforeach; ?>
<?php foreach ($frame['styles'] as $em360_style) : ?>
<link rel="stylesheet" crossorigin href="<?php echo esc_url($em360_style); ?>">
<?php endforeach; ?>
</head>
<body><div id="root"></div></body>
</html>
