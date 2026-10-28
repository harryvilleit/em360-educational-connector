<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Contracts;

interface ClockInterface
{
    public function now(): int;
}
