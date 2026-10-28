<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Contracts;

interface TokenGeneratorInterface
{
    public function generate(): string;
}
