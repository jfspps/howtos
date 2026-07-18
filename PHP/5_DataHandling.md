---
title: Data handling
nav_order: 5
parent: Programming in PHP
---

# Data handling

## Handling strings

```php
<?php

$fiftyFive = "55 years old";

echo "First character: $fiftyFive[0]\n";
echo "Last character: $fiftyFive[-1]\n";

echo "First three characters: [" . 
    substr($fiftyFive, 0, 3) . "]\n";
echo "Next three characters: [" . 
    substr($fiftyFive, 3, 3) . "]\n";
echo "All characters from index 3: [" . 
    substr($fiftyFive, 3) . "]\n";

echo "All uppercase characters: [" . 
    strtoupper($fiftyFive) . "]\n";
echo "All lowercase characters: [" . 
    strtolower($fiftyFive) . "]\n";

echo "Uppercase first character: [" . 
    ucfirst(strtolower($fiftyFive)) . "]\n";

$addedString = " today";
$fiftyFive .= $addedString;
echo "Appended string with \"$addedString\": [" . $fiftyFive . "]\n";


/*
 * Searching and replacing characters
 */
echo "Where is 55? Position: " . 
    strpos($fiftyFive, "55") . "\n";

echo "Replaced 55 with 56: " . 
    str_replace("55", "56", $fiftyFive) . "\n";
// note that the string is not updated:
echo "Current string content: " . $fiftyFive . "\n";

// regular expressions; this outputs $matches
// (\b is word boundary, \w{} is word length
preg_match_all('/\b\w{5}\b/', $fiftyFive, $matches);

var_dump($matches);

foreach ($matches as $match) {
    echo "Words that are five characters long:\n";

    foreach ($match as $word) {
        echo $word . "\n";
    }
}

/*
 * Formatting strings
 */
$name = "Jimmy";
$age = 35;

printf("%s is %d years old.\n", $name, $age);

$csv = "row1,row2,row3,row4";
$arrayFromCsv = explode(",", $csv);
foreach ($arrayFromCsv as $row) {
    echo $row . "\n";
}

$semicolonDelimitedString = implode(";", $arrayFromCsv);
var_dump($semicolonDelimitedString);
echo "Semicolon delimited: $semicolonDelimitedString\n";


// pad to a total length of 30
$leftHandSidePaddedString = str_pad(
    $csv, 30, '-', STR_PAD_LEFT);
// RHS padding is the default
$rightHandSidePaddedString = str_pad(
    $csv, 30, '-');
$paddedString = str_pad(
    $csv, 30, '-', STR_PAD_BOTH);

echo "Left hand padded:\t\t" . 
    $leftHandSidePaddedString . "\n";
echo "Right hand padded:\t\t" . 
    $rightHandSidePaddedString . "\n";
echo "Padded on both sides:\t" . 
    $paddedString . "\n";


$usernameEntered = " Joe Bloggs   ";
echo "Original username: [" . 
    $usernameEntered . "]\n";
echo "Trimmed username: [" . trim(
    ($usernameEntered)) . "]\n";

/**
 * URL encoding
 */
$url = "https://somewhere.com/app/#login?page=@#$%";
echo "Url: $url\n";

$encodedUrl = urlencode($url);
echo "Encoded Url: $encodedUrl\n";

$decodedUrl = urldecode($encodedUrl);
echo "Decoded Url: $decodedUrl\n";

/**
 * Converting HTML tags to (safer)
 */
$html = <<<EOD
<!DOCTYPE html>
<html lang="en">
<body>

<h2 title="I'm a header">The title Attribute</h2>

<p title="I'm a tooltip">Mouse over this paragraph, 
to display the title attribute as a tooltip.</p>

</body>
</html>
EOD;

echo $html . "\n\n";

echo "Encode all HTML tags as escaped characters...\n";
$encodedHtml = htmlspecialchars($html);
echo $encodedHtml . "\n\n";

// one can
$decodedHtml = html_entity_decode($encodedHtml);
echo "Decoded to HTML tags again...\n";
echo $decodedHtml . "\n\n";

/**
 * Base 64 encoding/decoding
 *
 * Handy when saving data in text that does not support binary format
 */
// use CSV defined above
$base64EncodedCsv = base64_encode($csv);
echo "Base64 encoded CSV: " . $base64EncodedCsv . "\n";

echo "CSV decoded from Base64: " . base64_decode($base64EncodedCsv) . "\n";
```

## Handling numbers

```php
<?php

$int = 42;
$float = 3.14;

echo "Casted int to float: " . (float) $int . "\n";
echo "Casted float to int: " . (int) $float . "\n";

echo "Rounded Pi 3.14 to 1 d.p.: " . round($float, 1) . "\n";
echo "Rounded Pi 3.14 to nearest int: " . round($float) . "\n";

echo "Flooring (round down) $float: " . floor($float) . "\n";
echo "Ceiling (round up) $float: " . ceil($float) . "\n";

$numbers = [1,2,3,4,5,6,7,8,9];

var_dump($numbers);
echo "Minimum value: " . min($numbers) . "\n";
echo "Maximum value: " . max($numbers) . "\n";

echo "Random number between 1 and 10: " . rand(1, 10) . "\n";

echo "Absolute of -134: " . abs(-134) . "\n";

echo "Formatted Pi 3.14 to 2 d.p.: " . 
    number_format(3.14, 2) . "\n";
echo "Formatted Pi 3.14 to 1 d.p.: " . 
    number_format(3.14, 1) . "\n";

echo "Formatted Pi 3.14 to 2 d.p. with comma: " . 
    number_format(3.14, 2, ',') . "\n";

$largeFloat = 13695684905.556;

echo "Formatted $largeFloat with default separators: " .
    number_format($largeFloat, 2) . "\n";

echo "Formatted $largeFloat with number and decimal separator: " .
    number_format($largeFloat, 2, '!', '-') . "\n";
```

