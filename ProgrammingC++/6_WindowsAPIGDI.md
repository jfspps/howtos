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

The area returned (known to `hdc` above) is not always the entire client area, only some portion of it. If an update 
to the whole of the client area (e.g. for graphics applications and games) was required, then the application code
would instead get a handle to the _graphics device context_ of the window.

Normally, one can get the context with `GetDC()` but must then eventually return the handle back to Windows when 
done, with `ReleaseDC()`:

```cpp
// instead of using BeginPaint and EndPaint

// name as gdc to emphasise graphics device context
// (device contexts are not exclusive to displays)
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
