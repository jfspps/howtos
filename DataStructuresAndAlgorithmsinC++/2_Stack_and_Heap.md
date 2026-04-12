---
title: Data structures in memory
nav_order: 2
parent: ADTs and Algorithms in C++
---

# Data structures in memory

## Storage classes: storage duration and scope

All variables are characterised by _storage classes_, which describes a variables lifetime (through
storage duration, below), linkage (visibility in or out of the file) and memory location (CPU register, or memory stack or heap).

All variables have a _storage duration_:

+ Automatic storage duration
+ Static storage duration
+ Dynamic storage duration

Which part of the application over which a variable name is valid is known as _scope_. Any reference
to the variable that is legal is phrased as __in scope__, at which point the variable can be used in an expression.

Memory addresses are zero-based. Memory is partitioned into code, __stack__ (stack frame or activation record)
and __heap__ (free store) sections.

Variables declared in a block (of curly braces) are __automatic variables__ (have automatic storage duration)
and are in scope when they are declared up to the end of the closing brace. Such variables are stored on the
stack. Systems are given a default stack size, typically of the order of megabytes. Variables out of scope are
automatically removed from the stack, so any reference to them will cause a runtime error.
An automatic variable can be declared with the keyword _auto_ but this is not necessary as it is implied.

Other function calls that declare variables are allocated a portion of the stack on a LIFO basis.
The term stack relates to how functions stack on top of each other as they are called. When a function returns,
its stack frame is cleared automatically.

