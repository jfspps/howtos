---
title: Microsoft Windows API C++ applications
nav_order: 2
parent: Programming in C++
---

# Microsoft Windows API C++ applications

This article demonstrates the main aspects involved to building Windows applications with MVS using the Windows API.

## Windows Data types

Both Windows API and MFC (Microsoft Foundation Classes) derived applications make use of Windows data types, which map to C++ types. 
Some (not all) are tabulated below:

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

### Defining the sort of window to create: WNDCLASSEX

The C/C++ structure `WNDCLASSEX` defines what sort of window to create. The naming CLASS is not a C++ class, but an MFC class, a representation of a window. Historically, `WNDCLASSEX` succeeds (implements additional parameters) an older structure, `WNDCLASS`.

An instance of WNDCLASSEZ is constructed in WinMain(), and so have access to its parameters.

The fields to focus on for now are commented:

```cpp
struct WNDCLASSEX {
	UINT cbSize;
	UINT style;
	WNDPROC lpfnWndProc;
	int cbClsExtra;
	int cbWndExtra;
	HINSTANCE hInstance;
	HICON hIcon;
	HCURSOR hCursor;
	HBRUSH hbrBackground;
	LPCTSTR lpszMenuName;
	LPCTSTR lpszClassName;
	HICON hIconSm;
}

// construct an instance of WNDCLASSEX:
WNDCLASSEX windowClass;

//initialise specific fields

// size of the structure object
windowClass.cbSize = sizeof(WNDCLASSEX);

// determine behaviour e.g. when the window should
// be redrawn (in this case, when both the horizontal
// and vertical dimensions have changed); the bitwise
// OR is applied as both options (flags) are have null, true or
// false states (in this case as 32-bit words set to 1 for true)
windowClass.style = CS_HREDRAW | CS_VREDRAW;

// set a pointer to a function that handles messages i.e. WindowProc
windowClass.lpfnWndProc = WindowProc;

// pass WinMain's hInstance as the current instance's value
windowClass.hInstance = hInstance;

// the following window elements (icon, cursor and brush) 
// can be set to null, after which
// Windows will apply defaults (standard UI elements); the following
// explicit calls are equivalent to null passed
windowClass.hIcon = LoadIcon(0, IDI_APPLICATION);
windowClass.hCursor = LoadCursor(0, IDC_ARROW);
windowClass.hbrBackground = static_cast<HBRUSH>(GetStockObject(GREY_BRUSH));

// set the name that identifies this classification of window
static char szAppName[] = "someName";
windowClass.lpszClassName = szAppname;
```

### Registering WNDCLASSEX object with Windows

The Windows API function `RegisterClassEx()` can be used the _register_ the
`WNDCLASSEX` object (or registering the window classification) with Windows. 
Historically, the function `RegisterClass()` can be used to register objects 
of the older `WNDCLASS` strcuture.

### Getting a reference to the window created

The Windows API function `CreateWindow()` can be called after window registration
and return a reference to the window. The reference can be useful later. Note
this does not mean the window is drawn or shown yet.

```cpp
HWND hWndAlpha;

//...

hWndAlpha = CreateWindow(
	szAppname, // allows Windows to find the registered window
	"The Window title goes here",
	WS_OVERLAPPEDWINDOW, // this defines what sort of window components to show
	CW_USEDEFAULT, // the next four are about window size and position
	CW_USEDEFAULT,
	CW_USEDEFAULT,
	CW_USEDEFAULT,
	0, // 0 = this is a parent window (no handle); pass the parent of the parent handle if required
	0, // 0 = no menu required
	hInstance, // this would come from WinMain for this application
	0 // 0 = simple window layout (single document inteface SDI); multi-document interface (MDI) discussed later
);
```

### Showing the window

The Windows API function `ShowWindow()` then draws the window on the screen.

