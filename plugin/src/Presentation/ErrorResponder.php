<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Presentation;

use EM360\SchoolConnector\Domain\ConnectorException;

final class ErrorResponder
{
    public function rest(\Throwable $error): \WP_Error
    {
        if ($error instanceof ConnectorException) {
            return new \WP_Error($error->errorCode, $error->getMessage(), ['status' => $error->status]);
        }
        // Only the error type is logged, never messages or arguments (they may hold credentials or sign-in codes),
        // and only when the site owner has turned on the WordPress debug log.
        if (defined('WP_DEBUG_LOG') && WP_DEBUG_LOG) {
            error_log('EM360 connector internal failure: ' . get_class($error)); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
        }
        return new \WP_Error('em360_internal', 'The school portal could not complete this request. Please try again.', ['status' => 500]);
    }
}
