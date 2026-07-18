---
title: Functions
nav_order: 3
parent: Programming in PHP
---

# Functions

## Introduction

```php
<?php

// return type is defined after the argument list
function getRandomValue(): int
{
    $someValue = rand(1, 100);
    var_dump($someValue);

    return $someValue;
}

// no return type (void); message param is required; 
// the default behaviour is to pass by value
function printToConsole($message): void
{
    echo "String received: $message" . PHP_EOL;
}

// no return type (void); message param is given a default 
// (i.e. is optional);
// not method overloading not available in PHP
function printToConsoleOptional($message = "Nothing provided"): void
{
    echo "Optional string received: $message" . PHP_EOL;
}

echo "Random value " . getRandomValue() . "\n";

echo "Enter a sequence of characters (required): \n";
$someString = trim(fgets(STDIN));

printToConsole($someString);

printToConsoleOptional();
printToConsoleOptional("How about this?");


// accessing variables outside a function's scope with the 
// keyword global; this is generally not recommended
$someOutsideVariable = "outside";

function printOutsideVariable(): void{
    global $someOutsideVariable;
    echo $someOutsideVariable . "\n";
}

printOutsideVariable();



// static variables defined in a function remain in escape
// when the function returns
function updateStaticVariable(): void{
    static $someStaticVariable = 12;
    $someStaticVariable++;
    echo "Static variable: $someStaticVariable" . PHP_EOL;
}

for ($int = 0; $int < 10; $int++) {
    updateStaticVariable();
}
```

## Function arguments

```php
<?php

// needed to enforce strict types (PHP 7+); 
// relevant to function arguments
declare(strict_types=1);

// no return type (void); message param is given 
// a default (i.e. is optional);
// not method overloading not available in PHP
function printToConsoleOptional($message = "Nothing provided"): void
{
    echo "Optional string received: $message" . PHP_EOL;
}

// required argument always precede optional arguments
function printToConsoleRequiredWithOptional(
    $requiredString, $optionalString = "Nothing provided"): void
{
    echo "Required string received: $requiredString" . PHP_EOL;
    echo "Optional string received: $optionalString" . PHP_EOL;
}

// since declare(strict_types=1) is stated, passing anything 
// other than a string will result in a fatal error
function printToConsoleString(string $mustBeAString): void
{
    echo "A string entered: $mustBeAString" . PHP_EOL;
}

printToConsoleOptional();
printToConsoleOptional("The Dude!");

printToConsoleRequiredWithOptional("The Dude!");
printToConsoleRequiredWithOptional("The Dude!", "Me again!");

printToConsoleOptional(44);

// type coercion disabled due to declare(strict_types=1)
//printToConsoleString(345); // fails
printToConsoleString("345"); // OK
```

## Variadic functions

```php
<?php

// these functions have in undefined list of 
// parameters at run-time;
// use the declare() techniques to enforce 
// strict type checking;
// also note here that the return type is not 
// defined here and is implied/coerced
function sum(... $arguments){
    $sum = 0;

    foreach($arguments as $argument){
        $sum += $argument;
    }

    return $sum;
}

// both calls are equivalent; the first unpacks 
// the array, the second is explicit
var_dump(sum(... [2, 4, 5, 6, 3, 6]));
var_dump(sum(2, 4, 5, 6, 3, 6));

// can also mix argument types, but only 
// if the array is passed last
var_dump(sum(10, ... [2, 4, 5, 6, 3, 6]));

// variadic parameters are effectively optional 
// (i.e. no arguments also counts)
var_dump(sum());
```

## Anonymous functions

```php
<?php

// equivalent to Java's lambda functions
$anonFunction = function ($someParam) {
    return "Param passed: $someParam\n";
};

// treat the anonymous function like an object
echo $anonFunction(2);
echo $anonFunction("2");


// one can pass anonymous functions as 
// parameters to other functions
function outerFunction(
    $anAnonFunction, $anonFunctionParameters) : string {
    return $anAnonFunction($anonFunctionParameters);
}

echo outerFunction($anonFunction, 2);
echo outerFunction($anonFunction, "2");


// anonymous functions can be given access 
// to variables not part of the parameter list;
// this particular approach sees anOuterVariable 
// passed by value, not by reference, so
// when the anonymous function returns, 
// the external variable is not modified*
$anOuterVariable = "Outside anon function";

$anonFunction = function ($someParam) use ($anOuterVariable) {
    $anOuterVariable = "Inside anon function";
    return "Anon: external variable: $anOuterVariable, " . 
        "param passed: $someParam\n";
};

echo $anonFunction("Outer and param accessed");
echo "Script: external variable: $anOuterVariable\n";

// *modification requires accessing the external variable by reference
$anonFunction = function ($someParam) use (&$anOuterVariable) {
    $anOuterVariable = "Inside anon function";
    return "Anon: external variable: $anOuterVariable, " . 
        " param passed: $someParam\n";
};

echo $anonFunction("Outer and param accessed");
echo "Script: external variable: $anOuterVariable\n";
```
