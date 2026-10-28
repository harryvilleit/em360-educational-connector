<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Domain;

/** The portal a sign-in opens. A staff session never opens the student portal, and the reverse. */
enum PortalAudience: string
{
    case Staff = 'staff';
    case Student = 'student';
}
