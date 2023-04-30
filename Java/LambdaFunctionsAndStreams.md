---
title: Java Lambda functions and Streams
nav_order: 15
parent: Intermediate Java
---

# Java 8 lambda functions

Lambda functions (also known as _closures_) provide a more concise and arguably clearer execution of essentially unnamed, anonymous (class) methods. Lambda functions are composed of three main parts, the argument list, the arrow token and the body, as

```new newObject((argumentList) -> functionBody())```

or for some already defined object as

```existingObject((argumentList) -> functionBody())```

The curly braces are required for multiple statements. The compiler matches the argument list with a method defined
by the object's interface (note here that the functionBody defines the method so a class is not relevant here).
Since interfaces can list overloaded functions, it is necessary to restrict interfaces to have only one abstract method which needs defining.
    
Such interfaces are known as functional interfaces and consequently lambda functions only apply to functional interfaces.

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

## Functional interfaces and the ```default``` keyword

Post Java 8, interfaces can also define default interface methods (with implementation) with the ```default``` keyword. This is in addition to ```private``` and ```static``` interface methods which can also be implemented. All other methods declared in the interface (among default, private and static methods) are assumed _abstract_ methods or are implicitly abstract. A functional interface is an interface with only one abstract method. Lambda functions are defined in the context of the functional interface that they refer to and then executed elsewhere.
 

```java
interface FunctionalInt {
    int someCalc();
  }
    
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
{ 
  // ...currently in the main function body...
  UpperConcat uc = (s1, s2) -> s1.toUpperCase() +  s2.toUpperCase();

}

interface UpperConcat {
  public String upperAndConcat(String s1, String s2);
}
```

The above lambda could be passed directly to a method without storing locally as uc, if appropriate. A 'return' keyword is not required in the above case. For function bodies with more than one statement, the following form is expected:

```java
UpperConcat uc = (s1, s2) -> {
  // getClass() refers to the Class where the lambda expression resides
  System.out.println("The lambda expression's class is " + getClass().getSimpleName());

  // ...more statements, as required...

  return s1.toUpperCase() + s2.toUpperCase();
};
```

## Scope

Anonymous classes can only access external variables if they are declared final. The anonymous class defines the behaviour of the function but are not necessarily executed straight away. This means that the external variables can change after they were defined in code. If the variable changed to the point where the anonymous class cannot process it (leading to an exception) when required, then the program would likely fail. One way to ensure that the variable does not change at any point is to declare it 'final'. In the next two snippets below, variable i is accessible to all in doSomething().

The example below assumes what would happen if an anonymous class would receive _if_ it was granted access to variable i. In reality, the next two snippets would never compile.

```java
public class Main {

  public static void main(String[] args) {
    AClass someClass = new AClass();
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

class AClass {
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
    AClass someClass = new AClass();
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

class AClass {
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

To give the anonymous class (and lambda function) access to variable i, first one must declare i as 'final'. This consequently makes _any_ operation on variable i as illegal. Hence the post-decremental operator on i is removed.

```java
public class Main {

