---
title: Expressions and data types
nav_order: 1
parent: Programming in PHP
---

# Expressions and data types

## Expressions

With PHP installed, run the php script (assuming it is `aScript.php`) as

```bash
php aScript.php
```

```php
<?php

// to run PHP scripts at the console, enter php filename.php;
// the scripts run top to bottom, so prerequisite values 
// must be declared first

// printing to the terminal
echo "First expressions with PHP\n";

$a_valid_variable = 10;
$anotherValidVariable = 5;

// String concatenation with .
echo "Existing value: " . $anotherValidVariable . "\n";
// double quotes to automatically print out variable values:
echo "Existing value: $anotherValidVariable\n";
// Strings can go in single quotes but this results in a 
// literal output (special characters are ignored):
echo 'Existing value: $anotherValidVariable\n';


echo "Updated value: " . $anotherValidVariable = 200 . "\n";

$product = 6 * $a_valid_variable;

echo "The product: " . $product . "\n";

$thisIsTrue = True;

echo "Is this true - " . $thisIsTrue ? "True\n" : "False\n";
```

## Data types

```php
<?php

// PHP types are implied on assignment

// casting implicit Strings to Integer
$fiftyFive = "55";

// concatenate with period .
echo "String: " . $fiftyFive . "\n";
echo "Casted integer: " . (int) $fiftyFive;

// Single-quoted strings output characters literally, no interpolation
echo 'String: $fiftyFive \n';


// multiline strings, one with interpolation, one without
$multilineStringWithInterpolation = <<<EOD
This is multi-line string.
With Interpolation: $fiftyFive
EOD;

$multilineStringWithoutInterpolation = <<<'EOD'
This is multi-line string.
Without Interpolation: $fiftyFive
EOD;

echo $multilineStringWithInterpolation;
echo "\n";

echo $multilineStringWithoutInterpolation;
echo "\n";
```

## Practical data types

```php
<?php

// reveal the data type and its value with var_dump()
$aNumber = 22;
var_dump($aNumber);

$aString = "22";
var_dump($aString);

// passing multiple variables or results of expressions
// the second param shows booleans from int = 0 are false, 
// true for all other +/- values
var_dump($aNumber, $aNumber == true, $aNumber == 22, false);

// strict equality, checks the values and data types, 
// $aNumber is not a boolean, so the following is false
var_dump($aNumber === true);

// in some cases, PHP will coerce String to integers; 
// arrays are zero-based
$aMixedArray = [100, "1"];
var_dump($aMixedArray[0] + $aMixedArray[1]);

// data type precedence in place places float types over int types
$aVeryMixedArray = [100, "1", 9.99];
var_dump(
    $aVeryMixedArray[0] + 
    $aVeryMixedArray[1] + 
    $aVeryMixedArray[2]);

// reveal the array and also the data types and value of each element
var_dump(
    $aVeryMixedArray, 
    $aVeryMixedArray[0], 
    $aVeryMixedArray[1],
    $aVeryMixedArray[2]);

// adding to the end of an array
$aVeryMixedArray[] = -8;
var_dump($aVeryMixedArray[3]);

// example of truncation of float when cast to int
echo (int) 95.5;
```
