---
title: More Functions
nav_order: 4
parent: Programming in PHP
---

# More Functions

## Null in PHP

```php
<?php

// true
var_dump(null == null);
var_dump(null == "");
var_dump(null == 0);
var_dump(null == []);


// false
var_dump(null == true);
var_dump(null == 2);

$unknown = null;

// checking for null: true
var_dump(null == $unknown);
var_dump(is_null($unknown));

// checking if not null: false
var_dump(isset($unknown));

// note, if strict type checking is applied, then one 
// cannot pass null (null not given a data type)
function someFunction($arg) : void {
    if (null == $arg) {
        echo "Null passed\n";
    } else {
        echo "Non-null passed: $arg\n";
    }
}

// all passing null
someFunction(null);
someFunction([]);
someFunction(0);
someFunction("");

// passing non-null
someFunction("null");
```

## Union types

```php
<?php

declare(strict_types=1);

// define a function that can accept a 
// definite list of data types
function checkParamType(
    int|float|string $value): string
{
    // match boolean "true" to one of 
    // the following listed;
    // in this case it can only be one
    // of three since we are using union types
    return match (true) {
        is_int($value) => "Integer value\n",
        is_float($value) => "Float value\n",
        is_string($value) => "String value\n",
    };
}

echo checkParamType(2);
echo checkParamType("3");
echo checkParamType(4.55);

// this results in a fatal error
//echo checkParamType(null);
```

## Named functions

```php
<?php

function namedParams(
    string $someName, bool $report):string {

    return $report ? 
    "Report name $someName\n" : 
    "Nothing to report\n";
}

echo namedParams("John Doe", true);
echo namedParams("John Doe", false);

// no change to the function implementation, 
// just declare argument identifiers in the call
echo namedParams(report : false, someName: "John Doe");
echo namedParams(report : true, someName: "John Doe");
```

## Arrow functions (PHP 7.4+)

```php
<?php

// these are much like anonymous functions, with a shorter 
// in notation, suited for very simple, granular functions
$shortFunc = fn(string $reply) => "Reply : $reply";

echo $shortFunc("Joe Bloggs");

// passing the anonymous function to others
var_dump($shortFunc("Joe Bloggs"));

// unlike anonymous functions, arrow functions can use 
// external variables
$anOuterVariable = "Outside anon function";

echo $shortFunc($anOuterVariable);
var_dump($shortFunc($anOuterVariable));


// using arrow functions as building blocks for higher-order 
// functions e.g. filterByValue(), which take other functions
// as parameters or returns other functions
$users = [
    ['id' => 1, 'name' => 'Joe', 'role' => 'USER'],
    ['id' => 2, 'name' => 'Jane', 'role' => 'ADMIN'],
    ['id' => 3, 'name' => 'Jim', 'role' => 'CLIENT'],
];

function filterByValue($key, $value){
    return fn($input) => $input[$key] == $value;
}

// $isAdmin is takes $input (in this case an array) and 
// finds data (elements) in which arrayName['role'] == 'ADMIN'
$isAdmin = filterByValue("role", "ADMIN");

// array_filter takes each element from $users (i.e. an array)
// and passes the elements of said array to isAdmin
$admin = array_filter($users, $isAdmin);

var_dump($admin);
```

## Generator functions

```php
<?php

function countDown(int $start): array {
    $result = [];
    for ($i = $start; $i > 0; $i--){
        // recall, this adds to the end of the array
        echo "Generating new random number...\n";
        $result[] = random_int(1, 100);
    }

    return $result;
}

foreach (countDown(5) as $number){
    echo "Reporting random number...\n";
    echo $number . "\n";
}

// $result resides in memory; to circumvent this,
//  the above can be rewritten as a generator function,
function countDownGenerator(int $start): Generator {
    for ($i = $start; $i > 0; $i--){
        // recall, this adds to the end of the array
        echo "Generating new random number...\n";

        // at this stage, countDownGenerator() "returns"
        // the following before resuming, so $result is not needed
        yield random_int(1, 100);
    }
    // no return
}

/**
 * Compared to the stepwise output, the following 
 * will print to the console:
 *
 * Generating new random number...
 * Reporting generated random number...
 * 2
 * Generating new random number...
 * Reporting generated random number...
 * 16
 *
 * The randomly generated number is returns (yields) 
 * as defined before resuming with its logic. This is
 * advantageous for very large datasets.
 */
foreach (countDownGenerator(5) as $number){
    echo "Reporting generated random number...\n";
    echo $number . "\n";
}
```
