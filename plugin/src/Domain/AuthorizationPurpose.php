<?php

declare(strict_types=1);

namespace EM360\SchoolConnector\Domain;

enum AuthorizationPurpose: string
{
    case Connect = 'connect';
    case Login = 'login';
}
