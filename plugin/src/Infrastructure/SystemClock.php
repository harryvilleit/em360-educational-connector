<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Infrastructure;

use EM360\SchoolConnector\Contracts\ClockInterface;

final class SystemClock implements ClockInterface
{
    public function now(): int
    {
        return time();
    }
}
