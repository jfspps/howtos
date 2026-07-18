---
title: Include and require
nav_order: 7
parent: Programming in PHP
---

# Include and Require

```php
<?php

// global declaration are not strictly needed 
// here but do flag up in the IDE
global $database_host, $database_user, $database_pass;

// include references to unknown files flag an 
// error but the script continues to run
//include 'config.php';

// require references to unknown files will not 
// allow the script to run at all (causes a fatal error)
require 'config.php';

// allowed to call include or require any 
// number of times but normally only applied once;
// note that any methods called in the above scripts 
// are executed first

echo "Database host: $database_host\n";
echo "Database user: $database_user\n";
echo "Database password: $database_pass\n";
```

In config.php:

```php
<?php

$database_host = "localhost";
$database_user = "root";
$database_pass = "123456";

echo "Method called from config.php\n";
```
