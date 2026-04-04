---
title: Essential C and C++
nav_order: 1
parent: ADTs and Algorithms in C++
---

# Essential C and C++

## Preprocessor directives

__Directives__ direct the compiler to do something. _Preprocessor directives_ specifically direct preprocessor actions before compilation to object code.

```cpp
// insert the input-output stream header (definitions)
#include <iostream>
```

Within brackets, the preprocessor searches for a header file (with the name given) along a predefined path (a system file defined as an environment variable). Within double quotes, the preprocessor looks for the header file by filename first (in the same folder of the file that the directive is called), before trying the predefined path. The latter therefore tends to be used 
for non-standard libraries.

```cpp
// insert the input-output stream header (definitions)
#include <iostream>
#include "myLibraryHeader.h"
```

## Fundamental types

|__Type__|__Size (byte)__|__Range of values__|__Types with literals__|
|-|-|-|-|
|bool (C++; C99 or above, use _Bool)|1|true or false|```bool isRed = true;```|
|char|1|Equivalent to signed char or unsigned char (compiler dependent)|```char letA = 'A';``` or ```char letA = 65;```|
|signed char|1|-128 to 127|```signed char letA = 'A';```|
|unsigned char|1|0 to 255|```unsigned char letA = 'A';```|
|wchar_t (C++)|2|Wide char, 0 to 65,535|```wchar_t wideChar = L'Z';``` see note below|
|short|2|-32,768 to 32,767|```short someNo = 5;```|
|unsigned short|2|0 to 65,535|```unsigned short nothing = 0u;```|
|int|4|-2,147,483,648 to 2,147,483,647|```int bigValue = 456354;```|
|unsigned int|4|0 to 4,294,967,295|```unsigned int evenBigger = 12546865U;```|
|long|4|same as int, above|```long longer = 24l;```|
|unsigned long|4|same as unsigned int, above|```unsigned long twoFour = 24lu;``` or ```unsigned long twoFour = 24ul;```|
|float|4|&#177;3.4x10<sup>&#177;38</sup> precision of 6-7 d.p.|```float someFloat = 110.0f;``` or ```float someExp = 1.88E10f;```|
|double|8|&#177;1.7x10<sup>&#177;308</sup> precision of 15 d.p.|```double someDouble = 3.14;``` or ```float someDouble = 3.14;``` see below|
|long double|8|&#177;1.7x10<sup>&#177;308</sup> precision of 19 d.p.|```long double someLongDouble = 3.13E-24l;```|

_Wide characters_: this can be confusing if applied to different environments. On Windows, wide characters are typically UTF16 (2 bytes) while
on other machines are UTF32 (4 bytes).

Unsigned variables must be appended with U or u. Long variables must be appended with l or L.

Floating-point number must contain at least a decimal point or an exponent E. When appended with the letter f, floating-points are treated as type float, otherwise they
are treated as type double.

## Custom (derived) data types

### Typedefs

Typedefs are synonyms of existing types, including pointers and classes, and mainly used to make code easier to read.

```cpp
typedef long int BigInt;

BigInt someNumber = 10L;
// equivalent to
// long int someNumber = 10L;
```

### Enumerations

Enumerations are collections of related constants. They indexed by integers by default but can be indexed with characters instead.

```cpp
 int main(){

  // of type int by default, MondayN = 0 etc.
  enum WeekDayNum {
   MondayN,
   TuesdayN,
   WednesdayN,
   ThursdayN,
   FridayN
  };

  // of type char, Monday = M
  enum WeekDay : char {
   Monday = 'M',
   Tuesday = 'T',
   Wednesday = 'W',
   Thursday = 'T',
   Friday = 'F'
  };


  WeekDay someWeekDay = Monday;
  WeekDayNum someWeekDayNum = MondayN;

  // use a more modern form of type-casting
  cout << "The current weekday set is: " << static_cast<char>(someWeekDay) << endl;
  cout << "The current weekday (num) set is: " << someWeekDayNum << endl;

  cout << "Pick a number between 0 and 4: " << endl;

  int customDay;
  cin >> customDay;

  while (customDay < 0 || customDay > 4){
   cout << "Please enter a value between 0 and 4, inclusive: " << endl;
   cin >> customDay;
  }

  if (someWeekDayNum == customDay){
   cout << "You picked the same day" << endl;
  } else
   cout << "You picked a different day" << endl;

  return 0;
 }
```

The above `static_cast<destinationType>(originType)` operator does not check the validity of the cast, so it is up to the developer to make sure
that the cast is valid. If the cast is invalid at runtime then the program will terminate. To get the compiler to check the validity of the cast, and
then set the output as null (as opposed to terminate the program) use `dynamic_cast<destinationType> (orginType)`.

### Structures

_Structures_ are collections of data types under one name and remain pervasive, particularly in solutions which are/were written primarily in C. Each structure is defined by its __members__ or __fields__.

```cpp
  struct Rectangle{
    int length;
    int breadth;
  };

 void main(){
  Rectangle r; //places r in the stack
  r = {10, 5};  //initialises r
  
  r.length = 10;
  r.breadth = 20;
  
  printf('Area of rectangle is %d/n', r.length*r.breadth);
  
  //declaring an array of structs
  Rectangle rectangles[5];

  rectangles[0].length = 30; //etc...
 }
 ```

 Structure members (or fields) can be of any type except for the structure being defined. To use the same structure definition in the structure, use a pointer to the structure instead:

 ```cpp
  struct Node {
    int level;
    struct* Node node;
    struct AnotherStruct another;

    // would not compile
    // struct Node node;
  };
```

