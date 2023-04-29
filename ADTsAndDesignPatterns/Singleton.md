# The Singleton design pattern

The Singleton design pattern provides a way of building one and only one instance of a class in a given application. Applications which operate across multiple threads can lead to undefined problems and so a thread-safe approach is required.

There are two types of singleton initialisation:

- _Eager_ singleton, an object which is built as soon as the class is loaded (shown next; generally the simplest approach)
- _Lazy_ singleton, an object which is built on a needs basis

```java
public class SomeClass {

    // "volatile" ensures that threads which attempt to access 
    // INSTANCE do so through the main() stack only, thereby 
    // getting the most up-to-date object (Java VM 1.5+ only)
    private static volatile SomeClass instance = null;

    private SomeClass() {
        //empty constructor
    }

    /**
     * Grant access to SomeClass methods through the getter
     * (static is optional)
     */
    public static SomeClass getInstance() {
        if (instance == null){
          instance = new SomeClass();
        }
        return instance;
    }

    // other methods
  }
```

The class of a singleton pattern typically uses a non-global constructor and does not permit inheritance. The singleton object can be accessed by a public method (i.e. getInstance()) which returns the object. The getInstance() method need not be static but should always be parameterless. Since the getInstance() method is public, it means that the singleton is globally accessible.

This pattern, to some, is considered an ‘anti-pattern’. Singletons are global objects and if they represent mutable entities or can change readily then this becomes more difficult to manage when classes which depend on the singleton need a specifically configured singleton. Having global variables (not global constants) is generally bad practice since it may lead to unexpected/undefined results or behaviour.

A good example of a singleton in the standard library is the ```Runtime``` class (in java.lang).

Singleton instances are difficult to mock and unit test. The objects, like all static objects, are unique to a class loader, though they can be constructed from different classes on the same JVM. Hence, some argue that singletons are not unique.