  public static void main(String[] args) {
    AClass someClass = new AClass();
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

class AClass {
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

If variable i is in scope of the anonymous class or lambda function _and_ i is not changed, then variable i need not be declared 'final' (so is effectively final), as shown below. 

```java
public class Main {

  public static void main(String[] args) {
    AClass someClass = new AClass();
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

class AClass {
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

What follows is an overview of functional interfaces which can demonstrate the use of lambdas. Note that Lambdas are never a requirement when writing Java.

## The Predicate interface

One can use the Predicate interface (representing a predicate, a boolean-valued function) to determine which elements from a foreach iteration are processed. The test is performed by Predicate's ```test()``` method.

```java
private static void printByValue(List<SomeClass> objects,
  String requirementsMsg,
  Predicate<SomeClass> valueRequired) {

  System.out.println(requirementsMsg);

  for(SomeClass obj : objects) {
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
printByValue(objectList, "Objects with value less than 25", new Predicate<SomeClass>() {
  @Override
  public boolean test(SomeClass obj) {
      return obj.getValue() < 25;
  }
});
```

Executing against different conditions is probably more convenient using lambdas.

## The Function and BiFunction interfaces

One can define a function which receives one parameter and returns a value.

```java
Function<Student, String> getLastName = (Student student) -> {
  return student.getName().substring(student.getName().indexOf(' ') + 1);
};

// get the last name of the second student
String lastName = getLastName.apply(students.get(1));
```

Functions can be passed as a parameter, as such, to a function which can then decide which method to call.

```java
Function<Student, String> getFirstName = (Student student) -> {
  return student.getName().substring(0, student.getName().indexOf(' '));
};

private static String getAName(Function<Student, String> getName, Student student) {
  return getName.apply(student);
}

// call getFirstName with getAName
System.out.println(getAName(getFirstName, student));

// call getLastName with getAName
System.out.println(getAName(getFirstName, employee));
```

One can use getAName() type functions to guarantee that a function is always called but which is executed is determined by some condition. Typical scenarios include callbacks.

Following the same print name example, one can chain functions together.

```java
Function<Student, String> upperCase = student -> student.getName().toUpperCase();

Function chainedFunction = getLastName.andThen(upperCase);

// print the last name of the first student in uppercase
System.out.println(chainedFunction.apply(students.get(0)));
```

It is also possible to add more functions and more 'andThen' calls to chain more functions. Furthermore, the BiFunction interface allows for functions which accept two arguments and returns one value.

```java
BiFunction<String, Student, String> concatAge = (String name, Student student) -> {
  return name.concat(" " + student.getAge());
};

String upperName = upperCase.apply(students.get(0));

// pass the returns of upperName and get() to concatAge.apply()
System.out.println(concatAge.apply(upperName, students.get(0)));
```

## Streams

A stream in this context is a sequence of consecutive computations. The Collection interface has a stream() method which returns a stream and is the first call made. The resultant stream can then be handled with a sequence of methods. The order of the elements in the stream is the same as they appear in a List (undefined for a Set). The example below also demonstrates the calling of static methods with the class name, through _method referencing_ (one can also conduct method referencing of non-static methods though objects of a class provided the class is instantiated).

```java
List<String> someBingoNumbers = Arrays.asList(
  "N40", "N36",
    "B12", "B6",
    "G53", "G49", "G60", "G50", "g64",
    "I26", "I17", "I29",
    "O71");
    
// each method is part of the Stream interface
someBingoNumbers.stream()
        // pass each element as the argument to String.toUpperCase()
        // and return them to the stream
        .map(String::toUpperCase)
        // pass a predicate here; only elements s which return true pass here
        .filter(s->s.startsWith("G"))
        .sorted()
        .forEach(System.out::println);
```

The above example passes a lambda function as a parameter (to ```filter()```) and represents one of the more useful applications of lambda functions. Another way of building streams without using a Collection and linking them with Function interfaces is given below.

```java
Stream<String> ioNumberStream = Stream.of("I26", "I17", "I29", "O71");
Stream<String> inNumberStream = Stream.of("N40", "N36", "I26", "I17", "I29", "O71");
Stream<String> concatStream = Stream.concat(ioNumberStream, inNumberStream);

System.out.println(concatStream
        .distinct()
        .peek(System.out::println)
        .count());
```

Some operations are intermediate, which take in and then return elements to/from the stream. Terminal operations, such as ```count()```, do not return processed elements and are always found once at the end of the stream statement.

Finally, streams can be initiated with stream(), passing the Collection as a parameter.

```java
ArrayList<SomeClass> list = stream(someCollection)
  .map(SomeClass::someStaticMethod)
  .collect(Collectors.toList);
```

## FlatMaps - Lists of Lists

Streams can be composed of lists as elements (that is, a stream outputs a list of lists), each of which can be streamed again. The snippet below effectively prints all employees from all departments.

```java
// departments is a List, which also contains a List of employees
departments.stream()
.flatMap(department -> department.getEmployees().stream())
// print the employees, by department; the department is not printed
.forEach(System.out::println);
```

The flatMap() method returns a stream, in this case, flattens nested lists. One gets the list from the list (in this case with getEmployees List) and sends them to a separate stream which is processed by subsequent methods. Note that the original stream is not sent along the method chain. That is, department objects are not printed.

One can gather elements from a stream and store them in a new Collection.

```java
Map<Integer, List<Employee>> groupedByAge = departments.stream()
.flatMap(department -> department.getEmployees().stream())
// gather the employees and group them by age
.collect(Collectors.groupingBy(employee -> employee.getAge()));
```

It is also possible to print elements from a stream according to certain criteria with lambdas:

```java
departments.stream()
.flatMap(department -> department.getEmployees().stream())
// e1 and e2 are employees, through a BiFunction, to return the youngest employee
.reduce((e1, e2) -> e1.getAge() < e2.getAge() ? e1 : e2)
.ifPresent(System.out::println);
```

Reduce() is a BiFunction and returns the youngest employee. Reduce() is the terminal operation and returns an Optional, hence the need to 'unwrap' the Optional with ifPresent().

## Method referencing

Tied closely to streams, methods can be referred to either through static methods of a given class, non-static methods through an instance or via a constructor.

+ Static methods: ```ClassName::staticMethodName```
+ Non-static methods via instances: ```instanceName::instanceMethodName```
+ Constructor references: ```ClassName::new```

The following snippet shows how Role data transfer objects (DTOs) are built by calling the instance roleMapper's RoleToRoleDTO() method.

```java
RoleMapper roleMapper = new RoleMapper();

List<RoleDTO> roleDTOs = roleService
  .findAll()
  .stream()
  .map(roleMapper::roleToRoleDTO)
  .collect(Collectors.toList());
```

The following snippet shows how a collection of (any) Object which extends GrantedAuthority are built by mapping a list of authorities to a new instance of SimpleGrantedAuthority, via a constructor.

```java
@Override
public Collection<? extends GrantedAuthority> getAuthorities() {
    return stream(this.user.getAuthorities())
            .map(SimpleGrantedAuthority::new)
            .collect(Collectors.toList());
}
```
