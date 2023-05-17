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

## Java 9 Reactive Streams

Java 9 introduces capabilities that enable data to traverse a _flow_ from a _Publisher_ to any number of _Subscribers_. This amounts to overriding a number of methods:

+ Publisher ```subscribe()```
+ Subscriber
  - ```onSubscribe()```
  - ```onNext()```
  - ```onError()```
  - ```onComplete()```

The relevant classes are located in the ```java.util.concurrent``` package. The Subscriber class implemented the ```Subscriber``` interface. The Subscriber calls ```request(n)``` to indicate it is ready to receive data,
where ```n``` is the number of elements it can receive.

```java
public class DemoSubscriber<T> implements Subscriber<T> {

    private Subscription subscription;

    public List<T> consumedElements = new LinkedList<>();

    // called prior to all stream processing
    @Override
    public void onSubscribe(Subscription subscription) {
        this.subscription = subscription;
        subscription.request(1);
    }

    // called when the Publisher sends a message
    @Override
    public void onNext(T item) {
        System.out.println("Received:" + item);
        consumedElements.add(item);
        subscription.request(1);
    }

    // thrown whenever errors occur
    @Override
    public void onError(Throwable t) {
        t.printStackTrace();
    }

    // called when the Publisher is closed
    @Override
    public void onComplete() {
        System.out.println("Publisher closed; transfer complete");
    }
}
```

The publisher is based on the ```SubmissionPublisher``` generic which implements the Publisher interface. Developers are not recommended
to implement the Publisher interface in majority of use cases. If it is necessary, then developers can confirm their new library meets the 
reactive streams specifications by consulting the [Reactive Streams Technology Compatibility Kit](https://github.com/reactive-streams/reactive-streams-jvm/tree/master/tck) project.

```java
    // establish the Publisher
    SubmissionPublisher<String> publisher = new SubmissionPublisher<>();

    // establish the Subscriber and give the go-ahead
    DemoSubscriber<String> subscriber = new EndSubscriber<>();
    publisher.subscribe(subscriber);


    List<String> items = List.of("1", "x", "2", "x", "3", "x");

    // call submit() to send each String
    items.forEach(publisher::submit);

    // remember to close the Publisher; this then invokes the Subscriber's onComplete()
    publisher.close();
```

The data is fed in a _non-blocking back-pressure_ manner in that the transmission does not hold up the subject thread 
and hinder it from performing other tasks. The _back-pressure_ management mechanism 
(which is in reference to the Publisher's point of view, increasing as the Subscriber struggles more to consume each message) 
which refers to the restriction of flow rate by the Subscriber. Above, the subscriber's ```request()``` call indicates when the Subscriber 
is ready to receive more data (in a sense, data is pulled from the Publisher, not pushed). Some authors refer to the _upstream_ from Publisher
to Subscriber and the _downstream_ from Subscriber to Publisher.

Java 8 developers could enlist ```CompletableFutures``` to manage computations asynchronously (i.e. "wait-free") but this is usually more difficult to work with.
