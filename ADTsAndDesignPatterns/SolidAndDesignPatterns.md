---
title: SOLID design principles
nav_order: 1
parent: ADTs and Design Patterns in Java
---

# SOLID design principles

+ Single responsibility: a class or method is responsible for one aspect only. Any changes to external objects may change a class (through composition) which adheres to the single responsibility principle but only one change is possible.
+ Open-closed: Open means that classes are open for inheritance, with overridable methods. Closed means the existing base classes should not be modified. Quite often such classes are composed of abstract methods which cannot be changed in the class but are defined in child classes.
+ The Liskov principle: explains that the behaviour of an object is defined by either its parent class or the parent class above. The Liskov principle is violated when a child class modifies the behaviour or contract of the base class it overrides.
+ Interfaces: never force the user to implement methods which it never needs. Interfaces should be divided into smaller, more cohesive interfaces, overall segregating the unrelated methods.
+ Dependency Inversion: methods should not have to create objects, instead, new objects should be created externally and passed to them. The responsibility of injecting dependencies (that is, data required for functionality) is inverted, and given to other objects and methods.

```java
  // instead of 
  method(){
    ... 
    Object object = new Object();
    ...
  } 
  
  // use 
  method(Object object){
    ...
  }
```
