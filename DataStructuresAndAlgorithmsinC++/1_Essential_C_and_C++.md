---
title: Essential C and C++
nav_order: 1
parent: ADTs and Algorithms in C++
---

# Essential C and C++

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
|float|4|$\pm$ 3.4x10<sup>$\pm$ 38</sup> precision of 6-7 d.p.|```float someFloat = 110.0f;``` or ```float someExp = 1.88E10f;```|
|double|8|$\pm$ 1.7x10<sup>$\pm$ 308</sup> precision of 15 d.p.|```double someDouble = 3.14;``` or ```float someDouble = 3.14;``` see below|
|long double|8|$\pm$ 1.7x10<sup>$\pm$ 308</sup> precision of 19 d.p.|```long double someLongDouble = 3.13E-24l;```|

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
