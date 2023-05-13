---
title: Streams
nav_order: 16
parent: Intermediate Java
---

# Streams

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

Reduce() is a BiFunction and returns the youngest employee. Reduce() is the terminal operation and returns an ```Optional``` (new to Java 8), hence the need to 'unwrap' the Optional with ifPresent().

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
