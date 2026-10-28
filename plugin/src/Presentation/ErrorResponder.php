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
        // Avoid logging messages/arguments which may include credentials or callback codes.
        error_log('EM360 connector internal failure: ' . get_class($error));
        return new \WP_Error('em360_internal', 'The school portal could not complete this request. Please try again.', ['status' => 500]);
    }
}
