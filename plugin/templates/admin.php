<?php
declare(strict_types=1);
if (!defined('ABSPATH')) { exit; }
/** @var array<string, mixed> $s */
/** @var array<string, string> $c */
/** @var string $notice */
/** @var string $portalUrl */
/** @var bool $pagePublished */
/** @var string $studentPortalUrl */
/** @var bool $studentPagePublished */
/** @var bool $studentPortal */
?>
        <div class="wrap em360-admin"><div class="em360-brand">EM360 <span>School connector</span></div>
        <h1>Your school, on your website.</h1><p>Connect an existing EM360 school and give owners and staff a secure overview on this WordPress website.</p>
        <?php if ($notice) : ?><div class="notice notice-info"><p><?php echo esc_html($notice); ?></p></div><?php endif; ?>
        <?php if (!is_ssl()) : ?><div class="notice notice-error"><p>Enable HTTPS before connecting this website.</p></div><?php endif; ?>
        <div class="em360-panel"><h2>1. Service addresses</h2><p>Your EM360 administrator supplies these addresses. Use HTTPS, then sign in as the school owner to approve the connection.</p>
        <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
        <input type="hidden" name="action" value="em360_save"><?php wp_nonce_field('em360_save'); ?>
        <label>EM360 School API base URL<input required type="url" name="api_url" placeholder="https://school-api.example/api/v1" value="<?php echo esc_attr($s['api_url']); ?>" <?php disabled(!empty($c)); ?>></label>
        <label>EM360 website URL<input required type="url" name="frontend_url" value="<?php echo esc_attr($s['frontend_url']); ?>" <?php disabled(!empty($c)); ?>></label>
        <?php submit_button('Save addresses', 'secondary', 'submit', false, !empty($c) ? ['disabled' => 'disabled'] : []); ?></form></div>
        <div class="em360-panel"><h2>2. Set up School Management</h2>
        <?php if ($c) : ?><p class="em360-success">Connected to <strong><?php echo esc_html($c['schoolName']); ?></strong></p><p>Only this school is available through this installation.</p>
        <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>"><input type="hidden" name="action" value="em360_disconnect"><?php wp_nonce_field('em360_disconnect'); ?><?php submit_button('Disconnect website', 'secondary', 'submit', false); ?></form>
        <?php else : ?><p>Register a new School Management product or connect a school you already own. Sign-in and school setup take place securely on EM360, then return here for approval.</p>
        <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>"><input type="hidden" name="action" value="em360_register_school"><?php wp_nonce_field('em360_register_school'); ?><?php submit_button('Register a new school', 'primary', 'submit', false, !$s['api_url'] || !is_ssl() ? ['disabled' => 'disabled'] : []); ?></form>
        <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>"><input type="hidden" name="action" value="em360_connect"><?php wp_nonce_field('em360_connect'); ?><?php submit_button('Connect an existing school', 'secondary', 'submit', false, !$s['api_url'] || !is_ssl() ? ['disabled' => 'disabled'] : []); ?></form><?php endif; ?></div>
        <div class="em360-panel"><h2>3. Publish your portal</h2>
        <?php if ($pagePublished) : ?><p>Your portal page is ready.</p><a class="button button-primary" href="<?php echo esc_url($portalUrl); ?>">Open school portal</a>
        <?php else : ?><p>Create a page containing the EM360 portal. Your other pages and theme will remain in place.</p><form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>"><input type="hidden" name="action" value="em360_create_page"><?php wp_nonce_field('em360_create_page'); ?><label>Page title<input name="page_title" value="School portal" maxlength="100"></label><?php submit_button('Create portal page', 'primary', 'submit', false, !$c ? ['disabled' => 'disabled'] : []); ?></form><?php endif; ?>
        <p>You can also place <code>[em360_school_portal]</code> on a page. The generated page is used as the sign-in return address.</p></div>
        <?php if ($studentPortal) : ?><div class="em360-panel"><h2>4. Publish the student portal</h2>
        <?php if ($studentPagePublished) : ?><p>Your student portal page is ready. Students sign in with their EM360 student account and see only their own records.</p><a class="button button-primary" href="<?php echo esc_url($studentPortalUrl); ?>">Open student portal</a>
        <?php else : ?><p>Create a separate page where students sign in to their own portal: timetable, results, attendance, e-learning, voting and more.</p><form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>"><input type="hidden" name="action" value="em360_create_student_page"><?php wp_nonce_field('em360_create_student_page'); ?><label>Page title<input name="page_title" value="Student portal" maxlength="100"></label><?php submit_button('Create student portal page', 'primary', 'submit', false, !$c ? ['disabled' => 'disabled'] : []); ?></form><?php endif; ?>
        <p>You can also place <code>[em360_student_portal]</code> on a page. The generated page is used as the student sign-in return address.</p></div><?php endif; ?>
        <p><a href="<?php echo esc_url(rtrim($s['frontend_url'], '/') . '/wordpress/connections'); ?>" target="_blank" rel="noopener noreferrer">Manage connected websites in EM360</a></p>
        <p>Register or connect your school, sign in, and switch between your permitted modules. Dedicated portal pages use the full-width school workspace. User Management runs inside WordPress; other modules open in EM360 until their WordPress versions are added.</p>
        </div>
