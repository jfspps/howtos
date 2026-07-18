---
title: Classes
nav_order: 6
parent: Programming in PHP
---

# Classes

## Introduction

```php
<?php

class User {
    public string $name;
    public string $username;
    public string $password;

    // one can define static class members and methods
    public static string $STATIC_MEMBER = "SOME_CONSTANT";

    // the constructor (return type is by default User, 
    // and not declared); constructor not strictly needed if
    // class member assignment not required
    public function __construct(string $name, string $username, string $password) {
        $this->name = $name;
        $this->username = $username;
        $this->password = $password;
    }

    // PHP 8 provides a more concise way to define constructors;
    // note this does not require public field declarations
    // listed above either (approach below is known as property promotion):
    // public function __construct(public string $name, 
    // public string $username, public string $password) {}

    // note that class methods are public be default 
    // (other scopes PHP 5+ are protected and private, similar to Java)
    function confirmPassword(string $password) : bool {
        return $this->password == $password;
    }

    function greeting() : string {
        return "Parent hello {$this->name}\n";
    }
}

// grab the static
echo "Static class member: " . User::$STATIC_MEMBER . "\n";

$userOne = new User("Joe Bloggs", "joebloggs", "tempPassword");

$isConfirmed = 
    $userOne->confirmPassword("randomPassword") ? "True" : "False";
echo "Password is correct? $isConfirmed\n";
echo $userOne->greeting();
```

## Inheritance

```php
<?php

require '23. Classes.php';

class Admin extends User
{
    public function __construct(public string $name, public string $username, 
                                public string $password,
                                public string $role){}

    // this overrides the parent method; note the signature must be identical
    public function greeting(): string
    {
        return "Admin hello " . $this->name . "\n";
    }
}

$newAdminUser = new Admin("Jane Bloggs", "admin", "adminPassword", "admin");
echo "New admin with role: $newAdminUser->role\n";

$adminPasswordConfirmed = 
    $newAdminUser->confirmPassword("adminPassword") ? "True" : "False";
echo "New admin password is adminPassword: $adminPasswordConfirmed\n";


class NonAdmin extends User
{
    public function __construct(public string $name, public string $username, 
                                public string $password,
                                public string $role){}

    // this overrides the parent method; note the signature must be identical
    public function greeting(): string
    {
        return "Non-admin hello " . $this->name . "\n";
    }
}

$users = [
    new Admin(
        "Mr and Mrs Admin", "admin", "adminPassword", "admin"),
    new NonAdmin(
        "Mr and Mrs Non-admin", "nonadmin", "nonAdminPassword", "non-admin"),
    new User(
        "Mr and Mrs User", "user", "tempPassword")
];

function introducePolymorphic(User $user): void
{
    // use the base class call, and let PHP decide 
    // which to call based on the instance
    echo $user->greeting();
}

// exhibit polymorphism
foreach ($users as $user) {
    introducePolymorphic($user);
}
```

## Class member visibility

```php
<?php

class BankDetails {
    private float $balance = 0;

    // don't have to use getClassMember or 
    // setClassMember as method names

    // recognised as a getter by the IDE 
    // (can be replaced by a property hook)
    public function getBalance(): float {
        return $this->balance;
    }

    public function deposit(float $balance): void {
        if ($balance < 0) {
            $this->balance = 0;
        } else {
            $this->balance += $balance;
        }
    }

    public function withdraw(float $amount): bool {
        if ($amount > 0 && $this->balance >= $amount) {
            $this->balance -= $amount;
            return true;
        }

        return false;
    }
}

$bankAccountDetails = new BankDetails();
echo "Balance: " . $bankAccountDetails->getBalance() . PHP_EOL;

echo "Depositing amount -300" . PHP_EOL;
$bankAccountDetails->deposit(-300);
echo "Balance: " . $bankAccountDetails->getBalance() . PHP_EOL;

echo "Depositing amount 400" . PHP_EOL;
$bankAccountDetails->deposit(400);
echo "Balance: " . $bankAccountDetails->getBalance() . PHP_EOL;

echo "Withdrawing amount -300" . PHP_EOL;
$bankAccountDetails->withdraw(-300);
echo "Balance: " . $bankAccountDetails->getBalance() . PHP_EOL;

echo "Withdrawing amount 500" . PHP_EOL;
$bankAccountDetails->withdraw(500);
echo "Balance: " . $bankAccountDetails->getBalance() . PHP_EOL;

echo "Withdrawing amount 200" . PHP_EOL;
$bankAccountDetails->withdraw(200);
echo "Balance: " . $bankAccountDetails->getBalance() . PHP_EOL;
```

## Singletons

```php
<?php

class DBConnection {
    private static $instance = null;

    private function __construct() {}

    public static function getInstance() {
        // can use this if DBConnection is never 
        // going to be extended with overridden methods
//        if (null === DBConnection::$instance) {
//            DBConnection::$instance = new DBConnection();
//        }

        // if one were to extend this class, then one 
        // should use late static binding to instantiate and get
        // access to the child (overridden) methods; 
        // overall this is the preferred approach
        if (null === static::$instance) {
            static::$instance = new static();
        }

        return DBConnection::$instance;
    }
}

var_dump(DBConnection::getInstance());
```