Variables declared in ```main()``` have global scope (or file scope) and are classed
as __static variables__ (have static storage duration). Such variables are also placed on the stack.
It is also possible to declare __any__ variable as static with the keyword _static_, which means
the variable will be in scope for the entire duration of the application. Static variables will
always be initialised a value (the type's equivalent of ```0```) if none are provided.

Variables that may or may not have definite size (e.g. arrays) are handled as __dynamic variables__ and
are handled with dynamic storage duration. For many applications, having control over memory usage is preferred.
Dynamic variables are located on the heap and referred to by pointers, which themselves reside on the stack.
The heap is a randomly arranged portion of memory where data resides in randomly allocated heaps.
Data which utilises the heap must be allocated and de-allocated (to prevent memory leaks).

## Pointers, Arrays and Pointer Arithmetic

Pointers assigned to a variable (as such) can be used to update
the variable. Some conventions prefix a pointer name with `p`.

```cpp
long someLong = 20L;
// general form of declaring pointers is: type *identifier
long *pSomeLong = &someLong;

// assign a value by dereferencing
long anotherLong = *pSomeLong;

// update the assigned value, to 30 then 31
*pSomeLong = 30L;
*pSomeLong++;
```

Assuming the above are not declared in the main block (have automatic storage duration), then both the variable and pointer
would reside on the stack.

A pointer to an array can be expressed in the form:

```cpp
 // array of pointers to integers (read the expression from right to left)
 int *ptr[arraySize];

 // for comparison, an array of integers
 int someArray[arraySize];
```

The array name or literal is essentially a pointer to the first element. When written to
the right of an assignment operator, the expression `*ptr` dereferences
the pointer `ptr` i.e. refers to the _value_ of the _first_ element of the array and so
is equivalent to `ptr[0]`. Under the same circumstances,
the expression `*(ptr + 1)` refers the value of the _second_ element, and is equivalent
to `ptr[1]` (the __indirection operator__ `*` takes precedence over `+`, so parentheses
are used to override this precedence).

If `ptr[1]` is written to the left of an assignment operator, then the element is assigned
the value, whereas if `ptr[1]` is written to the right, then its value is returned.
The same can be said for pointer notation:

```cpp
int *ptr[6];

// array names can be used as pointers, so these are equivalent
ptr[0] = 8;
*ptr = 8;

// this would be invalid
ptr = 8;

// note both of the following, without the indirection operator, will nullify the pointer
// (all variables have non-zero addresses, so zero is undefined i.e. null)
ptr = 0;
ptr = NULL;

// assign the second element a value 5
ptr[1] = 5;
*(ptr + 1) = 5;

// assign the value of the third element to the second element
ptr[1] = ptr[2];
*(ptr + 1) = *(ptr + 2)

// this assign the address of the third element of ptr to a 
// new pointer, otherPtr
int *otherPtr;
otherPtr = &ptr[2];

// post-increment operator increments the address of otherPtr by 4 bytes (int)
// i.e. the next int element
otherPtr++;
int fourthElement = *otherPtr;
```

In general, `*(ptr + n)` is equivalent to `ptr[n]` and are examples of 'pointer arithmetic'. This is revisited later re. pointers to strings.

In the context of ```main()```:

```cpp
int main(){
  int a = 10;
  int *p; // NULL pointer, assign ASAP
  p = &a; // pointer p references int a (both in the stack)
  
  // dereferences p then assigns the value (not the address)
  int t = *p; 

  // since pointer p now stores the address to a, any
  // operation on pointer p also changes the value of a;
  // the following changes the value "a" through its pointer
  *p = 20;
}
```

## C and C++ pointers and the heap

Pointers are required in order to manage variables on the heap (free store). In short:

```cpp
int main(){
  int *p;
  p = new int[5];  // this allocated 5*size of int in the heap, somewhere

  // the C based version of new assuming int's are 2 bytes long
  //p = (int *)malloc(2 * 5);
  
  // do stuff to p...

  delete[] p;      // clear the heap (do this before resetting the pointer!)
  p = NULL;        // reset the pointer
}
```

Grant access to stack and heap resources, by address. Functions called are stored in the stack, along with their local variables

### Storing data on the heap in C++ with `new` and `delete`

In C, data is stored (dynamically) in the heap using `malloc()`.

```cpp
#include<stdlib.c>

int main(){
  int *p;
  malloc(5*sizeof(int)); //allocates space in the heap
  p = (int*)(malloc(5*sizeof(int)));
}
```

In C++, use the keyword `new`.

```cpp
// pointer p resides on the stack, and points to an array (of int)
// that resides in the heap
int *p = new int[5];
```

This next example shows some examples about pointer arithmetic and how to free arrays in heap.

```cpp
 #include <iostream>

 using std::cin;
 using std::cout;
 using std::endl;

 int main(){

  int arraySize = 5;

  // assign the int pointer (which resides on the stack) 
  // to a new array of int (which resides in the heap);
  // note that both int declarations must match
  int *arrayOne = new int[arraySize];
  int *tempArray;

  int added = 0;
  int heapIndex = 0;
  int answer = 0;

  // assume that at least one value is entered
  while (true){
   cout << "Enter an non-zero integer value (enter 0 to quit): ";

   // using the int equivalent of the input would also work here
   cin >> answer;

   if (answer == 0){
    cout << "Terminating input...";
    break;
   }

   added++;
   arrayOne[heapIndex++] = answer;

   // if the last element was assigned,
   if (heapIndex == arraySize){
    cout << "Increasing the array size..." << endl;

    arraySize += 5;
    cout << "New array size: " << arraySize << endl;

    // tempArray points to a new larger array (of int)
    tempArray = new int[arraySize];

    for (int j = 0; j < added; j++){
      // get everything from the smaller array to the newer, larger array 
      tempArray[j] = arrayOne[j];
    }

    // clear the heap of the smaller array's elements; note that arrayOne 
    // is itself a pointer (to an int) that resides on the stack: this 
    // operation does not remove arrayOne
    delete[] arrayOne;

    // pointers (unlike C++ references) are mutable so reassign arrayOne
    arrayOne = tempArray;

    // arrayOne refers to a larger array, so reset the address stored
    // by tempArray
    tempArray = 0;
   }
  }

  cout << "You entered a total of " << heapIndex << " value(s)" << endl;

  int sum = 0;
  bool groupDoneYet = false;
  int i = 0;

  // only process as many elements that were added
  for (; i < added; i++){
   groupDoneYet = false;
   cout << arrayOne[i] << " ";
   sum += arrayOne[i];

   // process the sum and average of each group of five
   if ((i + 1) % 5 == 0){
    cout << "sum: " << sum << " and average: " <<  
       static_cast<double>(sum/5) << endl;
    sum = 0;
    groupDoneYet = true;
   }
  }

  // handle the remaining elements (not part of a complete group of five)
  if (!groupDoneYet)
   cout << "sum: " << sum << " and average: " <<
       static_cast<double>(sum/(i%5)) << endl;

  cout << "Clearing up..." << endl;

  // release all heap memory
  delete[] arrayOne;

  // remove the address (set arrayOne to NULL)
  arrayOne = 0;

  return 0;
 }
```

### Pointers to char

Despite the syntax, there are no pointers to a single `char` but there are pointers to an array of characters, i.e strings.
One can initialise the value the pointer points to directly with a string literal:

```cpp
// a bit misleading, someString is actually pointing to an array of characters
char *someString = "Welcome to the world of C++ pointers";

// compare this to pointers to other types
double someDouble = 2.2;
double *ptrDouble = &someDouble;

*ptrDouble = 5.5;
```

A string is a sequence of characters with a terminating `null` character `/0`. The string itself is
immutable, though the pointer is mutable. To effectively change the string
one would re-assign the pointer to a new string literal. (Variables of type `char` do not have an additional terminating
null character.)

To get the first character of a pointer to an array of characters, one would use the indirection operator twice:

```cpp
// the string literal resides on the heap
char *someString = "Welcome to the world of C++ pointers";
char someStringAgain[] = "Welcome to the world of C++ pointers again";

char firstChar = *(*someString);
char firstCharAgain = someStringAgain[0];

char secondChar = *(*someString + 1);
char secondCharAgain = someStringAgain[1];
```

### Arrays of pointers to char

Since there are only pointers to an array of characters, i.e. pointers to strings, it is also true that
an array of pointers to a `char` is in fact an array of pointers to strings.

```cpp
char *someArrayOfStrings[2];

// assign the first element
*someArrayOfStrings = "First element";

// assign the second element (uses pointer arithmetic)
*(someArrayOfStrings + 1) = "Second element";

// someArrayOfStrings[0] and *someArrayOfStrings represents the first element
char aString[100] = *someArrayOfStrings;

// someArrayOfStrings[1] and *(someArrayOfStrings + 1) represents the second element
char a2String[100] = *(someArrayOfStrings + 1);

// someArrayOfStrings[1][0] and *(*(someArrayOfStrings + 1)) represents the first char of the second element
char aChar = *(*(someArrayOfStrings + 1));

// someArrayOfStrings[1][3] and *(*(someArrayOfStrings + 1) + 3) represents the fourth char of the second element
char aChar = *(*(someArrayOfStrings + 1) + 3);
```

Generally, `anArray[i][j]` is equivalent to `*(*(anArray + i) + j))`. One could combine array and pointer notation but this then gets a bit unwieldy.

## References (C++)

References are aliases to variables, and not part of C. They do not create copies of variables they reference
to in any function call (other than `main()`). Unlike pointers, __references are immutable__ and so must be
assigned as an alias to one variable for the program's entire lifecycle.

Functions which handle the references do not reside in separate stack frames and instead are part of the `main()` stack frame.

```cpp
//general form i: type & identifier
 int main(){
  int a = 10;
  int &r = a;
 }
```

References do not need dereferencing and their identifier (i.e. `r`) automatically provides the value it points to.
The address the reference points to is given by `&r`.

The address of `a` and `r` are the same, so any operations on `a` and `r`are the same. So `r++` is equivalent to `a++`.
The tokens `&r` to the left of the assignment operator assign a reference `r` to some variable.

Tokens `&r` to the right of the assignment operator return the address the reference points to. For example:

```cpp
  int* intPtr = &r;
```

All references MUST be initialised.

## Pointers and Structures

Pointers can be assigned to the address held by references, e.g. structures:

```cpp
 struct Rectangle *p = &r;

 // dereferencing operator * has lower precedence than the 
 // member access operator . hence the parenthesese 
 // dereference the structure pointer p first before 
 // accessing the member
 (*p).length = 20;
```

Alternatively, one can use the indirect member operator (->) instead of (*p). The indirect member selection is also used with C++ classes.

```cpp
 p->length = 20;
```

## Functions and parameter passing

Passing by value assigns a variable, local to the function, with the parameter. The variable passed as the parameter resides in a
different part of memory. Only a copy of the variable is handled by the function: hence the original variable cannot be changed.
To change a parameter passed as a variable, send its address in the form of a reference or a pointer.

### Passing pointers and function overloading

From the given block (quite often `main()`), the address of parameter(s) can be sent to a function so as to allow the parameter
values to change. The following function call passes the address of the variables `a` and `b`.

```cpp
 swap(&a, &b);
```

It is also possible to send pointers directly instead of addresses of variables.

```cpp
 swap(pointerA, pointerB);
```

The corresponding function prototype (or _declaration_, that is, the function signature: function return and parameter types,
and, the function name), one then needs to have formal parameters as pointers, for example:

```cpp
 void swap(int *x, int *y);

 // provide function overloading capability (this will require 
 // a separate function definition)
 void swap(double *x, double *y);
```

The above definition expects pointers, which are then referred to as `x` and `y` in the `swap()`. The function body would
then need to dereference `x` and `y` (using `*x` and `*y`) in order to access the values of `a` and `b`.

Function overloading permits a more readable code base, particularly when the only difference between all functions is the
parameter list. If function overloading becomes excessive then consider using _function templates_ instead.

### The main() method

The `main()` method can have arguments defined which end up representing command-line parameters.

```cpp
 int main(int argc, char* argv[]){
  // do stuff...
 }
```

The first argument `argc` represents the number of arguments and the second argument `argv` is an array of pointers to strings
(recall above ideas). Each character pointer points to the first character of the string. The first element of `argv` is
always the program name and so `argc` is always at least 1.

### Passing by reference (C++ only)

Instead of passing by value or pointer, one can use references to the values and pass references.

```cpp
 swap(int &x, int &y);
```

The above call assigns x and y as references to the function-local parameters `a` and `b`. Thus, the function call `swap(a, b)`
can change the values of the actual-parameters. This provides an alternative to the pointer approach above.
The function prototype would take the form of:

```cpp
 void swap(int &x, int &y);
```

### Passing arrays

Recall that arrays can be thought of as pointers to the first element of an array. The type of the array and number of elements
present indicates how much storage space is required.

Passing arrays is equivalent to passing pointers.

```cpp
 fun(int A[], int n);
```

The above call is equivalent to the following but not specific for arrays:

```cpp
 fun(int *A, int n);
```

The function prototype would be something like:

```cpp
 void fun(int someArray[], int someInt);
```

### Passing read-only addresses

It is possible to force the compiler to prevent the function from editing the address of variable by using the `const` keyword
in the function prototype:

```cpp
 void swap(const int &x, int &y);
```

In this case, the reference corresponding to x cannot be changed, however, that corresponding to y can.

### Passing structures

One can pass structures as values, references and pointers. Here is an example of a function definition involving references
and pointers to structures. Both approaches allow one to change the actual-parameter passed.

```cpp
 int area(struct Rectangle &z){
  z.length++;
  return z.length * z.breadth;
 }


 int area2(struct Rectangle *p){
  (p*).length++;
  return p->length* p->breadth;
 }
```

## Static variables

The keyword `static` declares variables (as well as objects and functions) which are initialised once (all subsequent initialisations
are ignored) and retain their value for the duration of the function call, including `main()`.

## Returning pointers and references

In all cases, do not return the address (by pointer or reference) of local variables to the function. This is because the local
variable is freed once the function termiantes and so the pointer or reference will be pointing to an undefined region of memory.
Instead, build a new pointer to the local variable in the heap with `new` and return the pointer.

The first snippet will not work but the second will:

```cpp
 double* someFunc(double data){
  double someData = 3*data;
  return &someData;
 }

 double* someFunc2(double data){
  double* something = new double(3*data);
  return something;
 }
```

Returning references is also similarly fraught with errors. Additionally, avoid the mistake of returning pointers when references are called for:

```cpp
 double& someFunc3(double someArray[]){
  // do stuff...
  return someArray[2];
 }
```

Here the function is defined such that it returns a reference to the third element of `someArray`.  Note that using `&someArray[2]`
would return the address (pointer) of the result, which is not an alias to the result.

Overall, `someArray[]` was initialised before `someFunc3` was called.

## Pointers to functions

In relation to the syntax for returning pointers, it is also possible to build pointers to functions.

```cpp
// returns a pointer to a double
 double* someFunc(double data){
  // do stuff
 }

 // a standard function delarations
 double specificFunc(double Num1, char* charPointer);

 double specificFunc2(double NumA, char* charPointerB);

// declares a pointer to a function, returning a double
 double (*someFunc)(double, char*);

 // assign the pointer to a function with same signature
 someFunc = specificFunc;

 // pointers are mutable so one can re-assign
 someFunc = specificFunc2;

 // or declare and assign in one go...
 double (*someOtherFunc)(double, char*) = specificFunc2;
```

In the above case, the function name is `someFunc` and has two arguments, one of type double and the second of type pointer
to char. The pointer `someFunc` can be assigned to any function with the same signature.

The pointer can then be used in place of the function.

```cpp
double someDouble = 3.3;

char someChar = 'E';
char* charPointer = &someChar;

someFunc(someDouble, charPointer);
```

## Functions as arguments of other functions

With the pointer to a function, one can define a function argument list where at least one argument is a pointer to a
function. This provides a way for the calling function to invoke other functions via the pointer.

```cpp
// these would normally be defined after main()
double callingFunc(double anArray[], double (*someFunc)(int));
double randomFunc(int value);

int main(){
  double array[] = {1.1, 2.2};

  // call randomFunc with callingFunc
  double newDouble =  callingFunc(array, randomFunc);
}

double randomFunc(int value){
  return static_cast<double>(value);
}

double callingFunc(double anArray[], double (*someFunc)(int){
  if (anArray[5] == 0){
    return someFunc(5);
  }
  return 0.5;
}
```

Note that someFunc is assigned to randomFunc without params so that it is called within the calling function, i.e. not

```cpp
double newDouble =  callingFunc(array, randomFunc(3));
```

The above executes randomFunc(3) before callingFunc() and so callingFunc does not call randomFunc within the body.
Assign someFunc to randomFunc by passing randomFunc as a parameter and let callingFunc use the pointer.

## Array of pointers to functions

One can also declare an array of pointers to functions and call a specific element (function) with an index.

```cpp
// assigns a constant argument
char charFunc(char);
char charFuncAgain(char);

char (*pointerArrayFunc[2])(char) = { charFunc, charFuncAgain};

// call the second function element
char someChar = pointerArrayFunc[1];
```

## Default arguments

Default arguments amount to constant arguments which are assumed if the function call does not pass a required parameter.
The default argument must be included in the function prototype.

```cpp
#include <iostream>

void printMe(const char message[] = "Default message");

int main(){
  const char alternativeMessage[] = "Something odd going on here";

  // use the default
  printMe();

  // use the alternative
  printMe(alternativeMessage);
}

void printMe(const char message[]){
  std::cout << message << endl;
}
```
