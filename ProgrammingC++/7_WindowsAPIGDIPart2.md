---
title: GDI Windows API applications Part 2
nav_order: 7
parent: Programming in C++
---

# GDI Windows API applications Part 2

This article covers more about the GDI, including graphical objects, timing functions and messaging.

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
