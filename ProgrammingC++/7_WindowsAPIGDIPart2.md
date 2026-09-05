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

