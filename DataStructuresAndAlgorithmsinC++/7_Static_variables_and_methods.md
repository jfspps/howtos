---
title: Static variables and methods
nav_order: 7
parent: ADTs and Algorithms in C++
---

# Static variables and methods

Static variables are stored in the code section of memory. They are initialised once and once only. All subsequent initialisation which can be found in recursive calls, are ignored. The static variable retains its value since the first initialisation or last expression.

```cpp
int fun(int n)
{
 static int x = 0;
 if (n > 0)
 {
  x++;
  return fun(n - 1) + x;
 }
}
```

Here, `fun()` changes x and does not re-assign it to zero. Removing the `static` keyword then leads the compiler to reset x to zero.

Global variables, declared outside of functions behave in the same way as static variables.

## Static class members

Static data members of a class are defined once only and then applied to _all_ instances of the class. First add the `static` keyword in the as a public member in the class definition and then initialise the value outside the class:

```cpp
class Shape
{
    public:
      static int numberOfInstances;

      Shape(){
          // this does nothing since numberOfInstances will remain whatever 
          // it was set to outside this class
          numberOfInstances++;
          std::cout << "Number of instances: " << numberOfInstances;
      }
}

// note do not use the static keyword here
int Shape::numberOfInstances = 0;

int main(){
    Shape box;
    Shape triangle;

    // ...note that numberOfInstances will always be set to 0

    return 0;
}
```

Static members (methods and data members) essentially work as they do in Java. An instance of the class (with static members) is already made available at run-time and so it is possible to run static methods without instantiating the class.
Furthermore, it is possible to access static data members without instantiating the class. Note however that all other non-static members cannot be accessed and in such cases, an instance of the class would be needed.

To call a static method or access the static member, use:

```cpp
ClassName::staticFunction();

int temp =  ClassName::staticIntMember;
```

Of course, static methods can be called in reference to a specific instance:

```cpp
objectName::staticFunction();
```
