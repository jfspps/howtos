---
title: Lambda functions and Functional Interfaces
nav_order: 15
parent: Intermediate Java
---

# Java 8 lambda functions

Lambda functions (also known as _closures_) were introduced from Java 8 onwards, and provide a more concise and arguably clearer execution of essentially unnamed, anonymous (class) methods. Lambda functions are composed of three main parts, the argument list, the arrow token and the body, as

```new newObject((argumentList) -> functionBody())```

or for some already defined object as

```existingObject((argumentList) -> functionBody())```

The curly braces are required for multiple statements. The compiler matches the argument list with _a_ method defined by the object's interface (note here that the function body defines the method so a class is not relevant here). Such interfaces are known as _functional interfaces_ and consequently lambda functions only apply to functional interfaces.

Lambda functions can be used for the Comparator interface, for example, to define the behaviour of compare(). Below is the anonymous class implementation of compare().

```java
Collections.sort(objects, new Comparator<SomeClass>() {
    @Override
    public int compare(SomeClass object1, SomeClass object2) {
        return object1.getString().compareTo(object2.getString());
    }
});
```

Ultimately, the override uses Comparable's compareTo() method for a String type. The Lambda function is actually the second parameter of sort(), and overrides the compare() method of Comparator and ends up using the compareTo() method of Comparable.

```java
Collections.sort(objects, (SomeClass object1, SomeClass object2) ->
  object1.getString().compareTo(object2.getString());
  
// since the class of objects is inferable, the compiler can deduce the
// type of the parameters and infer:
Collections.sort(objects, (object1, object2) ->
  object1.getString().compareTo(object2.getString());
```

## Functional interfaces

Java 8 also introduced _functional interfaces_: interfaces with only one abstract method. Lambda functions are defined in the context of the functional interface that they refer to and then executed elsewhere. A functional interface can have any number of ```default``` (i.e. implemented) methods.

```java
interface FunctionalInt {
    int someCalc();
  }
    
  // somewhere-else in the logic...

  // define the method with a lambda
  FunctionalInt anInt = () -> 10;
  FunctionalInt aLargerInt = () -> 100_000;

  // later in the execution

  // tempInt is assigned the value 10
  int tempInt = anInt.someCalc();

  // tempInt is now assigned the value 100,000
  tempInt = aLargerInt.someCalc();
```

The type given in the functional interface could be made generic and then defined later.

```java
interface FunctionalInterface<T> {
    T someMethod();
  }
    
  // define the abstract, generic method with a lambda 
  FunctionalInterface<String> aReturn = () -> "10";
  FunctionalInterface<Integer> anotherReturn = () -> 10;

  // later in the execution
  Integer tempInt = aReturn.someMethod();
  String tempString = anotherReturn.someMethod();

  // this would throw an error
  Integer tempInt = anotherReturn.someMethod();
```

## Return values

Take the functional interface and return values as shown below.

```java
interface UpperConcat {
  public String upperAndConcat(String s1, String s2);
}

{ 
  // ...currently in the main function body...
  UpperConcat uc = (s1, s2) -> s1.toUpperCase() +  s2.toUpperCase();

}
```

The above lambda could be passed directly to a method without storing locally as ```uc```, if appropriate. A ```return``` keyword is not required in the above case. 
For function bodies with more than one statement, the following form is expected:

```java
UpperConcat uc = (s1, s2) -> {
  // getClass() refers to the Class where the lambda expression resides
  System.out.println("The lambda expression's class is " + getClass().getSimpleName());

  // ...more statements, as required...

  return s1.toUpperCase() + s2.toUpperCase();
};
```

## Scope

Anonymous classes can only access external variables if they are declared final. The anonymous class defines the behaviour of the function but are not necessarily executed straight away. This means that the external variables can change after they were defined in code. If the variable changed to the point where the anonymous class cannot process it (leading to an exception) when required, then the program would likely fail. One way to ensure that the variable does not change at any point is to declare it ```final```. In the next two snippets below, variable i is accessible to all in doSomething().

The example below assumes what would happen if an anonymous class would receive _if_ it was granted access to variable i. In reality, the next two snippets would never compile.

