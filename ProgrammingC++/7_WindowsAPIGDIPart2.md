---
title: GDI Windows API applications Part 2
nav_order: 7
parent: Programming in C++
---

# GDI Windows API applications Part 2

This article covers more about the GDI, including graphical objects, timing functions, sending messages to controls and getting system information.

## GDI objects

GDI objects take care of drawing functions in relation to some visual output, to a screen or a document.
These include pens and brushes. 

The GDI only uses one object of each type at a time, though an application can have multiple objects prepared. That is, 
pens and brushes must always be _selected_. It is also necessary to at times to delete objects, since there are only
a fixed number of objects that can be prepared at any given time.

The GDI provides a limited number of stock objects, which are realised through a function with prototype `HGDIOBJ GetStockObject(int anObject)`.

### Pens

Pens draw lines. The handle to a pen is managed by `HPEN`:

```cpp
HPEN pen1 = NULL;

// build a Pen from one of the stock objects
pen1 = GetStockObject(WHITE_PEN);
```

The parameters to `GetStockObject()` are stock object types for pens, brushes and other objects e.g. `WHITE_PEN`, `GRAY_BRUSH`, `ANSI_VAR_FONT`.

To create a custom pen, use something of the form:

```cpp
// parameters: line style, pen width (pixels) and colour
HPEN greenPen = CreatePen(PS_DASH, 1, RGB(0,255,0));
```

As mentioned, one must select GDI objects before drawing anything:

```cpp
// assume gdc (HDC object) is valid

HPEN greenPen = CreatePen(PS_DASH, 1, RGB(0,255,0));

HPEN oldPen = NULL;

// get a copy of the previous object (a pen) before selecting
// a new object (the green pen)
oldPen = SelectObject(gdc, greenPen);

// start drawing with the green pen...

// get back to the old pen
SelectObject(gdc, oldPen);

// safe to delete the green pen
DeleteObject(greenPen);
```

### Brushes

Brushes fill graphical objects. Much of the GDI formulation for pens applies to brushes. Brushes are created from stock objects or 
customised, then selected and eventully deleted.

The handle required is `HBRUSH`:

```cpp
// assume gdc (HDC object) is valid

HBRUSH greyBrush = GetStockObject(LTGRAY_BRUSH);

// to create a solid (green) brush (note, styling not required):
HBRUSH solidBrush = CreateSolidBrush(RGB(0,255,0));

// to create a (red) hatched brush (with styling):
HBRUSH hatchBrush = CreateHatchBrush(HS_CROSS, RGB(0,255,0));

// HBRUSH oldBrush = NULL;

// select brushes
oldBrush = SelectObject(gdc, solidBrush);

// start drawing with the solid brush then change to the
// hatched brush

SelectObject(gdc, hatchBrush);

// start drawing with the hatched brush, then done

SelectObject(gdc, oldBrush);

if (DeleteObject(solidBrush) && DeleteObject(hatchBrush)){
    // confirmed both brushes deleted
}
```

## Points, lines and polygons

### Points

Points are simplest graphical object and do not require a pen to draw, since points are one pixel objects.

Recall that RGB colour modes do not support every possible red, blue and green combination, and instead are based on
a limited number of combinations (to fit the bit mode selected). As such, the colour requested is often not the colour 
drawn, hence GDI values (`COLORREF`) returned are the _actual_ colour drawn.

```cpp
COLORREF colourDrawn = SetPixel(
    hdc,
    200, 
    300,
    RGB(0,0,255)
);
```

### The default GDI coordinate system `MM_TEXT`

The default coordinate system `MM_TEXT` for GDI applications is an inverted Cartesian coordinate system,
placing increasing x-values from left-to-right, and increases y-values from top-to-bottom. Units are pixels.

Recall, there are screen coordinates (relative to the top-left of the screen) and 
client coordinates (relative to the top-left of the window).