This idea is useful for linked lists.

C structures are generally superseded by C++ classes.

### Unions

_Unions_ are similar to C/C++ structures in that they collect fields but differ in that only one field can be assigned at a given time. These tend to be useful when data can take on different types but logically represent the same construct. For example, IDs can be of type int in some cases but then be of type char in others.

The memory reserved for unions is the same as that required for the largest fundamental data type involved.

```cpp
union shreadID
{
  int intId;
  char charId;
}

// define an instance of a union
sharedID unionInstance;

// set intId; override (clear) charId
unionInstance.intId = 12;

// change of circumstance, set charId; override (clear) intId
unionInstance.charId = 'D';
```

## Namespaces (C++)

Variables and functions with the same name (e.g. ```value``` below) in one library can often be used and therefore conflict with other variables and functions in another. To get around this,
C++ introduces the idea of _namespaces_ which act as a container, setting a prefix to each variable or function listed within the namespace.

```cpp
namespace someNamespace
{
  int value = 0;
}
```

When referring to said variables and functions outside of the library, developers can use a fully qualified identifier with the scope resolution operator (::) as follows:

```cpp
#include <iostream>

namespace someNamespace
{
  int value = 0;
  int value2 = 2;
}

// perfectly legal; value here is a different variable (with value 1) compared to value in the namespace
int value = 1;

int main()
{
	std::cout << "Coming at you from the standard library namespace, std\n";
	std::cout << "someNamespace: " << someNamespace::value << '\n'; // prints 0
	std::cout << "Global namespace scope: " << value << '\n'; // prints 1
	return 0;
}
```

Using fully qualified names can get verbose, so instead one can apply the _using directive_ which indicate __all__ variables and functions of a given namespace that can be referred to more concisely:

```cpp
#include <iostream>

namespace someNamespace
{
  int value = 0;
  int value2 = 2;
}

// using directives
using namespace std;
using namespace someNamespace;

// won't build anymore, as reference to value is ambiguous with using directive
int value = 1;

int main()
{
	cout << "Coming at you from the standard library namespace, std\n";
	cout << "someNamespace: " << value << '\n'; // prints 0
	cout << "Global namespace scope: " << value << '\n'; // prints 1
	return 0;
}
```

Note however that _using directives_ (to other libraries) allows developers to use all variables and functions in the namespace, and thus limits what 
can be declared in the current project, thus defeating the purpose of namespaces.

Instead, a more selective and mostly preferred approach is to use _using declarations_ instead of _using directives_.

```cpp
#include <iostream>

namespace someNamespace
{
  int value = 0;
  int value2 = 2;
}

// using directives
using namespace std;
using someNamespace::value;

// perfectly legal, since we can still refer to value2 from someNamespace if we fully qualify
int value2 = 1;

int main()
{
	cout << "Coming at you from the standard library namespace, std\n";
	cout << "someNamespace value: " << value << '\n'; // prints 0
	cout << "Global namespace scope: " << value2 << '\n'; // prints 1
	cout << "someNamespace value2: " << someNamespace::value2 << '\n'; // prints 2
	return 0;
}
```

It is possible to define multiple namespaces in a given file.

## Arrays and strings

Arrays in C_ and C++ are zero-based.

```cpp
// array declaration
long numbers[7];

// array initialisation; the final and third element would be initialised with zero
long moreNumber[3] = {34, 12};

std::cout << "moreNumber second element: " << moreNumber[1]; // prints 12
```

Arrays are always blocked in sequence in memory from the first to the last element. 

The literal ```moreNumber[1]``` is actually a pointer to the beginning of the array and then 1 block after. Since 
the compiler knows the data type of the array and therefore the size of the type, it can automatically navigate to the location of the second element. Furthermore, the array itself
is stored dynamically, and is located on the heap (or free store) in memory. Pointers and the heap are outlined [later](./2_Stack_and_Heap.md#data-structures-in-memory).

Strings, via raw arrays, are arrays of characters. A list of strings can be handled with a multidimensional (two-dimensional) array of characters.

Examples of string features are given here for completeness, though most developers will find the standard library String class (```#include<string>```) much easier to use.

```cpp
#include <iostream>

using std::cin;
using std::cout;
using std::endl;
using std::fill;
using std::copy;

int main()
{
	const int MAX = 80;
	char buffer[MAX];
	const int MAX_STRINGS = 2;
	
	char stringList[MAX_STRINGS][MAX];

	int count = 0;

	for (int z = 1; z < MAX_STRINGS + 1; z++)
	{
		cout << "Enter string " << z << " with a max of " << MAX << " characters:" << endl;

		// read a string until a new line
		cin.getline(buffer, MAX, '\n');

		copy(buffer, buffer + MAX, stringList[z-1]);

		cout << "Filled array with string " << z << endl;
		
		// no direct way to clear an array, so we use std::fill
		fill(buffer, buffer + MAX, 0);
	}

	cout << endl;
	
	for (int j = 0; j < MAX_STRINGS; j++)
	{
		cout << "String " << j + 1 << ": " << stringList[j];
		cout << endl;
	}

	return 0;
}
```