```java
public class Main {

  public static void main(String[] args) {
    AnonClass someClass = new AnonClass();
    int output = someClass.doSomething();
    System.out.print(output);
  }

  public final static int calculate(Divider div, int input) {
    return div.theDivider(input);
  }
}

// the functional interface
interface Divider {
  public int theDivider(int num);
}

class AnonClass {
  public int doSomething() {
    int i = 1;
    {
      // this is a definition; nothing executed yet
      // note that num is not visible to doSomething
      Divider result = new Divider() {
      @Override
        public int theDivider(int num) {
          int someResult = 1 / num;
          System.out.println(i);
          // need to return an int here
          return someResult;
        }
      };

      // divider is not aware of changes to i 
      // so the compiler flags a warning here
      i--;

      // additionally, this ultimately try 1/0 (!)
      return Main.calculate(result, i);
    }
  }
}
```

The lambda form, with the same problems, is below.

```java
public class Main {

  public static void main(String[] args) {
    AnonClass someClass = new AnonClass();
    int output = someClass.doSomething();
    System.out.print(output);
  }

  public final static int calculate(Divider div, int input) {
    return div.theDivider(input);
  }
}

// the functional interface
interface Divider {
  public int theDivider(int num);
}

class AnonClass {
  public int doSomething() {
    int i = 1;
    {
      // this is a definition; nothing executed yet
      // note that num is not visible to doSomething
      Divider result = (num) -> {
        int someResult = 1 / num;
        System.out.println(i);
        // need to return an int here
        return someResult;
        }
      };

      // divider is not aware of changes to i 
      // so the compiler flags a warning here
      i--;

      // additionally, this ultimately try 1/0 (!)
      return Main.calculate(result, i);
    }
  }
}
```

To give the anonymous class (and lambda function) access to variable ```i```, first one must declare ```i``` as ```final```. This consequently makes _any_ operation on variable ```i``` as illegal. Hence the post-decremental operator on ```i``` is removed.

```java
public class Main {

  public static void main(String[] args) {
    AnonClass someClass = new AnonClass();
    int output = someClass.doSomething();
    System.out.print(output);
  }

  public final static int calculate(Divider div, int input) {
    return div.theDivider(input);
  }
}

interface Divider {
  public int theDivider(int num);
}

class AnonClass {
  public int doSomething() {
    final int i = 1;
    {
      // this is a definition; nothing executed yet
      // note that num is not visible to doSomething
      Divider result = (num) -> {
        int someResult = 1 / num;
        System.out.println(i);
        return someResult;
        }
      };

      //returns 1
      return Main.calculate(result, i);
    }
  }
}
```

If variable ```i``` is in scope of the anonymous class or lambda function _and_ ```i``` is not changed, then variable ```i``` need not be declared ```final```. The variable ```i``` is _effectively_ final, as shown below. 

```java
public class Main {

  public static void main(String[] args) {
    AnonClass someClass = new AnonClass();
    int output = someClass.doSomething();
    System.out.print(output);
  }

  public final static int calculate(Divider div, int input) {
    return div.theDivider(input);
  }
}

interface Divider {
  public int theDivider(int num);
}

class AnonClass {
  public int doSomething() {
    int i = 1;
    // this is a definition; nothing executed yet
    Divider result = (num) -> {
      int someResult = 1 / num;
      System.out.println(i);
      return someResult;
      }
    };

    //returns 1
    return Main.calculate(result, i);
  }
}
```

## The foreach method

Iterable objects can be handled with lambdas, for example, with foreach. The focus is more towards functional programming, where the emphasis is more about direct input and output.

```java
someList.foreach(() -> {
  doLotsOfStuff();
  doMoreStuff();
});
```

What follows is an overview of functional interfaces already available in ```java.util.function``` package. which can demonstrate the use of lambdas. Note that Lambdas are never a requirement when writing Java.

+ Consumer and BiConsumer
+ Predicate
+ Function and BiFunction
+ Supplier

## The Consumer and BiConsumer _functional_ interface

Consumer functional interfaces consume input but do not return anything (or if anything is returned it is ignored), using the method ```accept()```. There is the ```Consumer``` interface which accepts one argument and ```BiConsumer``` that accepts to arguments of the same or different type.

This can be used for logging purposes, akin to many other ```void``` methods.

