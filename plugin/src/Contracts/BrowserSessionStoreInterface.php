<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Contracts;

use EM360\SchoolConnector\Domain\BrowserSession;
use EM360\SchoolConnector\Domain\PortalSession;

interface BrowserSessionStoreInterface
{
    public function read(): ?BrowserSession;
    public function ensure(): BrowserSession;
    public function rotate(PortalSession $session): BrowserSession;
    public function clear(): void;
}