## Handling arrays (PHP 7.4+)

```php
<?php

$numericalArray = [3, 2, 1];

// resembles a map
$associativeArray = [
    'name' => 'John',
    'surname' => 'Smith',
    'age' => 40,
    'town' => 'London'
];

echo "Numerical array index 2: " . $numericalArray[2] . PHP_EOL;
echo "Associative array, key:\"name\": " . 
    $associativeArray['name'] . PHP_EOL;

// adding to an array
$numericalArray[] = 4;
$associativeArray['postcode'] = 'AB12 3CD';

echo "Numerical array index 3: " . $numericalArray[3] . PHP_EOL;
echo "Associative array, key:\"postcode\": " . 
    $associativeArray['postcode'] . PHP_EOL;



$twoDimArray = [
    [1, 2, 3]
];

// add to first array
$twoDimArray[0][] = 4;

// note that $twoDimArray[0] = 4; replaces the first array

// add another numerical array
$twoDimArray[] = [0];
var_dump($twoDimArray);

echo "Number of numerical elements: " . 
    count($numericalArray) . "\n";




sort($numericalArray);
echo "Sorted (ascending) numerical elements, first element: " . 
    $numericalArray[0] . "\n";
rsort($numericalArray);
echo "Reversed (descending) numerical elements, first element: " . 
    $numericalArray[0] . "\n";

echo "Original map...";
var_dump($associativeArray);

echo "\nMap sorted by value...";
asort($associativeArray);
var_dump($associativeArray);

echo "\nMap sorted by key...";
ksort($associativeArray);
var_dump($associativeArray);



echo "\nResulting from mapping from a different array...\n";
$generatedNumbers = range(1, 10);
$squaredNumbers = array_map(
    fn ($number) => $number ** 2, $generatedNumbers);
var_dump($squaredNumbers);

echo "Filtered array...\n";
$evenNumbers = array_filter(
    $generatedNumbers, fn ($number) => $number % 2 === 0);
var_dump($evenNumbers);

echo "Reduced array...\n";
// $carry starts at 0, given by the last parameter,
// and stored by fn for each element
$reducedArray = array_reduce(
    $generatedNumbers, fn($carry, $element) => $carry + $element, 0);
var_dump($reducedArray);

echo "Resulting from unpacking an array...\n";
// unpacking arrays is available from PHP 7.4+
$anotherGeneratedArray = [-3, ...$generatedNumbers, 101];
var_dump($anotherGeneratedArray);

echo "Mapping from an array based on position...\n";
[$one, $two] = $anotherGeneratedArray;
var_dump($one, $two);

echo "Same again, mapping from an array based on " . 
    "position, but skipping the second element...\n";
[$posOne, , $posThree] = $anotherGeneratedArray;
var_dump($posOne, $posThree);



$setOne = range(1, 10);
$setTwo = range(5, 15);

echo "Getting the intersection of two arrays...\n";
var_dump(array_intersect($setOne, $setTwo));

echo "Getting the difference of two arrays, " . 
    " in setOne that are not in setTwo...\n";
var_dump(array_diff($setOne, $setTwo));

echo "Getting the difference of two arrays, " . 
    "in setTwo that are not in setOne...\n";
var_dump(array_diff($setTwo, $setOne));


// can merge or unite any number of arrays

// this adds all elements from all arrays into a new array
echo "Merging two arrays...\n";
var_dump(array_merge($setOne, $setTwo));
var_dump([...$setOne, ...$setTwo]);

echo "Union of two arrays...the array key is " . 
    "index based, the first array takes precedence\n";
var_dump([1, 2, 3] + [3, 4, 5, 66]);

echo "Merging two maps...the second map's values " . 
    "take precedence over the first if the same key exists\n";
var_dump(array_merge(
    ['name' => 'John', 'surname' => 'Smith'], 
    ['name' => 'Jim', 'unknown' => false])
    );
var_dump(
    [...['name' => 'John', 'surname' => 'Smith'], 
        ...['name' => 'Jim', 'unknown' => false]]);

echo "Union of two maps...the first map's values " . 
    " take precedence over the second if the same key exists\n";
var_dump(
    ['name' => 'John', 'surname' => 'Smith'] + 
    ['name' => 'Jim', 'unknown' => false]);



echo "Getting the keys of an array...\n";
$keys = array_keys($associativeArray);
var_dump($keys);

echo "Getting the values of an array...\n";
$values = array_values($associativeArray);
var_dump($values);


echo "Key \"name\" is in the array? " . 
    array_key_exists('name', $associativeArray) . "\n";
echo "Value \"Smith\" is in the array? " . 
    in_array('Smith', $associativeArray) . "\n";


echo "The index of value 2 in setOne: " . 
    array_search(2, $setOne) . "\n";
echo "The key of value \"Smith\" in associativeArray: " . 
    array_search('Smith', $associativeArray) . "\n";
```
