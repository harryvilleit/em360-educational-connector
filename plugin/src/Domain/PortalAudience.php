<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Domain;

/** The portal a sign-in opens. Each session opens only its own portal: staff, student or parent. */
enum PortalAudience: string
{
    case Staff = 'staff';
    case Student = 'student';
    case Parent = 'parent';
}
