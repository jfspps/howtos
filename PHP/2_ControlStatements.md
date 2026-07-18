---
title: Control statements
nav_order: 2
parent: Programming in PHP
---

# Control statements

## if statements

```php
<?php

if (2 > 10){
    echo "Two is greater than 10";
} else
    echo "Two is not greater than 10";

echo "\n";

// note that curly braces are not required anywhere, even for multiple ifelse's
if ((int) "0" == false)
    echo "String to integer casting works";

echo "\n";

$teasPerDay = 8;

if ($teasPerDay > 10){
    echo "Too much tea";
} elseif ($teasPerDay < 10 && $teasPerDay > 0) {
    echo "You're fine";
} else {
    echo "You don't drink tea";
}
```

## while loops

```php
<?php

$counter = 0;

while ($counter < 10){
    echo "Counter: $counter \n";
    $counter++;
}

// as with other languages, one can break from a loop
while($counter < 100){
    if ($counter == 26)
        break;

    echo "Counter: $counter \n";
    $counter++;
}
```

## for loops

```php
<?php

for ($x = 1; $x <= 5; $x++) {
    echo "Counter: $x\n";
    sleep(1);
}
```

## do-while loops

```php
<?php

$attempts = 0;
$secret = "password";
$entry = "";

do {
    echo "Please enter the password...\n";

    // get the trimmed input from the console
    $entry = trim(fgets(STDIN));

    if ($entry == $secret){
        echo "Success!\n";
        break;
    } else {
        echo "Wrong password!\n";
    }

    $attempts++;

    //probably easier doing all this with a for loop
    if ($attempts == 3){
        echo "Password entry ceased";
    }

} while ($attempts < 3);
```

## foreach loops

```php
<?php

$letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

foreach ($letters as $letter) {
    echo "Letter: $letter\n";
}

// the equivalent to Maps
$map = [
    'A' => "Apples",
    'B' => "Bananas",
    'C' => "Cheese",
    'D' => "Dude",
];

// one can use other identifiers for $key and $value; the ordering of the
// literals stated after "as" keyword follow the same order key => value
foreach ($map as $key => $value) {
    echo "Key: $key, value: $value\n";
}

// keys are optional, the following processes the value only
foreach ($map as $value) {
    echo "Value: $value\n";
}
```

## switch statements

```php
<?php

$letter = [
    'A',
    'B',
    'C',
    'D',
];

// pick a random numerical position in the list
$position = rand(0, count($letter) - 1);

switch ($position) {
    case 0:
        echo "Value at index 0 is $letter[0]";
        break;
    case 1:
        echo "Value at index 1 is $letter[1]";
        break;
    case 2:
        echo "Value at index 2 is $letter[2]";
        break;
    case 3:
        echo "Value at index 3 is $letter[3]";
        break;
    default:
        echo "Hmmm, something went wrong!";
}
```

## match expressions (PHP8+)

```php
<?php

$httpStatus = rand(1, 5) * 100;

// match is an alternative to the switch expression; break is assumed; 
// no type coercion so === is applied;
// PHP 8.0 or above only, check with
// sudo update-alternatives --config php
$message = match ($httpStatus) {
    200 => 'OK',
    300 => 'Bad Request',
    400 => 'Client error',
    500 => 'Server Error',
    default => 'Unknown error'
};

var_dump("$httpStatus: $message");
```
