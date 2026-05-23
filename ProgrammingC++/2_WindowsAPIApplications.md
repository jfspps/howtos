---
title: Microsoft Windows API C++ applications
nav_order: 2
parent: Programming in C++
---

# Microsoft Windows API C++ applications

This article demonstrates the main aspects involved to building Windows applications with MVS using the Windows API.

## Windows Data types

Both Windows API and MFC (Microsoft Foundation Classes) derived applications make use of Windows data types, which map to C++ types.

|Windows data type|Description|
|-|-|
|BOOL or BOOLEAN|A boolean that can be either `TRUE` or `FALSE` (uppercase, contrast to `true` and `false` in C++)|
|BYTE|An 8-bit byte|
|CHAR|An 8-bit character|
|DWORD|A 32-bit unsigned integer, equivalent to `unsigned long` in C++|
|HANDLE|A 32-bit integer value that records the location of an object|
|HBRUSH|A handle to a brush (a brush fills an area with colour)|
|HCURSOR|A handle to a cursor|
|HDC|A handle to a device context (an object enables a window to be drawn)|
|HINSTANCE|A handle to an instance (running application)|
|LPARAM|A message parameter|
|LPCSTR|A pointer to a constant null-terminated string of 8-bit characters|
|LPHANDLE|A pointer to a handle|
|LRESULT|A signed value that results from processing a __message__ (a message represents an application event)|
|WORD|A 16-bit unisgned integer, equivalent to an `unsigned short` in C++|

All above types are contained the header file `windows.h`.

## Hungarian notation

Before the days of strict type-checking at compile-time, programmers would attempt to resolve type misuse by prefixing variable names
with letters to indicate their type. This `Hungarian notation` is largely not required anymore with modern C++ compilers that check for
valid type handling. The notation is however still prevalent in Windows application code.

|Prefix|Variable type/intention|
|-|-|
|b|BOOL, equivalent to `int`|
|by|unsigned char; a byte|
|c|char|
|dw|DWORD; an `unsigned long`|
|fn|a function|
|h|a handle|
|i|`int`|
|l|`long`|
|lp|`long` pointer|
|n|`int`|
|p|a pointer|
|s|a string|
|sz|a __zero__ terminated string|
|w|WORD; `unsigned short`|

## Windows applications

Windows recognises and calls two functions in a C++ project:

+ `WinMain()` - where execution begins and ends
+ `WindowProc()` - Windows message handling with the application

### WinMain()

The function has the prototype (note the Hungarian notation applied):

```cpp
int WINAPI WinMain(
	HINSTANCE hInstance,
	HINSTANCE hPrevInstance,
	LPSTR lpCmdLine,
	int nCmdShow
)
```

The parameters:

+ `hInstance` - a unique handle (32-bit integer) for the instance
+ `hPrevInstance` - for 16-bit applications, a handle to the previous instance of the application; this is always NULL for 32-bit applications
+ `lpCmdLine` - a pointer to a command line instruction that ran the application
+ `nCmdShow` - the display mode of the application e.g. normal, minimised, maxmised.

The function returns an instance of `WINAPI`, which is required for all C++ applications on Windows.

## Defining the sort of window to create: WNDCLASSEX

The C/C++ structure `WNDCLASSEX` defines what sort of window to create. The naming CLASS is not a C++ class, but an MFC class, a representation of a window.

Historically, `WNDCLASSEX` succeeds (implements additional parameters) an older structure, `WNDCLASS`.


