# The Singleton design pattern

The Singleton design pattern provides a way of building one and only one instance of a class in a given application. Applications which operate across multiple threads can lead to undefined problems and so a thread-safe approach is required.

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
