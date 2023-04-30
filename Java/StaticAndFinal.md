---
title: Java static and final
nav_order: 3
parent: Intermediate Java
---

# The static keyword

Given the following definition for a class:

```java
public class StaticClass {

    // numOfInstances is associated with StaticClass and shared with all 
    // instances of StaticClass
    private static int numOfInstances = 0;

    public StaticTest() {
        numOfInstances++;
    }

    public static int getNumInstances() {
        return numInstances;
    }
}
```

Instantiating a StaticClass will increment numOfInstances (there is only one copy of numOfInstances in memory). The value can be retrieved with a getter from _any_ instance of StaticClass in the usual way.

If the getter is preceded with a static keyword, then one can retrieve the current value through a class reference, ```StaticClass.getNumOfInstances()```. The calling class must also be static.

All static methods can be called directly with the class reference without instantiating the class. Indeed, when a Java program is loaded, there must be at least one static method of the form ```main(String[] args)``` from which to call from since classes are not always instantiated on loading. The class where main() resides can have any name though by convention and for convenience, the class is normally labelled Main. There can be multiple launch classes with main() in a given project.

Note that methods can only be called if their class (object) already exists in memory. Static methods and variables are already in memory but other non-static methods and variables are not. Consequently, static methods (alive) cannot reference non-static variables or call non-static methods. Non-static elements are brought into memory by instantiating the class in which they are defined, or, by declaring them as static.

```java
public static int someInt = 32;
public int someOtherInt = 32;

public static void main(String[] args) {

    // this works
    printOutStatic(6);
    printOutStatic(someInt);

    // this would not compile
    printOut(6);
    printOutStatic(someOtherInt);

}

public static void printOutStatic(int number) {
    System.out.println(number);
}

public void printOut(int number) {
    System.out.println(number);
}
```

Note that a static method can reference non-static methods and fields in a different class because it will automatically build an instance of the other class. Static methods cannot reference non-static methods and properties in its own class. This approach has been followed and perhaps assumed with all Java development: a non-static constructor of a different class can be called from a static method, such as main().

Static initialisation blocks initialise static data (and call static methods) once the class is loaded, not when classes are instantiated, and are demonstrated [here](CollectionsFramework.md). Multiple static blocks can reside in a given class and all are executed before any constructor. Static blocks do not initialise non-static properties, that is the purpose of the constructor.

# The final keyword

To tie a immutable (and perhaps unique) properties to an object, declare the property as ```final```. This ensures that the value of the property, which can be assigned the same value as a static variable, does not change once the object has been built.

```java
public class SomeClass {

  private static int classCounter = 0;
  public final int instanceNumber;

  public SomeClass() {
      classCounter++;
      instanceNumber = classCounter;
  }

  public int getInstanceNumber() {
      return instanceNumber;
  }
}
```

In the above case, different instances of SomeClass will return different instanceNumber's.

Fields or properties labelled as ```static final``` are effectively constants for the given class and can be accessed by static methods as constants. Furthermore, they are not stored repeatedly across all instances.

Marking classes as ```final``` prevents subclasses from being implemented. Marking methods as 'final' prevents them from being overridden.