## Interfaces and abstract classes

```php
<?php

interface HttpMethods
{
    // must all be public
    function sendGetRequest(string $url) : int;
    function sendPostRequest(string $url) : int;
    function sendPutRequest(string $url) : int;
    function sendDeleteRequest(string $url) : int;

    // class members are only supported by 
    // PHP 8.4.0+; alternatively, set up class members
    // with an abstract class that declares class members
}

// abstract classes need not implement 
// interface methods, unlike concrete classes
abstract class HttpMethodsStartupService implements HttpMethods {

    // applying property promotion
    public function __construct(protected string $apiKey)
    {}

    abstract protected function validateApiKey(): bool;
}

// this concrete class must implement 
// all methods not implemented by the abstract class;
// note that apiKey is not accessible to 
// classes that extend HttpMethodsService
class HttpMethodsService extends HttpMethodsStartupService {

    function sendGetRequest(string $url): int
    {
        if ($this->validateApiKey()) {
            echo "GET $url with API key: $this->apiKey\n";
            return 200;
        }

        return 301;
    }

    function sendPostRequest(
        string $url, string $method = 'POST'): int
    {
        if ($this->validateApiKey()) {
            echo "POST $url with API key: $this->apiKey\n";
            return 200;
        }

        return 301;
    }

    function sendPutRequest(
        string $url, string $method = 'PUT'): int
    {
        if ($this->validateApiKey()) {
            echo "PUT $url with API key: $this->apiKey\n";
            return 200;
        }

        return 301;
    }

    function sendDeleteRequest(
        string $url, string $method = 'DELETE'): int
    {
        if ($this->validateApiKey()) {
            echo "DELETE $url with API key: $this->apiKey\n";
            return 200;
        }

        return 301;
    }

    protected function validateApiKey(): bool
    {
        if (null === $this->apiKey){
            throw new Exception("API Key not set");
        }

        return !($this->apiKey == "");
    }
}

$service = new HttpMethodsService("Bearer somethingCryptic");
$service->sendGetRequest("https://api.exmaple.com/param");
```

## Traits

```php
<?php

// Traits group together helper methods and allow classes to share 
// methods there and only then,
// without resorting to inheritance; Traits cannot be instantiated

trait CustomLogger {
    function log(string $message): void
    {
        echo $message . PHP_EOL;
    }
}

class TestTrait {

    // get access to TestTrait methods
    use CustomLogger;

    function __construct(public string $message) {}

    function commit(): void{
        $this->log(
            "Commiting " . $this->message . " to the database...");
    }
}

$testEntity = new TestTrait("TestEntity instance");
$testEntity->commit();
```

## Final and readonly (PHP 8.1+)

```php
<?php

// final classes cannot be extended
final class NonInheritableClass
{
    function onlyHere(string | int | float $message){
        echo "Here and only here: $message\n";
    }
}

class SomeReadOnlyMethods{

    readonly protected string $key;

    // one can also use promoted class members with the readonly keyword
    public function __construct()
    {
        $this->key = 'AB434KKFJmnvp';
    }

    final function readOnlyMethod(){
        echo "This method cannot be overridden\n";
    }

    function printReadOnlyMember(){
        echo 
            "This class member cannot be changed at runtime: $this->key\n";
    }
}

$nonInheritableClass = new NonInheritableClass();
$nonInheritableClass->onlyHere(SomeReadOnlyMethods::class);

$someReadOnlyMember = new SomeReadOnlyMethods();
$someReadOnlyMember->printReadOnlyMember();
$someReadOnlyMember->readOnlyMethod();
```

## Enumerations

```php
<?php
// enum with values assigned (string or int allowed)
enum DaysOfTheWeek : string{
    case Monday = 'Monday';
    case Tuesday = 'Tuesday';
    case Wednesday = 'Wednesday';
    case Thursday = 'Thursday';
    case Friday = 'Friday';
    case Saturday = 'Saturday';
    case Sunday  = 'Sunday';
}

enum DaysOfTheWeekNumerical : int {
    case Monday = 2;
    case Tuesday = 3;
    case Wednesday = 4;
    case Thursday = 5;
    case Friday = 6;
    case SATURDAY = 7;
    case SUNDAY  = 8;
}

$todayIsMonday = DaysOfTheWeek::Monday;

if ($todayIsMonday === DaysOfTheWeek::Monday) {
    echo 'Today\'s string enum value is ' . 
        DaysOfTheWeek::Monday->value . PHP_EOL;
    echo 'Today\'s string enum name is ' . 
        DaysOfTheWeek::Monday->name . PHP_EOL;
}


$todayIsSunday = DaysOfTheWeekNumerical::SUNDAY;
if ($todayIsSunday === DaysOfTheWeekNumerical::SUNDAY) {
    echo 'Today\'s int enum value is ' . 
        DaysOfTheWeekNumerical::SUNDAY->value . PHP_EOL;
    echo 'Today\'s int enum name is ' . 
        DaysOfTheWeekNumerical::SUNDAY->name . PHP_EOL;
}
```