There are other mapping modes (see [MM_LOENGLISH](3_MFCApplications.md#mapping-modes)) but `MM_TEXT` is generally
used for GDI (and DirectX) applications.

Points in a coordinate system can be stored by a structure `POINT`, which has the following definition:

```cpp
struct tagPOINT{
    LONG x;
    LONG y;
} POINT;
```

### Lines

Lines represent a series of points from an origin to a destination. More complex line drawing operations lead to
the drawing of polygons.

Line drawing is managed by `MoveToEx()` and `LineTo()`. Each call to `MoveToEx()` presents developers with the opportunity
to record the last point.

```cpp
// assume HDC object gdc is valid

// set the current position, 
// ignoring the last position (null fourth param)
MoveToEx(gdc, 10, 10, NULL);

// then move to the new MM_TEXT coords
LineTo(gdc, 50, 60);
```

To record the coordinates:

```cpp
// assume HDC object gdc is valid

// see POINT struct above
POINT lastPosition;

// initialises lastPosition with the last position
// before setting the new position at (10, 10)
MoveToEx(gdc, 10, 10, &lastPosition);
```

To demonstrate a complete line drawing example:

```cpp
// assume HWND object hWnd is valid from WinProc()

HDC gdc = GetDC(hWnd);

HPEN greenPen = CreatePen(PS_SOLID, 1, RGB(0, 255, 0));
HPEN oldPen = SelectObject(gdc, greenPen);

// don't need the last position on init
MoveToEx(gdc, 10, 10, NULL);
LineTo(gdc, 50, 60);

// restore the old pen
SelectObject(gdc, oldPen);

DeleteObject(greenPen);
ReleaseDC(hWnd, gdc);
```

Triangles can be drawn from a sequence of lines. Rectangles too can be drawn but this
is already made available with standard methods (next).

### Rectangles

This quite often involves both pens (for the outline) and brushes (for the interior).

To draw a rectangle, use the `Rectangle()` function. In particular this draws a _bounding rectangle_ with an
outline pen width of one pixel with a solid line. Everything (including the outline) 
is fit or bound to the coordinates given. (The _enclosing rectangle_ is the area inside the outline,
a bounding rectangle of dimensions {0, 0, 2, 2} would have a zero enclosing rectangle.)

```cpp
// assume the HDC gdc is valid

// define the pen and brush
HPEN pen = CreatePen(PS_SOLID, 1, RGB(0, 0, 255));
HBRUSH brush = CreateSolidBrush(RGB(255, 0, 0));

// select both objects
SelectObject(pen);
SelectObject(brush);

Rectangle(gdc, 10, 10, 20, 20);
```

It is also possible to use a `RECT` structure to define the rectangle and then 

+ call `FillRect()` to draw a filled rectangle without a border
+ call `FrameRect()` to draw a hollow rectangle

```cpp
// assume the HDC gdc is valid

RECT rect {10, 10, 20, 20};

// filled rectangle without a border
FillRect(gdc, &rect, CreateSolidBrush(RGB(255, 0, 0)));

// hollow rectangle
FrameRect(gdc, &rect, CreateSolidBrush(RGB(255, 0, 0)));
```

### Circles and ellipses

The GDI draws circles and ellipses by first defining the bounding rectangle (for an ellipse)
or bounding square (for a circle) before drawing the ellipse or circle.

For an ellipse or circle, use `Ellipse()`:

```cpp
// assume the HDC gdc is valid

// major axis 20 and minor axis 15
Ellipse(gdc, 0, 0, 20, 15);

// for a circle e.g.
Ellipse(gdc, 20, 20, 40, 40);
```

### Polygons

GDI polygons are objects drawn from an array of `POINT` instances (as vertices), using the `Polygon()` function:

```cpp
// assume the HDC gdc is valid

// for example
POINT onePt {3, 5};

// more POINTs...

POINT polygon[7] = {
    onePt,
    twoPt,
    threePt,
    fourPt,
    fivePt,
    sixPt,
    sevenPt
};

Polygon(gdc, polygon, 7);
```

## Timer messaging

PCs have an built-in hardware timer that Windows abstracts as an almost infinite number of timers. One
can set a timer with `SetTimer()`:

```cpp
#define TIMER_1SEC_ID 1
#define TIMER_3SEC_ID 3

// assume we have HWND hWnd

SetTimer(hWnd, TIMER_1SEC, 1000, NULL);
```

The above function will send a message `WM_TIMER` to `WinProc()`, which from there one can execute
code at intervals defined by the timer.

Looking more closely at the `SetTimer()` prototype:

```cpp
UNIT SetTimer(
    // handle to the parent window
    HWND hWnd,
    // timer ID (each WM_TIMER message will get this)
    UINT nIDevent,
    // time to delay in milliseconds
    UNIT nElapse,
    // callback function (optional)
    TIMERPROC lpTimerFunc
);
```

The callback function is a function that is called at the same time the message is 
sent to `WinProc()` so in effect it is possible to invoke logic via `WinProc()` and
the callback function. Generally, the parameter is NULL.

The timer ID is captured by `WinProc()` `wParam` parameter:

```cpp
#define TIMER_1SEC_ID 1
#define TIMER_3SEC_ID 3

// in WinProc switch block...
case WM_TIMER:
{
    switch (wParam)
    {
        case TIMER_1SEC_ID:
        {
            // do stuff when this timer 
            // fires
        } break;

        case TIMER_3SEC_ID:
        {
            // do other stuff
        } break;

        default: break;
    }

    // timer message handled
    return 0;
} break;

case WM_DESTROY:
{
    // release timer resources
    KillTimer(hWnd, TIMER_1SEC_ID);
    KillTimer(hWnd, TIMER_3SEC_ID);

    PostQuiteMessage(0);
} break;
```

Such timers are only accurate to about +/- 10 milliseconds. For more
accurate timers, one should use Win32 high-performance timers (next) or resort
to hardware counters accessible through Assembly.

### Locking in operations frequency (e.g. framerate)

Alternatives to timers (when accuracy is required) include calculation of
timer elapsed through Win32 `GetTickCount()`. This method can be used to 
calculate the time elapsed accurately by invocation at different points 
of a code block:

```cpp
while (!someCondition){
    DWORD startTime = GetTickClock();

    // do logic

    // run an repeated loop until 33 milliseconds as passed
    while ((GetTickCount() - startTime) < 33);

    // logic that goes here is delayed by 33 milliseconds

    if (conditionMet){
        someCondition = true;
    }

    // go back and rerun logic and wait until 33 milliseconds
    // have elapsed
}
```

The above code runs separate logic at 33 millisecond intervals, or 30 operations
(or frames) per second. This forces synchronicity.

If a delay is all that is required (as opposed to synchronisation), then
one can call `Sleep(33);` instead.

## Sending user input via controls

User input via events (e.g. pushing buttons) will normally send a `WM_COMMAND` message to `WinProc()`.

The next section focuses on push buttons but many of the ideas re. messaging via controls applies to 
other controls (e.g. edit boxes, list boxes, scroll bars, checkboxes and radio buttons).

Before continuing, we recall the process to define a new child window. Note that while an application
can have a `HWND` initialised multiple times, all windows go thorough the same `WinProc()` message handling 
function. Also note we are using `CreateWindowEx()` instead of `CreateWindow()`. Both are basically the same,
the former is more up to date and introduces one additional style paramter.

```cpp
if (!(hWnd = CreateWindowEx(/*params for first window*/)))
  return 0;

// create a second child window
if (!(hWnd = 
    CreateWindowEx(
        NULL, // additional (extended), optional style param
        "button", // class
        "Push here", // text on button
        WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON,
        10, // initial x
        10, // initial y
        100, // initial width
        24, // initial height
        mainWindowhandle, // handle to parent
        (HMENU)(100), // ID of button
        hInstance,
        NULL
    ))
    )
  return 0;
```

The child window will have a push button with the caption "Push here", which when pushed will send 
a `WM_COMMAND` message to `WinProc()`.

The child window ID is stored in the `LOWORD(wParam)` of `WinProc()`, and likewise, `lParam` for the child window handle
and finally `HIWORD(wParam)` for the _notification code_ (what happened to the control: the push button, e.g. `BN_CLICKED`, `BN_PAINT`).

```cpp
// inside WinProc()
case WM_COMMAND:
{
    // see (HMENU)(100) for the ID of the button
    if (LOWORD(wParam) == 100)
    {
        // control with ID 100 pressed, do stuff...
    }

    return 0;
} break;
```

### Sending messages to child controls

It is often necessary to [send messages](6_WindowsAPIGDIPart1.md#sending-and-posting-messages-manually) 
to the control itself (which is also part of a child window)
after the user performed an action. For example, when a button is pressed, the button control needs 
to get updated to look like it was clicked.

This can be achieved by calling `SendMessage()`. The prototype is:

```cpp
SendMessage(
    HWND hWnd, 
    UINT msg,
    WPARAM wParam, 
    LPARAM lParam);
```

+ Making a button looked pressed: 
  - ```SendMessage(hwndButton, BM_CLICK, 0, 0);```
+ Set (or unset) a check on a checkbox option:  
  - ```SendMessage(hwndButton, BM_SETCHECK, BST_CHECKED, 0);```
  - The `wParam` expected: `BST_CHECKED`, `BST_INDETERMINATE`, `BST_UNCHECKED`
+ Get the state of a button check:
  - ```someState = SendMessage(hwndButton, BM_GETCHECK, 0, 0);```
  - `someState` would be one of `BST_CHECKED`, `BST_INDETERMINATE`, `BST_UNCHECKED`
+ Highlight a button selected by the user:
  - ```SendMessage(hwndButton, BM_SETSTATE, 1, 0);```
  - The `wParam` expected: 1 for true or 0 for false
+ Get the general state of a button:
  - ```someState = SendMessage(hwndButton, BM_GETSTATE, 0, 0);```
  - `someState` would be one of `BST_CHECKED`, `BST_FOCUS`, 
  `BST_INDETERMINATE`, `BST_PUSHED`, `BST_UNCHECKED`

## Getting system information to initialise an application

Some applications will have to be loaded according to the system hardware and operating system used. 

+ Determine the system properties with e.g. `GetSystemInfo()`. This would show several properties, including 
page size, number of processors, processor type (e.g. 486 vs Pentium).
+ Determine the system metrics for example:
  - how the system was booted
  - mouse is 
    + installed or not 
    + the number of mouse buttons
    + a mouse-wheel is available
    + handedness of the mouse (i.e. swapped left and right buttons)
  - dimensions of various elements
    + cursors
    + windows (in various states) and window borders
    + valid double-click regions
    + fullscreen window size
    + icons
    + the screen
    + small caption buttons
    + single-line menu bar
  - whether a DEBUG version of the application is installed
  - alignment of drop-down menus
  - languages in use
  - a network is available
  - whether an application should give visual prompts (instead of audio prompts)

For examples, an application can be made to occupy the entire screen space with `GetSystemMetrics()` calls in `CreateWindowEx()` (and `CreateWindow()`):

```cpp
CreateWindowEx(
        NULL, // additional (extended), optional style param
        "button", // class
        "Push here", // text on button
        WS_POPUP | WS_VISIBLE,
        0, // initial x
        0, // initial y
        GetSystemMetrics(SM_CXSCREEN), // initial width
        GetSystemMetrics(SM_CYSCREEN), // initial height
        mainWindowhandle, // handle to parent
        (HMENU)(100), // ID of button
        hInstance,
        NULL
    )
```

The `WS_POPUP` is needed to create a window without any borders or controls. In combination with calls
to `GetSystemMetric()`, this results in a full-screen application.

### Getting text metrics

It may prove useful to use `GetTextMetrics()` at the application level (in much the same way as `GetSystemMetrics()` is 
based on the system level) when attempting to render text appropriate for whatever font is in use.

For exampe, centering text for the font currently used:

```cpp
// in WinMain...
TEXTMETRIC tm;

char textMsg[] = "Centre this text";
char *pTextMsg = &textMsg[0];

// hdc relates to one of potentially many handles (to device
// contexts) for each font "objects" selected
GetTextMetrics(hdc, &tm);

int windowCentrePos = windowWidth - ((strlen(pTextMsg)*tm.tmAveCharWidth)/2);

TextOut(
    hdc,
    windowCentrePos, // x-coord
    0, // y-coord
    pTextMsg,
    strlen(pTextMsg)
);
```