```java
{
  // in main() somewhere

  Long longVal = 123L;

  Consumer<Long> printLong = (someVal) -> 
    System.out.println("Long value: " + someVal);

  Consumer<String> printString = (someVal) -> 
    System.out.println("String value: " + someVal);

  runConsumer(longVal, printLong);

  // this would not build
  runConsumer("random string", printLong);
}

// the caller should know that T is compatible with the consumer lambda passed
public static void runConsumer(T input, Consumer<T> consumer){

  // run the Consumer interface function
  consumer.accept(input);
}
```

The ```BiConsumer``` interface can be used in much the same way as ```Consumer``` however this now
expects two arguments. Both arguments need not be of the same type.

## The Predicate _functional_ interface

One can use the Predicate interface (a functional interface representing a _predicate_, a boolean-valued function) to determine which elements from a foreach iteration are processed. The test is performed by Predicate's ```test()``` method.

```java
private static void printByValue(List<SomeClass> objects,
  String requirementsMsg,
  Predicate<SomeClass> valueRequired) {

  System.out.println(requirementsMsg);

  for(SomeClass obj : objects) {

    // use the Predicate passed to test a conditional
    if (valueRequired.test(obj)) {

      // do something with obj's that satisfy the predicate
      System.out.println(obj.getSomeIdentifier());
    }
  }
}
```

Passing the definition as the third parameter, one can then print according to testValue.

```java
printByValue(objectList, "Objects with values greater than 50", obj -> obj.getValue() > 50);
```

The anonymous class version of the above would be:

```java
printByValue(objectList, "Objects with value less than 25", 
  new Predicate<SomeClass>() {
    @Override
    public boolean test(SomeClass obj) {
        return obj.getValue() < 25;
    }
  }
);
```

Executing against different conditions is probably more convenient using lambdas.

## The Function and BiFunction _functional_ interfaces

```Function``` and ```BiFunction``` are Java 8 functional interfaces with ```apply()``` as the implementable method and ```andThen()``` as a ```default``` method used to funnnel output from one implemented ```Function``` or ```BiFunction``` method as an argument to another.

One can define the logic to ```apply()``` which receives one parameter (```Student```) and returns a value (a ```String```):

```java
// first in the list of the parameter and second is the return type
Function<Student, String> getLastName = (Student student) -> {
  return student.getName().substring(student.getName().indexOf(' ') + 1);
};

// invoke apply()
String lastName = getLastName.apply(students.get(1));
```

Functions can be passed as a parameter, as such, to a function which can then decide which method to call.

```java
// define the functional interface logic to apply()
Function<Student, String> getFirstName = (Student student) -> {
  return student.getName().substring(0, student.getName().indexOf(' '));
};

// define a normal function, passing the Function logic as the first parameter, and the object that should be
// passed the Function logic
private static String getAName(
  Function<Student, String> getName, 
  Student student) {

  return getName.apply(student);
}

// call getFirstName with getAName
System.out.println(getAName(getFirstName, student));

// call getLastName with getAName
System.out.println(getAName(getLastName, student));
```

One can use getAName() type functions to guarantee that a function is always called but which is executed is determined by some condition. Typical scenarios include callbacks.

Following the same print name example, one can chain functions together with ```andThen()```.

```java
Function<String, String> upperCase = name -> name.toUpperCase();

// define the first Function called and immediately call the next
Function<Student, String> chainedFunction = getLastName.andThen(upperCase);

// get the first student and pass to both functions; the first returns the last name String, which then
// forms the argument for the next function in the chain, printing the last name in uppercase
System.out.println(chainedFunction.apply(students.get(0)));
```

It is also possible to add more functions and more 'andThen' calls to chain more functions. 

The ```BiFunction``` interface allows for functions which accept two arguments (```Function``` only accepts one argument) and returns one value.

```java
BiFunction<String, Student, String> concatAge = (String name, Student student) -> {
  return name.concat(" " + student.getAge());
};

String upperName = upperCase.apply(students.get(0).getName());

// pass the returns of upperName and get() to concatAge.apply()
System.out.println(concatAge.apply(upperName, students.get(0)));
```
## Supplier _functional_ interface

This functional interface requires no parameters and returns a value of the type given. The method in question is ```get()```.

```java
{
  // in main() somewhere

  Supplier<Integer> generateAnInt = () -> 
    new Random().nextInt(0, 256);

  Integer randomInt = generateAnInt.get();
  System.out.println("Random integer: " + randomInt);
}
```
