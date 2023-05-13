---
title: Java Abstract classes and Interfaces
nav_order: 1
parent: Intermediate Java
---

# Abstract classes and interfaces

When to use an abstract class and when to use interfaces is sometimes not always clear since they both appear to offer the same features. Neither abstract classes nor interfaces can be instantiated. This summary outlines the differences.

## Abstract classes

Overall, abstract classes provide a common/default definition of some (not all) methods which can be tailored through subclassing. Abstract classes tend to be applied (implemented) by other classes all of which are closely related re. methods or fields involved. Some of the key properties:

+ Can contain a mix of method declarations and method implementations
+ Fields can be non-static, non-final, ```static``` or ```final```
+ Concrete methods can be ```public```, ```protected```, package private or ```private```
+ Can implement multiple interfaces but can only extend one class
+ Any subclass must provide the implementation for abstract methods (subclasses are otherwise also ```abstract```)

## Interfaces

Interfaces are more commonly applied when the classes that implement them are unrelated. There are no fields, only* method declarations, all of which are ```public``` and ```abstract``` by default. Such flexibility is a core part of interfaces, they state what should be provided but not how. There are a few Java 8 and 9 changes to note:

+ Java 8 interfaces can include ```default``` and ```static``` method implementations*. The ```default``` keyword defines the implementation of a method that is available to all classes that implement the interface, and does not need to be implemented again. Default methods can be overridden.

```java
public interface InterfaceWithDefaultImpl {

    default int isNullAndBlank(String keyword){
        if (keyword == null && keyword.isBlank()){
            return 1;
        }

        return 0;
    }

    static boolean isBlank(String keyword){
        return (keyword != null && keyword.isBlank());
    }

    void implementMe();
}

// somewhere-else

public class someClass implements InterfaceWithDefaultImpl {

    private String somethingUseful;

    // constructors, getters and setter etc...

    public int callDefault(){
        return isNullAndBlank(this.somethingUseful);
    }

    @Override
    public void implementMe() {
        InterfaceWithDefaults.isBlank("Calling the static");
    }
}
```

+ Java 9 interfaces can contain ```private``` methods and ```private static``` methods, though these can only be used by other methods in the same interface. That is, ```private``` methods of Java 9 interfaces are helper methods.

Typical examples of interfaces are the Collections List interface, implemented by ArrayList and LinkedList. The JDBC API is another example, where JDBC drivers function as the implementation.
