---
title: GDI Windows API applications
nav_order: 6
parent: Programming in C++
---

# GDI Windows API applications

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
_window coordinates_ are always relative to the screen.

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
