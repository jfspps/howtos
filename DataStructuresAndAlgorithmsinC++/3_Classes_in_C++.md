---
title: Classes in C++
nav_order: 3
parent: ADTs and Algorithms in C++
---

# Classes in C++

Structures do not feature concepts such as:

+ Encapsulation: combination (packaging) of members (fields) with methods that operate on members
+ Inheritance: how one class forms the basis of another, by inheriting the base classes members and methods
+ Polymorphism: how an object can exhibit different properties through the different method definitions (e.g. Java's `toString()`)

Classes address these limitations and extend the basic idea of C structures.

C++ and Java overlap a fair bit. Private and public instance variables and methods are bunched together in C++.

```cpp
class Rectangle{
  private:
   int length;
   int breadth;

  public:
   Rectangle(int l, int b){
    length = l;
    breadth = b;
   }

   // default constructor (without arguments)
   Rectangle()
   {
     // no-args constructor need not be empty, for example, the following is valid
     std::cout << "Default constructor called" << std::endl;
   };

   //other public methods, including setters and getters for private member access

   // destructors are needed in C++ if objects reside in the heap (not required for the stack)
   ~Rectangle();
 };
```

Note that if the `private` and `public` access modifiers are omitted from the class definition, then the class members will be assumed `private`.
This has consequences for this class and all classes derived from it (see Inheritance).

Note that garbage collection of the stack is automated in C++. The compiler will build a default destructor and call it when the object
goes out of scope.

To avoid memory leaks pertaining to the heap, one must define and then call a destructor. The destructor will release resources initialised by
the constructor, such as releasing pointers through the `delete` keyword. More to follow below.

## Instantiation, members and constructors

Syntactically similar to Java, _data members_ (or just _members_) are accessed with the direct member selection operator (.). They constitute the
variables and methods, which can be private or public. Only the class' methods and friend functions (see later) can access private members.

Like Java, _constructors_ provide a more concise way of initialising members in addition to granting access to private members.
The syntax for constructor calls in C++ is more concise than it is in Java (recall that the `new` keyword initialises pointers to
data on the heap).

```cpp
Rectangle aRectangle;

// initialise public members directly (assumes length and lengthTwo are public) 
aRectangle.length = 10;
aRectangle.lengthTwo = 2;
aRectangle.CalculateArea();

// instantiate via the constructor (members are private or public)
Rectangle anotherRectangle(10,2);
```

Constructors are not strictly required and the compiler will provide a default no-args constructor if none is provided.
Note that by adding a constructor with or without arguments indicates to the compiler that it will __not__ provide a default no-args
constructor. This means that if a no-args constructor is needed (when at least one constructor is already defined), then one must be declared in the class.

Default constructors can initialise defaults for members and are used when building arrays of objects, for example. The method call to such a method is the same as the no-args constructor. As a result,
the compiler will not know which to call, the constructor with no-args or that with defaults. In this case, one could
replace the no-args constructor with the defaults constructor:

```cpp
   // default constructor (no arguments but with defaults)
   Rectangle(int length = 1, int lengthTwo = 1){
     std::cout << "Default constructor with defaults called" 
        << std::endl;
   };
```

Finally, one can use __initialisation lists__ in a defaults constructor to initialise members with identifiers that differ from member identifiers:

```cpp
   // default constructor (no arguments but with defaults set by 
   // initialisation lists)
   Rectangle(int l1 = 1, int l2 = 1):length(l1), lengthTwo(l2)
   {
     std::cout << "Default constructor with defaults called via an initialisation list" 
        << std::endl;
   };
```

Initialisation lists are needed in some cases when initialising members of certain data types.

## Scope resolution and inline methods

Methods (class functions) can be:

+ declared in the class as a prototype and defined outside the class
+ defined in the class (resulting in an __inline__ method)

Methods declared in a class __and__ defined _outside_ the class body are qualified through scope resolution using `::`.
In Java, the resolution operator `::` is used to call (reference) methods on an object which is not an instance of the class.

```cpp
class Rectangle
{
  //class instance variables and other methods
}

Rectangle::Rectangle(int a, int b){
  length = a;
  breadth = b;
}

// emphasises that area() is a member function of the class Rectangle
int Rectangle::area(){
  // some code for area()
}

Rectangle::~Rectangle(){};
```

The method `Init()` in C++ is equivalent to the `static{}` block in Java, allowing one to hide initialisation details from
an external class or external method.

Methods defined within the class are treated as inline methods. Such methods instruct the compiler to literally replace all
method call literals (outside the class body) with the body of the inline method.

```cpp
// mimic a Java getter
class DoStuff{
  private:
    char value;

  public:
    // implicitly inline
    char getValue()
    {
      return value;
    }
};

// somewhere in main()
DoStuff anObject;
anObject.value = 'f';
anObject.getValue();
```

The call to getValue() is replaced with the body of getValue(), along with appropriate adjustments so that the function does
not need to be called.

This replacement occurs whenever getValue() is called. This has the advantage of reducing the the overhead of calling a function
but only works for very simple definitions because the
compiler can make the replacement. For more complicated methods (e.g. recursive methods) which are unlikely to be mapped by the
compiler, it is best define such methods outside the class and apply scope resolution.

It is also possible to treat class methods (defined in a class) as inline methods by preceding the function header with the
keyword __inline__:

```cpp
// note that all members are public
class DoStuff{
  public:
    char value;
    // defined outside the class...
    char getValue(void);
    int getNumber(void);
};

// somewhere outside of main(); treated as inline
inline char DoStuff::getValue(){
  return value;
}

// somewhere outside of main(); not treated as inline
int DoStuff::getNumber(){
  int Result = value;

  // perform more complex stuff...

  return intResult;
}

// somewhere in main() ------------------------------
DoStuff anObject;
anObject.value = 'f';
anObject.getValue();
anObject.getNumber;
```

### Friend functions

Friend functions are functions which are not part of a class (that is, they are neither private nor public members) that are granted access to a class' private members.
Friend functions defined within a class are by default, inline. Friend function prototypes inside a class would need to be defined outside the class and would not be
treated as inline methods unless they are preceded with the _inline_ keyword.

```cpp
// mimic a Java getter
class DoStuff{
  private:
    char value;

  public:
    // implicitly inline
    char getValue()
    {
      return value;
    }
  
  // check the indentation, this friend function is not a member;
  // for clarity, this prototype are placed outside of both 
  // private and public lists
  friend int RepeatCharacter(DoStuff object);
};

// compiler assumes this is not an inline method
int DoStuff::RepeatCharacter(DoStuff object)
{
  // CharToInt is hypothetical here but is sent the value to a private member
  return CharToIntobject(value);
}
```

Placing the method definition outside the class generally makes it clearer to see that the method exists (instead of hiding it in the class).

## The this pointer

Methods can be defined to operate on the instance directly without passing it as a parameter. To achieve this, one uses the `this` pointer
in the method definition. Since `this` is a pointer, then one can access its members with the indirect member operator (->) instead of using (*this).

```cpp
class DoStuff{
  public:
    int value;

    // implicitly inline
    int incrementValue()
    {
      return ++this->value;
    }

    int compareTo(DoStuff object){
      // this is a pointer but object is not
      return this->value >= object.value;
    }
};

// somewhere in main()
DoStuff example;
example.value = 8;
example.incrementValue();

// example.value is now 9
```

Indeed, all member functions come with `this` and is provided by the compiler. The above definition is not the only way to implement `compareTo()` but is arguably the simplest.

### Constant class instances

Objects or instances of a class can be treated as constants provided that the `this` pointer provided in all member functions that use `this` (note that not all member functions need to use `this` so to them this passage does not apply) are also marked constant. To make the `this` pointer
of a member function constant requires making the method constant! So overall, a constant object is assumed as long as the relevant member functions are also constant.

Since member functions can be (a) declared as prototypes in the class and defined outside the class or (b) defined in the class, wherever the method is declared or defined, it must apply the `const` keyword. The following
demonstrates both cases:

```cpp
class DemoClass 
{
  private:
    double someDouble;

  public:
    DemoClass(double sD = 1.1);

    // uses the this pointer
    double getDouble() const;

    // uses the this pointer
    double doubleDouble() const
    {
      return 2*(this->someDouble);
    }
}

double DemoClass::getDouble() const
{
  return this->someDouble();
}

DemoClass::DemoClass(double sD): someDouble(sD)
{
  std::cout << "DemoClass initialised" << std::endl;
}

int main(){
  DemoClass demo;

  double demoDouble = demo.getDouble();
}
```

## Pointers and references to objects

Passing by address is particularly useful with member access since some classes can get quite large.

```cpp
SomeClass example;

SomeClass* objectPtr = 0;
objectPtr = &example;

// dereference the object first before accessing the data member...
std::cout << objectPtr->someField << std::endl;
```

References can be assigned to objects using:

```cpp
SomeClass example;

SomeClass& objectRef = example;

// no need to dereference the object first; accessing the data member directly...
std::cout << objectRef.someField << std::endl;
```

## The copy constructor

Copy constructors build objects by initialising data members from an existing object, hence a copy. Passing an object (to be copied) by value would result in an endless loop.
A copy constructor would need to build a copy of the object to pass as an argument and so the copy constructor would need a copy constructor in order to proceed.

Copy constructors therefore must use a pass-by-reference argument of the object that it is copying. The reference to an existing object does not require a copy constructor call.

Generally, one passes a `const` reference to the object to ensure that the copy constructor cannot change the reference to the object (to be copied). Other new objects may also
want to apply the data members.

```cpp
// copy constructor prototype
SomeClass(const SomeClass& copyFromThis);

// the definition provided outside SomeClass
SomeClass::SomeClass(const SomeClass& initObj){
  // initialise the members of the newly created object 
  // according to those provided by initObj
}
```

## Destructors

Objects of a class are freed by the compiler by the use of a default destructor. If the object is referenced via a pointer then the object resides in the heap. The
`delete` keyword is used to release data from the heap referenced by a pointer and, as explained below, also invokes the destructor should it be applied to an object.

Note, however, that the `delete` keyword does not remove the pointer variable from memory. This is handled once the function goes out of scope.

```cpp
class SomeClass
{
  // destructor prototype (nothing more than a reference to the default destructor)
  ~SomeClass();
}
```

Note the distinction: the compiler will release the object from the heap but any resources local to the object would
still be 'dangling' in the heap if they too are not released.

```cpp
class SomeClass
{
  private:
    char* ptrMessage;

  public:

  SomeClass()
  {
    // constructor allocates some of the heap to a string via the pointer;
    // one should free ptrMessage when the instance of SomeClass is freed
    ptrMessage = "SomeClass instance local resource";
  };

  ~SomeClass();
}

// outside of main()
SomeClass::~SomeClass()
{
  // when SomeClass is released, make sure all other resources are also freed
  // i.e. the array of char pointed to by ptrMessage
  delete[] ptrMessage;
}
```

The `delete` keyword removes the data from the heap that a pointer points to. If the pointer is pointing to a (class) object then
`delete` also calls the defined destructor.

```cpp
{  
  // instantiate the class in the stack
  SomeClass example;

  // instantiate the class in the heap and save the pointer in the stack
  SomeClass* anotherExample = new SomeClass;
}

// by now, "example" is released but "anotherExample" is not
```

The `delete` keyword invokes the class' destructor:

```cpp
{  
  // instantiate the class in the stack
  SomeClass example;

  // instantiate the class in the heap and save the pointer in the stack
  SomeClass* anotherExample = new SomeClass;

  // effectively calls the destructor of SomeClass
  delete anotherExample;
}

// by now, "example" and "anotherExample" are released
```

## Copy constructors revisted

Now that the idea of local resource management for an object is explained in the above section regarding destructors,
what are the implications with regard to copy constructors?

When a copy constructor is invoked, it also sets a reference (pointer) to all members (local resources) of the object it
copies.

```cpp
class SomeClass
{
  private:
    char* ptrMessage;

  public:

  SomeClass()
  {
    ptrMessage = "SomeClass instance local resource";
  };

  SomeClass(const SomeClass& copyFromThis);

  ~SomeClass();
}

// outside of main()
SomeClass::~SomeClass()
{
  delete[] ptrMessage;
}

void main()
{
  SomeClass class1;

  // instantiate classCopy with the references to class1's member values; this invokes the copy constructor
  SomeClass classCopy(class1);

  // classCopy has the reference to the same string defined in ptrMessage
  // i.e. both classCopy and class1 have their own pointer that references the
  // same string in the heap, first initialised by class1
}
```

The problem that the destructor is defined to free the member ptrMessage whenever an instance SomeClass is deleted. Hence, when the object copy `classCopy`
is freed from the stack (e.g. the copy goes out of scope), then the member `ptrMessage` is also freed.
This leaves the original `class1` object with a pointer that references an area on the heap that is now void of the string it previously had.

The general solution to this is to:

+ define the destructor to free members on the heap (as is already outlined above)
+ define a copy constructor which builds its own copy of all members (of the object copy) so that when the copy is freed, the original object still has valid
members

```cpp
// define the copy constructor outside of the class and copy members when building a copy of the object
SomeClass(const SomeClass& copyOf)
{
  // set the pointer to the member at an independent location of the heap;
  // this not only has a different string literal but is also linked to the copy and not the original, copyOf
  ptrMessage = "Copy of SomeClass";
}
```

Note that the copy constructor is not the same as the assignment operator. The assignment operator works on objects that have already be instantiated
and only performs a direct mapping of the member values from one instance to the other. Note that the assignment operator is fine for situations where
the members are saved to the stack. If, however, members are dynamically assigned on the heap then it is advisable to overload the assignment operator.

## Operator overloading

Operator overloading allows one to re-define many (not all) C++ operators so that they perform tasks tailored for a specific class.

```cpp
SomeClass anObject;

// left-hand operand
if (anObject == 4.4){
  // do stuff
}

// right-hand operand; how is this conditional evaluated?
return anObject > 3;
```

Operator overloading can be an involving prospect. Some operands appear on the left, others on the right. There are also other types and classes to consider.

The following operators cannot be overloaded:

+ scope-resolution operator `::`
+ (ternary) conditional-operator `?:`
+ direct member selection operator `.`
+ size-of operator `sizeof`
+ deference pointer to a class member operator `.*`

Operators appear by symbol (above) but also by name e.g. `new` and `delete`.

To overload an operator, first give the prototype in the class it applies to.

```cpp
class SomeClass
{
  private:
    int someInt;

  public:
    // this could be written as operator> or operator > (with a space)
    bool operator> (SomeClass &anObject) const;

    SomeClass(int input = 2);

    ~SomeClass();
}

SomeClass::SomeClass(int input = 2): someInt(input)
{
  // set up as needed
}

bool SomeClass::operator> (const SomeClass &anObject)
{
  // this assumes that the left-hand operand is referenced by this and 
  // the right-hand operand is "anObject", the parameter
  return this->someInt > anObject->someInt;
}

void main()
{
  // initialiase stuff...
  SomeClass tryMe;
  SomeClass thisThis;

  // this is equivalent to "if (tryMe->someInt > tryThis->someInt)"
  if (tryMe > tryThis)
  {
    // this will never pass, anyway....
  }
}
```

As shown, the `this` pointer assumes the role of the left-hand operand.

To compare with primitive data types, use a reference to the primitive data type:

```cpp
// use a space this time...
bool SomeClass::operator > (const double &aDouble)
{
  // this assumes that the left-hand operand is referenced by this and 
  // the right-hand operand is "aDouble", the parameter
  return this->someInt > aDouble;
}
```

One can also apply (declare) more explicit operand use without the `this` pointer and supply both operands
in the method definition.

```cpp
// use a space this time...
bool SomeClass::operator > (const SomeClass &anObject, const double &aDouble)
{
  // no this pointer, this is more explicit
  return anObject->someInt > aDouble;
}
```

To overload the `new` operator, for example, then a space is needed after the `operator` keyword.

```cpp
// use a space this time...
bool SomeClass::operator new (const SomeClass &anObject, const double &aDouble)
{
  // no this pointer, this is more explicit
  return anObject->someInt > aDouble;
}
```

As alluded to in the previous section on assignment operators vs. copy constructors, whenever a class uses dynamically allocated members it
is quite possible that the assignment operator will grant the recipient object the same reference (pointer) as the source object. Subsequently,
when the recipient object goes out of scope, it invokes the destructor and releases the dynamically allocated members. Consequently, the source
object will have members that are pointing to memory used by something else.

```cpp
class SomeClass
{
  private:
    char* ptrMessage;

  public:

  // constructor
  SomeClass()
  {
    ptrMessage = "SomeClass instance local resource";
  };

  // copy constructor
  SomeClass(const SomeClass& copyFromThis);

  // a reference is returned to accommodate the different uses under which the assignment operator applies
  // e.g. object1 = object2, or object1 = object2 = object3;
  // note that the return value is an lvalue not an rvalue, so the parameter refers to the rvalue, the source object
  SomeClass& operator = (const SomeClass &rhsOperand)
  {
    // if the assignment operator is used to compare to itself, then return the reference to itself
    // (otherwise this overloaded operator would end up deleting its own dynamically allocated members!)
    if (this == &rhsOperand)
    {
      std::cout << "Trying to copy to itself..." << std::endl;
      return *this;
    }

    // for the left hand operand (implied through "this" pointer though not needed here), free ptrMessage
    delete ptrMessage;
    
    ptrMessage = new char[strlen(rhsOperand.ptrMessage) + 1];

    strcpy(this->ptrMessage, rhsOperand.ptrMessage);

    // note that "this" is a pointer variable, so dereference it to get the address reference
    return *this;
  }

  ~SomeClass();
}

// outside of main()
SomeClass::~SomeClass()
{
  delete[] ptrMessage;
}

void main()
{
  SomeClass class1;
  SomeClass class2;

  // some rather (admittedly pointless) assignement
  class2 = class1;
}
```

### Overloading prefix and postfix operators

Unary operators such as the prefix operator and postfix operators need some thought here when overloading them.

For the prefix operators (e.g. --object), there are no parameters in the prototype or definition. For postfix operators (e.g. object++), there is one parameter. However,
the parameter is merely a differentiator for the compiler. There is no need to provide the name, only the data type, in the list. The function definition would not use the parameter -
no need since the operation is unary not binary.

```cpp
// assume Length is a class with a private member of type int

// postfix - need to "pass by value", make a copy, increment and finally return the resultant Length object 
const Length operator ++ (int);

// prefix - need to work on the current (with "this") and return a reference to the new value
Length& operator ++();
```

## Templates in C++

### Function templates

Function templates are particularly useful when function overloading becomes excessive, i.e. a function prototype is declared
one too many times.

There are two keywords one can use to define a function template: `class` and `typename`. The latter is considered more generic
while the former is used specifically for class templates (see next section). These keywords are interchangeable in this section.

```cpp
// assume here that an array of int's, double's or long's is involved...
template<typename T> 
T somePopularFunction(T generalArray[], int index, T generalQuantity)
{
  T localVar = generalArray[index];

  if (localVar > generalQuantity){

    // great, do other stuff...
    return localVar;

  } else {

    // not good, try something else...
    return generalQuantity;

  }
}

int main(){

  long valueLong = 12;
  long arrayLong[] = { 2,4,5 };

  double valueDouble = 4.5;
  double arrayDouble[] = { 3.3,4.4,5.5 };

  // the compiler will use the prototypes to decide function to call;
  // both long and double forms are instantiated at run-time, 
  // regardless if they are used or not
  long resultLong = somePopularFunction(arrayLong, 1, valueLong);

  double resultDouble = somePopularFunction(arrayDouble, 0, valueDouble);

  return 0;
}
```

### Class templates

Templates in C++ are equivalent to generic classes in Java. The instantiation of a template with chosen types through the
constructor causes other methods to follow the same type used.

```cpp
template<class T>   // this token is similar in function to @someProperty annotation in Java
 class Arithmetic
 {
  private:
   T a;
   T b;
  
  public:
   Arithmetic(T a, T b);
   T add();
 }

 template<class T>   // needed again since } closed previous class block
 Arithmetic::Arithmetic(T a, T b)
 {
  this.a = a;        // right-hand a is parameter value passed
  this->b = b;       // alternative notation
 }

 // define a function template
 template<class T>
 T Arithmetic<T>::add()
 {
  T c;
  c = a + b;
  return c;
 }
```

To build an instance of the class template and call functions, simply substitute the generic T to the type required.

```cpp
Arithmetic<int> integerObject(2, 3);

Arithmetic<double> doubleObject(0.9, 1.1);

// note here that the template function add() is only created if it is called (this applies to all methods and objects)
int sum = integerObject.add();
```

As with all parameters, one can also pass expressions which evaluate to the data types that the method is expecting.

## Inheritance

As with Java, C++ base classes can be extended. A derived class does not inherit the base classes:

+ constructor
+ destructor
+ overloaded assignment operator

Objects of derived classes are instantiated first from the base class constructor and then all other constructors of successive
derived classes before the constructor of the last, defining class is called.

Classes are normally organised in their own header or source files, just as Java classes are defined in their own .java files.

```cpp
// inside BaseClass.h

// forces the definition of BaseClass to appear only once in the build
#pragma once

class BassClass 
{
  private:
    double someDouble;
    int someInt;

  public:
    BaseClass (double defDob = 1.1, int defInt = 98): someDouble(defDob), someInt(defInt)
    {}
};

```

Now derive `BaseClass` in another header file. Note the way in which the identifiers and member _access specifiers_ are used:

```cpp
// inside DerivedClass.h

#pragma once

// add BaseClass.h (mandatory here)
#include "BaseClass.h"

// this DerivedClass to BaseClass 'access specifier' is assumed private, equivalent to
// class DerivedClass : private BaseClass
class DerivedClass : BaseClass
{
  public:
    char* someString;

    DerivedClass(char* stringArg = "Derived from BaseClass")
    {
      someString = new char[strlen(stringArg) + 1];

      // since stringArg resides on the heap, its source reference (its pointer) is needed
      strcpy_s(someString, strlen(stringArg) + 1, stringArg);
    }

    ~DerivedClass()
    {
      delete[] someString;
    };
};
```

Note that according to the `DerivedClass` and `BaseClass` _access specifier_, the public (__not__ private) members of the base class
are inherited by the derived class as `private` members. Changing the access specification to `public` means that all `public`
members are inherited as `public` members in the derived class and are accessible to `main()`.

```cpp
// inside DerivedClass.h

#pragma once

// add BaseClass.h (mandatory here)
#include "BaseClass.h"

// all public members in BaseClass are now public in DerivedClass
class DerivedClass : public BaseClass
{
  public:
    // ...public members, constructors and destructors...
};
```

One should emphasise here that base class `private` members are __never__ accessible to any derived class methods, under any circumstances.
They can only be accessed through public base class methods.

### Derived class objects

One can then instantiate from either class as required.

```cpp
// in program.cpp
#include <iostream>
#include <cstring>

// this caters for the given class and all its base class(es)
#include "DerivedClass.h"

using std::cout;
using std::endl;

int main()
{
  BaseClass baseObj(13.3, 500);
  DerivedClass derObj;
  DerivedClass derObj2("This is the second time");

  cout  << "BaseClass is smaller: " << sizeof baseObj
        << " bytes" << endl;

  cout  << "derObj and derObj2 are of equal size (respectively): " << sizeof derObj
        << " bytes compared to " << sizeof derObj2 << " bytes" << endl;

  // one cannot change private members of BaseClass through DerivedClass
  // derObj.someInt = 200;

  return 0;
}
```

Methods defined in a base class (or the intermediate base classes) have normal access to their respective
members (private and public) but methods of a derived class cannot access `private` members of any of its
base classes. Private methods of a base class are only accessible to derived classes through `public` base class methods
that make use of `private` base class members.

The base class constructor takes care of the base part of the derived object. The base class
constructors are methods that have access to the base class private members.

If a base class constructor is not already defined then the compiler calls the default constructor to manage
the base class part of the object. To call a specific constructor (instead of the default constructor) one
must pass parameters needed for the specific constructor (which must already be defined)
as part of the initialisation list, along with the parameters (if needed) for the derived constructor.

```cpp
// modify the DerivedClass

// this makes all public base class members become public in the derived class (see notes above)
class DerivedClass : public BaseClass
{
  public:
    char* someString;

    // assumes that BaseClass constructor with matching signature is established 
    DerivedClass(double defDob, int defInt, char* stringArg = "Derived from BaseClass"): BaseClass(defDob, defInt)
    {
      someString = new char[strlen(stringArg) + 1];

      // since stringArg resides on the heap, its source reference (its pointer) is needed
      strcpy_s(someString, strlen(stringArg) + 1, stringArg);
    }

    ~DerivedClass()
    {
      delete[] someString;
    };
};
```

Destructors, on the other hand, are called in the reverse order to constructors. When a derived class destructor is called, the
compiler calls the derived class destructor first before the base class(es) destructor(s).

## Protected members

Base class members marked `protected` are treated like `private` base class members. Such members are visible to the base class methods and friend functions of the class.
More distinctly, they are accessible to derived class member functions, just as `public` member are. However, `protected` members are not accessible to classes which do not
derive from the base class.

Overall, `protected` members straddle the boundary that is `private` and `public`. They are accessible to derived classes but not accessible to other non-derived classes.

As mentioned above, the default access specifier is `private` so with the new `protected` member access specifier, one can now say
that by default all derived `public` and `protected` base class members will be treated as `private` members in the derived class.

To make base class `protected` members remain protected in the derived class, use the `protected` access specifier in the derived class
definition:

```cpp
// inside DerivedClass.h

#pragma once

// add BaseClass.h (mandatory here)
#include "BaseClass.h"

// all protected members in BaseClass are now protected in DerivedClass;
// note that base class public member are now protected, not public!
class DerivedClass : protected BaseClass
{
  public:
    // ...public members, constructors and destructors...
};
```

Note that `public` members in the base class are now `protected` in the derived class.

Alternatively, one could make all `protected` and `public` base class members, respectively, `protected` and `public` in the derived
class (i.e. no change to access) by using the `public` access modifier.

```cpp
// inside DerivedClass.h

#pragma once

// add BaseClass.h (mandatory here)
#include "BaseClass.h"

// all protected members in BaseClass are now protected in DerivedClass;
// all public members in BaseClass are now public in DerivedClass
class DerivedClass : public BaseClass
{
  public:
    // ...public members, constructors and destructors...
};
```

### Copy constructors in derived classes

Copy constructors can be called explicitly or invoked as a default base class constructor in the derived class, with the reference to the base class instance as a parameter. In this
snippet, one can also see `protected` members in use.

```cpp
// inside BaseClass.h

// forces the definition of BaseClass to appear only once in the build
#pragma once

class BassClass 
{
  protected:
    double someDouble;
    int someInt;

  public:
    BaseClass (double defDob = 1.1, int defInt = 98): someDouble(defDob), someInt(defInt)
    {}

    BaseClass(const BaseClass& copyObj)
    {
      someDouble = copyObj.someDouble;
      someInt = copyObj.someInt;
    }
};
```

Then the derived class would initialise the base and derived members accordingly. What is different here is that
the base class copy constructor can take a reference to the derived class and only take in the base class member
initialisation values. The base class constructor leaves out the derived class members, as it should.

```cpp
// inside DerivedClass.h

#pragma once

// add BaseClass.h (mandatory here)
#include "BaseClass.h"

// no changes to the BaseClass access specifiers
class DerivedClass : public BaseClass
{
  public:
    char* someString;

    // without the copy construtor: the base constructor is called explicitly
    DerivedClass(double devDouble, int devInt, char* stringArg = "Derived from BaseClass") :
      BaseClass(devDouble, devInt)
    {
      someString = new char[strlen(stringArg) + 1];

      // since stringArg resides on the heap, its source reference (its pointer) is needed
      strcpy_s(someString, strlen(stringArg) + 1, stringArg);
    }

    // with an 'implied' copy constructor, called automatically
    DerivedClass(char* stringArg = "Derived from BaseClass")
    {
      someString = new char[strlen(stringArg) + 1];

      strcpy_s(someString, strlen(stringArg) + 1, stringArg);
    }

    // when copying an object, the BaseClass copy constructor is called
    DerivedClass(const DerivedClass& devCopy): BaseClass(devCopy)
    {
      someString = new char[strlen(stringArg) + 1];

      strcpy_s(someString, strlen(devCopy.someString) + 1, devCopy.someString);
    }

    ~DerivedClass()
    {
      delete[] someString;
    };
};

// somewhere in main()
DerivedClass firstObj(1.1, 9, "TweedleDum");

DerivedClass secondObj(firstObj);
```

The general sequence of constructor calls would be:

1. BaseClass() to build base part of firstObj
2. DerivedClass() to build derived part of firstObj
3. BaseClass copy constructor is called to build a BaseClass object, as a portion from devCopy, of secondObj
4. Derived class copy constructor called to start building the derived calls part of secondObj

In general, one should always be aware of ensuring base class members are initialised in addition to the derived class members, through
careful definition of the constructor.

## Friend classes

A brief note about `friend` classes. As before, `friend` methods have access to all data members of the class they are declared in.

```cpp
class WhatClass
{
  public:
    WhatClass(double alpha, double beta)
    {
      privA = alpha;
      privB = beta;
    }

    private:
      double privA;
      double privB;

    // let a non-derived class access WhatClass' private members e.g. this copy constructor
    friend FriendsClass::FriendsClass(const WhatClass& aWhatClass);
}

class FriendsClass
{
  public:
    FriendsClass(const WhatClass& someClass)
    {
      privAFriend = someClass.privA;
      privBFriend = someClass.privB;
    }
  
  private:
    double privAFriend;
    double privBFriend;
}
```

It is also possible to declare all methods in a given class as `friend` methods to a different class.

```cpp
class WhatClass
{
  public:
    WhatClass(double alpha, double beta)
    {
      privA = alpha;
      privB = beta;
    }

    private:
      double privA;
      double privB;

    // now all methods in FriendsClass have access to privA and privB
    friend FriendsClass;
}
```

Note, however, that WhatClass does not have access to FriendsClass' members. It is not reciprocal.

Furthermore, only FriendsClass has access to WhatClass' members. Derived classes of FriendsClass would not have access
to WhatClass' members. Thus the scope of inheritance of `friend` classes is very limited, compared to traditional derived classes.

## Early and Late Binding

Suppose that a base class and a derived class make a call to member functions of the same signature. The method defined in the derived class
is intended for derived class instances and the method defined in the base class is intended for base class instances.

```cpp
class BaseClass
{
  public:
    void CallCommonMethod() const
    {
      // do stuff then...
      CommonMethod();
    }

    void CommonMethod() 
    {
      // BaseClass' Common method definition...
    }

    // insert constructor and private/protected data members
}

// in another C++ header file
class DerivedClass: public BaseClass
{
  public:
    void CommonMethod() const
    {
      // DerivedClass' Common method definition...
    }

    // insert constructor and private/protected data members
}
```

The situation here is that when an instance of DerivedClass calls `CallCommonMethod()`, by default, the definition of `CommonMethod()` is 
called based on how the program was compiled. If an instance of BaseClass was instantiated first, then the base class' `CommonMethod()` is called.
Similarly, if DerivedClass was first instantiated then the derived class' `CommonMethod()` is called. 

```cpp
// somewhere in main()
BaseClass baseObject();
DerivedClass derivedObject();

derivedObject.CallCommonMethod();   // calls the BaseClass definition of CommonMethod() since baseObject was built first
```

This mechanism is referred to as `early binding`, i.e. first come first served in many ways.
The function call is fixed prior to running, and so is termed `static resolution` (or `static linkage`).

Ideally, the derived class definition of `CommonMethod()` should be applied to objects of the derived class. That is, one requires the compiler
to call the appropriate method based on the object type, through `late binding` (also known as `dynamic linkage`).

## Virtual functions and Polymorphism

This is where __virtual functions__ come in. Virtual functions are functions which, when defined as such, signal to the compiler to that it
should apply dynamic linkage to the method. Strictly speaking, the `virtual` keyword is only required in the base class.

```cpp
class BaseClass
{
  public:
    void CallCommonMethod() const
    {
      // call to CommonMethod() is dynamically linked
      CommonMethod();
    }

    // indicate to the compiler to apply dynamic linkage
    virtual void CommonMethod() 
    {
      // BaseClass' Common method definition...
    }

    // insert constructor and private/protected data members
}

// in another C++ header file
class DerivedClass: public BaseClass
{
  public:
    // indicate to the compiler to apply dynamic linkage (this is optional, and helps
    // make the code clearer)
    virtual void CommonMethod() const
    {
      // DerivedClass' Common method definition...
    }

    // insert constructor and private/protected data members
}
```

Now the true intentions can be realised.

```cpp
// somewhere in main(), when CommonMethod() is declared virtual
BaseClass baseObject();
DerivedClass derivedObject();

derivedObject.CallCommonMethod();   // calls the DerivedClass definition of CommonMethod()
```

If one wanted to force the compiler to call the base class definition of `CommonMethod()` then a full qualification
with the scope resolution operator would be needed.

```cpp
class BaseClass
{
  public:
    void CallCommonMethod() const
    {
      // call to CommonMethod() is dynamically linked (based on the object type)
      CommonMethod();
    }

    // indicate to the compiler to apply dynamic linkage
    virtual void CommonMethod() 
    {
      // BaseClass' Common method definition...
    }

    // insert constructor and private/protected data members
}

// in another C++ header file
class DerivedClass: public BaseClass
{
  public:
    void CommonMethod() const
    {
      // DerivedClass' CommonMethod()
    }

    void BaseCommonCall() const
    {
      // call BaseClass' CommonMethod()
      BaseClass::CommonMethod();
    }

    // insert constructor and private/protected data members
}
```

Virtual functions provide C++ with a way to implement polymorphism.

## Pointers and References of derived class instances

### Pointers to derived class instances and casting

This part of the discussion raises a number of new options for code design, as well as pitfalls to look out for.

A pointer to a base class instance can be reassigned to derived class instances. Furthermore, member functions
using pointers and indirect member selection operator `->` on base class and derived class instances apply
dynamic linkage for virtual functions.

```cpp
// somewhere in main(), when CommonMethod() is declared virtual
BaseClass baseObject();
DerivedClass derivedObject();

BaseClass* pInstance = 0;
pInstance = &baseObject;
pInstance->CallCommonMethod();  // calls the BaseClass definition of CommonMethod()


pInstance = &derivedObject;
pInstance->CallCommonMethod();  // calls the DerivedClass definition of CommonMethod()

delete pInstance;
```

Since the pointer can accept either base class or derived class instances, it is also possible to cast between different pointers. In this case,
the examples draw from `dynamic_cast<destination>(origin)` rather than `static_cast<destination>(origin)`.

```cpp
BaseClass* pBaseObject = new DerivedClass();

// dynamically cast a base class pointer to a derived class pointer
DerivedClass* pDerivedObject = dynamic_cast<DerivedClass*>(pbaseObject);
```

### References to instances as arguments

In relation to calling member functions based on object type, the type identity of the object passed by reference is also
preserved. Pointers can be reassigned to base and derived classes at will, and this behaviour is also applicable to
references. A function that has a reference to the base class will accept base class _and_ derived class instances as parameters.

```cpp
// prototype given outside main()
void PassByRef(const BaseClass& anObject);

main()
{
  // CommonMethod() is declared virtual
  BaseClass baseObject();
  DerivedClass derivedObject();

  PassByRef(baseObject)   // calls the BaseClass definition of CommonMethod()

  PassByRef(derivedObject)   // calls the DerivedClass definition of CommonMethod()
}

void PassByRef(const BaseClass& anObject)
{
  // this calls the corresponding CommonMethod, based on the type of anObject
  anObject.CallCommonMethod();
}
```

## Abstract Classes

Similar to Java, C++ abstract classes provide a common starting point for other derived classes that provide more of the 'missing' implementation
of member functions. Since it is often necessary to redefine derived class member functions via virtual functions, the base class must first set
the tone with regard to virtual functions.

There are cases where the definition of the base class (virtual) function is not known or needed. Instead they are defined in code as `pure virtual functions`
which are essentially method prototypes of virtual functions.

```cpp
class AbstractClass
{
  public:
    virtual int PureVirtualFunction() const = 0;
}
```

Note the assignment of zero above. This indicates to the compiler that the function is a pure virtual function. Any class with pure virtual functions
is subsequently known as an __abstract class__. All other derived classes must either

a.  Redefine the base class virtual function as a pure virtual function (thus the derived class is also an abstract class)
b.  Define the method body of the pure virtual function, preserving the `const` state accordingly

```cpp
class NonAbstractClass: public AbstractClass
{
  public:
    virtual int PureVirtualFunction() const
    {
      // do stuff here
    }
}
```

One can implement a non-`const` member function based on a `const` pure virtual function if required. This does mean, however, that the derived class is
abstract because the developer did not provide implementation for the `const` pure virtual function.

```cpp
class StillAnAbstractClass: public AbstractClass
{
  public:
    virtual int PureVirtualFunction()
    {
      // do stuff here
    }

    // the const version of PureVirtualFunction() applies to this class and is not defined here; hence this class is (still) abstract

    // define other data members (variables and methods)
}
```

As is the case in Java, __C++ abstract classes cannot be instantiated__ and it would not be surprising to know that constructors and destructors are not normally
present in an abstract class. Classes which are not abstract are known as __concrete classes__.

One can use the previously discussed pointer notation to build an instance of a concrete (derived) class in reference to the abstract class.
Perhaps confusingly, the pointers to the derived class look like they reference objects of
an abstract class. The constructor identifier should make it clear, however, that this is not the case.

```cpp
class ConcreteClass: public AbstractClass
{
  public:
    virtual int PureVirtualFunction() const
    {
      // do stuff here
    }

    // define other data members (variables and methods), constructors and destructors
}

// somewhere in main()

AbstractClass* anObject = new ConcreteClass();
anObject->PureVirtualFunction();

delete anObject;
```

Note that the pointer `anObject` can be assigned to any class that is derived from `AbstractClass` and subsequently assume that the compiler will call the corresponding
virtual functions automatically.

Finally, a derived class can be derived further. The base classes above would then represent the __indirect__ base class of the newly derived classes. That is, there would be
at least three levels of classes:

```java
BaseClass <--- DerivedLevelOneClass <--- DerivedLevelTwoClass <--- DerivedLevelThreeClass
```

`BaseClass` is a _direct_ base class to `DerivedLevelOneClass` and an _indirect_ base class to all others. `DerivedLevelOneClass` is a
_direct_ base class to `DerivedLevelTwoClass`, and so on.

### Virtual destructors

As discussed with regard to destructors of derived classes, when order of calling destructors is:

1. Derived class destructor
2. Base class destructor

When calling destructors in an order that the static linkage policy (manipulated on the part of the developer) would work.

It becomes an issue when using pointers to handle base and derived class instances. Pointers can be re-assigned to some other direct or indirect
class and therefore require a different destructor to free up the heap. Without any change the class definitions, the
compiler only really knows about the base class destructor since this is common to the family of classes. That is, calling
`delete` will only invoke the base class destructor. In many cases, this is a problem because it leaves the derived instance
parts dangling in the heap.

Thankfully, the solution is simple: declare destructors as __virtual destructors__:

```cpp
virtual ~BaseClass();
```

As with all virtual functions, it is recommended to also declare derived class destructors as virtual functions even though it is not strictly necessary.

## Nested classes

Similar to Java, C++ also provides __nested classes__, which are represented as Structures and/or classes. These are typically one-off uses within an enclosing class instance, rather than be utilised outside the enclosing class.

Nested classes can be `public` or `private` and all have access to the enclosing class' members. The enclosing class can only access the `public` members of a `private` nested class
(less common approach) and access to all members of a `public` nested class (more common approach).

Nested classes declared `public` are accessible outside the enclosing class but would need to be fully qualified using scope resolution operators.

```cpp
class EnclosingClass
{
  private:
    // declare private members of EnclosingClass here

  public:
  
    class NestedClass
    {
      private:
        // declare private members of NestedClass here
      public:
        // declare public members of NestedClass here
    };

    // add other public members of EnclosingClass here
}
```