```cpp
// note aforementioned parameters, the reference to the created window and WinMain's nCmdShow
ShowWindow(hWndAlpha, nCmdShow);
```

At present, this will show the window but without application content. The code to draw the content is normally defined in `WindowProc()`.
Then, call `UpdateWindow(hWndAlpha)` to get Windows to refer to that code and draw the content.

```cpp
// invoke code (trigger an event/send a message) from WindowProc()
UpdateWindow(hWndAlpha);
```

We cover Windows application messaging in more detail first before returning to updating the application content.

### Windows Messages

Messages are either

+ Queued (e.g. user interaction; these are queued in `WinMain()`)
+ Non-queued

Messages are handled as follows:

1. Process queued messages (if they exist) in WinMain()
2. Ask Windows to call WinProc() (this doesn't happen automatically) to deal
with the message. By this point, the message isn't in a queue anymore.

The WinMain() _message loop_ can take the form given below:

```cpp
MSG msg;
while (GetMessage(&msg, 0, 0, 0) == TRUE){
	// perform any (keyboard input) conversion of the message if required
	TranslateMessage(&msg);

	// get Windows to call WindowProc() to deal with the message
	DispatchMessage(&msg);
}
```

The variable `msg` above is an example of a Windows message (C/C++) structure:

```cpp
struct MSG {
	HWND hwnd; // handle to the relevant window
	UINT message; // message ID, based on standard actions e.g. WM_PAINT, WM_QUIT
	WPARAM wParam; // note this is not a WORD, despite the "w" in "wParam"
	LPARAM lParam;
	DWORD time; // when messsage was queued
	POINT pt; // mouse position
}
```

The function `GetMessage()` always returns true when a messsage to quit hasn't been queued or there is no error involved.

```cpp
GetMessage(
	&msg, // stores the message content, via a reference, for a queued message found 
	0, // 0 = retrieve all message for an application, regardless of the no. of windows created
	0, // these last two params indicate boundaries to message IDs, which allow Windows to focus on specific actions
	0
);
 ```

Setting the second parameter to `GetMesage()` is preferred. If the application is composed of multiple windows and 
the second parameter to GetMessage is assigned to a particular window (i.e. listens to events from one window only), 
then its possible GetMessage won't receive the action to quit, and therefore the application may never close.

### Multitasking in Windows, old and new

For older 16-bit Windows operating systems, if there are no pending messages for a given application following
evaluation of `GetMessage()`, then the operating system will allow execution to pass to another application to
check its message queue. This mechanism of running multiple applications is known as `cooperative multitasking`.

For more modern operating systems, Windows can interrupt an application after a given period to transfer control
to anther application, regardless of whether messages are pending. This approach is referred to as `pre-emptive multitasking`.

In either case, implementation of a messaging loop is required, since the application will need to prepare for
the case when Windows interrupts execution.

### Defining application behaviour: WindowProc()

As is hopefully becoming evident, most of the custom application logic is defined in `WindowProc()`. Below is the prototype:

```cpp
LRESULT CALLBACK WindowProc(
	HWND hWnd,
	UINT message, // message ID
	WPARAM wParam,
	LPARAM lParam
);
```

Recall from [Windows data types](2_WindowsAPIApplications.md#windows-data-types) 
that `LRESULT` is the return to the message, equivalent to a `long`.
The specifier `CALLBACK` is needed to indicate (for various reason) that 
`WindowProc()` is accessed through a pointer and how Windows should handle the four parameters.

In effect, `WindowProc()` processes the message IDs (known by the second parameter) via a `switch` block:

```cpp
switch (message)
{
	case WM_PAINT:
	// code to handle drawing
	break;

	case WM_LBUTTONDOWN:
	// code executed when the left mouse button is pressed
	break;

	case WM_LBUTTONUP:
	// code executed when the left mouse button is released
	break;

	case WM_DESTROY:
	// code executed when the window is destroyed
	break;

	default:
	// default actions...
}
```
