<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Presentation;

final class TemplateRenderer
{
    public function __construct(private readonly string $directory)
    {
    }

    /**
     * Prints a template. Templates escape every value they output.
     *
     * @param array<string, mixed> $data
     */
    public function display(string $name, array $data): void
    {
        $this->assertKnown($name);
        extract($data, EXTR_SKIP);
        require $this->directory . '/' . $name . '.php';
    }

    /** @param array<string, mixed> $data */
    public function render(string $name, array $data): string
    {
        $this->assertKnown($name);
        extract($data, EXTR_SKIP);
        ob_start();
        try {
            require $this->directory . '/' . $name . '.php';
            return (string) ob_get_contents();
        } finally {
            ob_end_clean();
        }
    }

    private function assertKnown(string $name): void
    {
        if (!in_array($name, ['admin', 'portal', 'student-portal'], true)) {
            throw new \InvalidArgumentException('Unknown plugin template.');
        }
    }
}
