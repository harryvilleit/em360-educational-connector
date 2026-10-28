<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Presentation;

final class TemplateRenderer
{
    public function __construct(private readonly string $directory)
    {
    }

    /** @param array<string, mixed> $data */
    public function render(string $name, array $data): string
    {
        if (!in_array($name, ['admin', 'portal', 'student-portal'], true)) {
            throw new \InvalidArgumentException('Unknown plugin template.');
        }
        extract($data, EXTR_SKIP);
        ob_start();
        try {
            require $this->directory . '/' . $name . '.php';
            return (string) ob_get_contents();
        } finally {
            ob_end_clean();
        }
    }
}
