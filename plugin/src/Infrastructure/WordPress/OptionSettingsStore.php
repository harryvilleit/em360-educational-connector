<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Infrastructure\WordPress;

use EM360\SchoolConnector\Contracts\SettingsStoreInterface;
use EM360\SchoolConnector\Domain\ConnectorConfig;
use EM360\SchoolConnector\Domain\ConnectorException;
use EM360\SchoolConnector\Infrastructure\Storage\RecordCodec;

final class OptionSettingsStore implements SettingsStoreInterface
{
    public const OPTION = 'em360_connector_settings';

    public function get(): ConnectorConfig
    {
        $record = get_option(self::OPTION, []);
        $record = is_array($record) ? $record : [];
        return new ConnectorConfig(
            RecordCodec::text($record, 'api_url'),
            RecordCodec::text($record, 'frontend_url') ?: 'https://em360s.com',
            RecordCodec::number($record, 'page_id'),
            RecordCodec::number($record, 'student_page_id'),
        );
    }

    public function save(ConnectorConfig $config): void
    {
        $record = ['api_url' => $config->apiUrl, 'frontend_url' => $config->frontendUrl, 'page_id' => $config->pageId, 'student_page_id' => $config->studentPageId];
        if (!update_option(self::OPTION, $record, false) && get_option(self::OPTION) !== $record) {
            throw new ConnectorException('The website could not save its configuration.', 503);
        }
    }
}
