---
title: GDI Windows API applications Part 1
nav_order: 6
parent: Programming in C++
---

# GDI Windows API applications Part 1

This article presents the Graphical Device Interface (GDI) from the point of view of Windows API applications, in constrast to the 
coverage with [MFC](3_MFCApplications.md#graphic-device-interface-gdi-with-mfc).

## Review of key GDI concepts so far

Windows applications define event handlers (callback functions) via `WinProc()`. User and Windows generated messages are placed in a queue, with those 
destined for the application captured by `WinProc()`. 

The messages have IDs (of type `UINT`) e.g. `WM_CREATE`, `WM_MOVE`, `WM_MOUSEMOVE` which are normally handled separately by a switch block in `WinProc()`.

In reference to the GDI, the message central to a window is `WM_PAINT`. This is sent whenever a window's contents needs updating. The process of responding to a window update is known as _validation_, updating some or all of the client area of the window. 
Recall, the client area is roughly the portion of the window without the title bar.

## Client area validation

The process of validation typically uses `BeginPaint()` and `EndPaint()`:

```cpp
PAINTSTRUCT ps;
HDC hdc;

case WM_PAINT:
  {
	// validate the window
	hdc = BeginPaint(hWnd, &ps);

	// repaint now...

	EndPaint(hWnd, &ps);
	return 0;
  } break;
```

The coordinates of the area that needs repainting are stored in `rcPaint` field of the `PAINTSTRUCT ps` 
that is returned by `BeginPaint()` (stored above in `hdc`).

## Updating the entire client area

The area returned (known to `hdc` above) is not always the entire client area, only some portion of it. If an update 
to the whole of the client area (e.g. for graphics applications and games) is required, then the application code
would instead get a handle to the _graphics device context_ of the window.

### Introducing GetDC and ReleaseDC

Normally, one can get the context with `GetDC()` but must then eventually return the handle back to Windows when 
done, with `ReleaseDC()`:

```cpp
// instead of using BeginPaint and EndPaint

// name as gdc to emphasise graphics device context
// (device contexts can also take the form of printers)
HDC gdc = NULL;

if (!(gdc = GetDC(hWnd))){
	error();
}

// do stuff with the entire client area...

// done, release the device context to Windows
ReleaseDC(hWnd, gdc);
```

Note, however that unlike the `BeginPaint()` and `EndPaint()` pairing which automatically inform 
Windows that the client area or portion of the client area has been validated, the `GetDC()` and `ReleaseDC()`
combination do not.

If an application uses the latter pairing, then a call to `ValidateRect()` will be required, to validate
the client area. A completed substitute would look like:

```cpp
PAINTSTRUCT ps;
HDC gdc;
RECT rect; // stores a rectangular portion of a window

case WM_PAINT:
  {
	gdc = GetDC(hWnd);

	// do stuff with the entire client area...

	// done, release the device context to Windows
	ReleaseDC(hWnd, gdc);

	// record the rectangle client coords (relative to the window)
	//(note the window coords are relative to the screen)
	GetClientRect(hWnd, &rect);

	// validate the window
	ValidateRect(hWnd, &rect);

	return 0;

  } break;
```

To reiterate, _client coordinates_ are always relative to the window, whereas 
_window coordinates_ are always relative to the screen. The origin is the upper-left corner, set to (0,0).

### Invalidating the entire client area

Alternatively, it is possible to manually invalidate the whole of the client area and then 
call `BeginPaint()` and `EndPaint()`, since `BeginPaint()` will in such cases always 
return coords of the whole of the client area.

To invalidate the whole of the client area, call `InvalidateRect()`:

```cpp
PAINTSTRUCT ps;
HDC hdc;

case WM_PAINT:
  {
	// invalidate the entire window
	InvalidateRect(hWnd, NULL, FALSE);

	// validate the window
	hdc = BeginPaint(hWnd, &ps);

	// repaint now...

	EndPaint(hWnd, &ps);
	return 0;
  } break;
```

The above approach is generally more applicable when responding to `WM_PAINT` messages. The aforementioned
`GetDC()` and `ReleaseDC()` pairing tends to be used when `WM_PAINT` is not involved.

## Excursion: RGB and palattes

To start off, colour can be represented _directly_ via an RGB system. There are a number of international RGB standards.

A 24-bit wide type can be broken up into three (equally portioned) 8-bit segments. Each segment represents the red, green and
blue components (channels) of colour.

8-bits will have 2<sup>8</sup> = 256 values, so each channel takes on 256 values. An 8-bit colour depth means that the actual number of RGB channels combinsations is limited to 8-bits or 256 combinations of red, green and blue, which is evidently much lower than the total number of RGB combinations.
Such predefined combinations can be tabluated:

|Index|Red|Green|Blue|
|-|-|-|-|
|0|100|5|36|
|1|29|200|60|
|2|52|36|161|
|...|...|...|...|
|255|100|100|100|

The above table represents a _palette_, and is a table of all (256) RGB combinations. It is actually referred to as a _colour lookup table_ or __CLUT__. Each pixel is assigned a value equivalent to a zero-based index of the table. The combination of red, green and blue is then pulled from the table 
and (via a digital to analogue converter, DAC) displayed by the pixel on screen.

## Printing text

Printing text can be performed with either `TextOut()` (simpler, faster) or `DrawText()` (more complex, supports formatting).

```cpp
// draw text at given coords with TextOut
bool drawn = TextOut(
	hdc,
	20, // x-coord
	30, // y-coord
	"Example output with TextOut",
	strlen("Example output with TextOut")
);

// draw text within a bounding rectangle with DrawText
int drawn = DrawText(
	hdc,
	"Example output with DrawText",
	strlen("Example output with DrawText"),
	&someBoundingRect,
	DT_LEFT // formatting flag (this one left-justifies text)
);
```

The [bounding rectangle](3_MFCApplications.md#enclosing-and-bounding-rectangles) required by DrawText is of type `LPRECT`. 

Recall, a _bounding rectangle_ defines the boundary within which to draw elements,
accommodating the thickness or width of lines. An _enclosing rectangle_ similarly defines the region within which elements reside but assumes a unit
pixel width. Boundary rectangles are therefore always at least as large as enclosing rectangles. The rectangles are defined by client coordinates.

The remaining commentary focuses on the simpler `TextOut()` call, while introducing transparency.

Printing text without transparency is generally quicker than printing text with it. To incorporate transparency, it will be necessary to set forground and 
background colours accordingly.

```cpp
COLORREF oldForeColour, oldBackColour;

int oldTransparencyMode;

HDC gdc = GetDC(hWnd);

// set a new foreground colour to green, saving the old one
oldForeColour = SetTextColor(gdc, RGB(0,255,0));

// set the background to black, saving the old one
oldBackColour = SetBkColor(gdc, RGB(0,0,0));

// enable transparency mode, saving the old preference
// (OPAQUE to disable transparency)
oldTransparencyMode = SetBkMode(gdc, TRANSPARENT);

TextOut(
	gdc,
	20,
	30,
	"Another example",
	strlen("Another example")
);

// restore previous settings
SetTextColor(gdc, oldForeColour);
SetBkColor(gdc, oldBackColour);
SetBkMode(gdc, oldTransparencyMode);

// release the device context
ReleaseDC(hWnd, gdc);
```

The above can be defined within a block following a window update:

```cpp
PAINTSTRUCT ps;
HDC hdc;

case WM_PAINT:
  {
	// validate the window
	hdc = BeginPaint(hWnd, &ps);

	// set a new foreground colour to green, saving the old one
	oldForeColour = SetTextColor(gdc, RGB(0,255,0));

	// set the background to black, saving the old one
	oldBackColour = SetBkColor(gdc, RGB(0,0,0));

	// enable transparency mode, saving the old preference
	oldTransparencyMode = SetBkMode(gdc, TRANSPARENT);

	TextOut(
		gdc,
		20,
		30,
		"Another example",
		strlen("Another example")
	);

	// restore previous settings
	SetTextColor(gdc, oldForeColour);
	SetBkColor(gdc, oldBackColour);
	SetBkMode(gdc, oldTransparencyMode);

	EndPaint(hWnd, &ps);
	return 0;
  } break;
```

## More Events

This section looks at more key events that are likely to be involved for any Windows Application. It extends the [introduction to WinProc()](2_WindowsAPIApplications.md#5-defining-application-behaviour-with-windowproc), looking at window, keyboard and mouse related events.

### Window manipulation

```cpp
LRESULT WINAPI WindowProc(HWND hWnd,
						  UINT message,
						  WPARAM wParam,
						  LPARAM lParam){

	// used in WM_PAINT
	PAINTSTRUCT	ps;
	// handle to a device context
	HDC	gdc;
	// used to print strings
	char buffer[80];

	switch (message)
	{
		case WM_ACTIVATE:
		// applicable when a window is being activated or deactivated
		break;

		case WM_CLOSE:
		// applicable when a window or the application is terminated
		break;

		case WM_SIZE:
		// applicable when a window size has been modified
		break;

		case WM_MOVE:
		// applicable when a window has been moved
		break;

		default:
		// default actions...
	}
}
```

The next subsections review the parameters passed to `WinProc()` from the point of view of extractable options.

#### Window activation and deactivation

+ message = `WM_ACTIVATE`
+ wParam 
  - activation flag (mouse click, activation via other device e.g. ALT-TAB and deactivation)
  - minimised flag (is or is not minimised)
+ lParam 
  - if this window is inactive, then this stores the handle being activated
  - if this window is active, then this stores the handle of the window being deactivated

```cpp
case WM_ACTIVATE:
{
	// applicable when a window is being activated or deactivated

	if (LOWORD(wParam) != WA_INACTIVE){
		// run when application or window being activated
	} else {
		// run when application or window being deactivated
	}
} break;
```

#### Window closure

+ message = `WM_CLOSE`

This is sent before both `WM_DESTROY` (window clean-up) and `WM_QUIT`. Implementing nothing 
here will not allow the application or window to close (without resorting to the Task Manager).

This event presents a useful confirmation point, asking the users to confirm that they want
to close the window or application:

```cpp
case WM_CLOSE:
{
	// applicable when a window or the application is terminated

	int result = MessageBox(
		hWnd, 
		"Are you sure you want to close?", 
		"WM_CLOSE Message Processor", 
		MB_YESNO | MB_ICONQUESTION
		);

	if (result == IDYES){
		// call the default handler (this would send WM_DESTROY)
		return DefWindowProc(hWnd, msg, wParam, lParam);
	} 

	return 0;
} break;
```

#### Window sizing

+ message = `WM_SIZE`
+ wParam 
  - resizing flag (inform all popups when this window is maximised, this window has been maximised, 
  inform all popups when this window has been restored to its former size, this window has been minimised,
  some other size update not previously recorded)
+ lParam 
  - width and length of the client area

This is particularly relevant when users maximise windowed games/graphics applications.

It is worth noting that when `WM_SIZE` messages are sent, quite often messages of the type `WM_PAINT` are also sent. Code defined
in one case may undo the work of the other if due care not given.

```cpp
case WM_SIZE:
{
	// applicable when a window size has been modified

	int width = LOWORD(lParam);
	int height = HIWORD(lParam);

	gdc = GetDC(hWnd);

	// green
	SetTextColor(gdc, RGB(0,255,0));

	// black
	SetBkColor(gdc, RGB(0,0,0));

	SetBkMode(gdc, OPAQUE);

	sprintf(buffer, "WM_SIZE called - new width and height: (%d, %d)", width, height);

	TextOut(gdc, 0, 0, buffer, strlen(buffer));

	ReleaseDC(hWnd, gdc);

} break;
```

#### Moving windows

+ message = `WM_MOVE`
+ lParam 
  - new screen coordinates (x, y)

This message is sent after the window has been moved by the user.

```cpp
case WM_MOVE:
{
	// applicable when a window has been moved

	int xPos = LOWORD(lParam);
	int yPos = HIWORD(lParam);

	gdc = GetDC(hWnd);

	// green
	SetTextColor(gdc, RGB(0,255,0));

	// black
	SetBkColor(gdc, RGB(0,0,0));

	SetBkMode(gdc, OPAQUE);

	sprintf(buffer, "WM_MOVE called - new x,y position: (%d, %d)", xPos, yPos);

	TextOut(gdc, 0, 0, buffer, strlen(buffer));

	ReleaseDC(hWnd, gdc);

} break;
```

### Keyboard driven events

The keyboard messages sent that are typically used include:

+ `WM_CHAR` - fired on key press(es) (i.e. with SHIFT) finding and sending the representative _ASCII code_ for the given character ('a', 'A'). This one
is used for e.g. text-entry based applications where the character needs to determined, as opposed to the key or keys pressed.
+ `WM_KEYDOWN` and `WM_KEYUP`- more generic messages (compared to `WM_CHAR`) which simply send the keyboard's _scan code_ for the given (individual) key. 
This one is used when keys are mapped to a given application function and one simply needs to fire an event when this key was pressed.
+ `GetAsyncKeyState()` - this tracks the last known state of the keys in a _state table_ (somewhat like an array of boolean switches)

#### WM_CHAR

+ message = `WM_CHAR`
+ wParam 
  - ASCII code of the key pressed
+ lParam 
  - bit encoding for the _key state vector_, for example the repeat count for a key, the scan code, whether the key is an _extended key_ such as the right-hand CTRL and ALT keys, whether the left-hand ALT is down, whether the key is currently in a state of being released or pressed

```cpp
case WM_CHAR:
{
	// applicable when a key or keys are pressed and we need its ASCII code

	char asciiCode = wParam;
	unsigned int keyState = lParam;

	gdc = GetDC(hWnd);

	// green
	SetTextColor(gdc, RGB(0,255,0));

	// black
	SetBkColor(gdc, RGB(0,0,0));

	SetBkMode(gdc, OPAQUE);

	sprintf(buffer, "WM_CHAR called - character: %c", asciiCode);
	TextOut(gdc, 0, 0, buffer, strlen(buffer));

	sprintf(buffer, "WM_CHAR called - key state: 0X%X", keyState);
	// place text below the one above
	TextOut(gdc, 0, 16, buffer, strlen(buffer));

	ReleaseDC(hWnd, gdc);

} break;
```

#### WM_KEYDOWN and WM_KEYUP

+ message = `WM_KEYDOWN` (or `WM_KEYUP`)
+ wParam 
  - virtual key code of the key pressed, symbolically prefixed with `VK_` e.g. symbol: VK_TAB, hexadecimal value: 09 for the tab key
+ lParam 
  - bit-encoded state vector that describes other special control keys that may have been pressed (same as `WM_CHAR`)

As is implied, `WM_KEYDOWN` is fired when the key is pressed, and `WM_KEYUP` is fired when the key is released.

This message is useful in gaming, as a e.g. a cursor is pressed:

```cpp
case WM_KEYDOWN:
{
	int virtualCode = (int)wParam;
	int keyState = (int)lParam;

	swtich(virtualCode){
		case VK_RIGHT:
		{
			// do stuff when pressing the right cursor...
		} break;
		case VK_LEFT:
		{
			// do stuff when pressing the left cursor...
		} break;
		case VK_UP:
		{
			// do stuff when pressing the up cursor...
		} break;
		case VK_DOWN:
		{
			// do stuff when pressing the down cursor...
		} break;

		default: break;
	}
}
```

#### GetAsyncKeyState()

This method works when one key is pressed. Passing the virtual key code (e.g. VK_SPACE) `GetAsyncKeyState()` will return 
the present key state, with 1 meaning it is pressed down and 0 meaning not. 

This is a method not a message and therefore can be used anywhere in an application to check if a specific key is pressed.

```cpp
// GetAsyncKeyState returns a SHORT (-32,768 to 32,767, 16-bit); 
// the hexadecimal 0x8000 is the minimum of 16-bit i.e. -32,768
if (GetAsyncKeyState(VK_DOWN) & 0x8000){
	// cursor down key is pressed
} else {
	// cursor down key is not pressed
}
```

The above could be simplified syntactically with macros:

```cpp
#define KEYDOWN(vkCode) ((GetAsyncKeyState(vkCode) & 0x8000) ? 1 : 0)
#define KEYUP(vkCode) ((GetAsyncKeyState(vkCode) & 0x8000) ? 0 : 1)

if (KEYDOWN(VK_DOWN)){
	// cursor down key is pressed
} else {
	// cursor down key is not pressed
}

if (KEYUP(VK_SPACE)){
	// space bar is up
} else {
	// space bar is pressed down
}
```

### Mouse driven events

The common messages are `WM_MOUSEMOVE` and the variations of button clicks and double clicks. For example, the left button has the following:

+ WM_LBUTTONDBLCLK
+ WM_LBUTTONDOWN
+ WM_LBUTTONUP

The middle (M) and right (R) mouse buttons have similar messages.

Both the mouse move and mouse button parameters are the same:

+ wParam 
  - button bit encoding, prefixed symbols `MK_` (e.g. MK_MBUTTON is set if the middle mouse button is down)
+ lParam 
  - the client coordinates of the pointer (x,y); the upper-left corner is the origin (0,0)

Here's an example:

```cpp
case WM_MOUSEMOVE:
{
	int mouseX = (int)LOWORD(lParam);
	int mouseY = (int)HIWORD(lParam);

	int buttons = (int)wParam;

	if (buttons & MK_LBUTTON){
		// left mouse button is down as the mouse is moved
		 sprintf(buffer,"Mouse left button down at (X,Y) = (%d,%d)", mouseX, mouseY);
	}
} break;

case WM_RBUTTONDBLCLK:
{
	int mouseX = (int)LOWORD(lParam);
	int mouseY = (int)HIWORD(lParam);

	sprintf(buffer,"Mouse right button double clicked at (X,Y) = (%d,%d)", mouseX, mouseY);
} break;
```

## Sending and posting messages manually

It is possible to send messages (initialising both `lParam` and `wParam` as required) either in the event loop (preferably)
or out of the event loop (care needed here; if the loop was terminated then it's possible to raise an _out of execution order_ 
exception).

The two methods available are:

+ `SendMessage(HWND hWnd, UINT msg, WPARAM wParam, LPARAM lParam)` - this sends the message to a window for immediate processing (this
actually calls the window's `WinProc()`), returning after the message has been processed (by `WinProc()`)
+ `PostMessage(HWND hWnd, UINT msg, WPARAM wParam, LPARAM lParam)` - this sends the message to a window queue (without requiring 
immediate processing), returning a non-zero immediately if successfully queued

Sending messages to the window is frequently used to update controls or other components following some event. In general, it is 
usually preferred to call `PostMessage()` rather than `SendMessage()` since it allows other events to complete as directed by the developer.

Extending a preceding example, one can post the message to close the window with:

```cpp
case WM_CLOSE:
{
	// applicable when a window or the application is terminated

	int result = MessageBox(
		hWnd, 
		"Are you sure you want to close?", 
		"WM_CLOSE Message Processor", 
		MB_YESNO | MB_ICONQUESTION
		);

	if (result == IDYES){
		// specfically add WM_DESTROY to the message queue instead
		// of relying on application defaults
		return PostMessage(hWnd, WM_DESTROY, 0, 0);
	} 

	return 0;
} break;
```

An application can be closed on pressing the escape key:

```cpp
if (GetAsyncKeyState(VK_ESCAPE) & 0x8000){
	// escape key pressed, close the application
	SendMessage(hWnd, WM_CLOSE, 0, 0);
}
```

As mentioned, it is possible to send custom values to the window as LPARAM and WPARAM, for example allocating memory, using
the message type `WM_USER`. Defining the `WinProc()` logic with:

```cpp
// macros needed
#define ALLOC_MEM 0
#define DEALLOC_MEM 1

case WM_USER:
{
	switch(wParam){
		case ALLOC_MEM:
		{
			// e.g. allocate memory
		} break;
		case DEALLOC_MEM:
		{
			// e.g. deallocate memory
		} break;
	} break;
}
```

Then send a `WM_USER` message when needed:

```cpp
// recall, third param is wParam, fourth param is lParam
// so here we want to allocate 1000-something of memory
SendMessage(hWnd, WM_USER, ALLOC_MEM, 1000);
```
