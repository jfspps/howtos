---
title: DirectDraw - Rasterisation and 2D Transformations
nav_order: 11
parent: Programming in C++
---

# DirectDraw - Rasterisation and 2D Transformations

This article outlines the topics of rasterisation and 2D transformations:

+ Drawing and clipping lines
+ Drawing wireframe polygons
+ 2D transformations
  - Translations
  - Rotations
  - Scaling
+ Transformations with matrices
  - Translations
  - Scaling
  - Rotations
+ Solid filled polygons
+ Triangulating quadrilaterals
+ Polygon collision detection
+ Timing and synchronisation
+ Scrolling and panning

## Drawing lines

_Rasterisation_ in this context is the process of taking a vector based description of a geometric entity and filling (plotting) pixels from one point to another that most closely fit to the real line. This definition is also extended to other primitives, including triangles (or polygons in general).

Drawing lines on a grid will almost always involve approximations. A line will almost certainly not cross pixels exactly, it may cross two or more, and then comes the questions how or which pixels should be part of the rasterised line.

![](./MSVC2005/bresenhams_line_drawing_algorithm.jpg)

Taking the equation to a straight line _y = mx + c_ (where _x_ and _y_ are integers), one can draw a line by

1. determining the gradient _m = (y<sub>f</sub> - y<sub>0</sub>)/(<sub>f</sub> - x<sub>0</sub>) 
2. plot the initial point at (x<sub>0</sub>, y<sub>0</sub>)x
3. determine the next value of (x, y) from the gradient _m = (y - y<sub>0</sub>)/(x - x<sub>0</sub>)_
4. repeat until all values of (x, y) until done at (x<sub>f</sub>, y<sub>f</sub>)

The problem with this approach is that the rasterised line will likely contain gaps, particularly if the line is steep. To get around this, one could simply calculate values of y for smaller changes to x. This however still won't work for very steep gradients.

The gradient of the line will ultimately determine the approach taken. If the gradient is greater than one then evidently all rows (y) must have one pixel drawn; similarly, if the gradient is less than one then all columns (x) must be assigned a pixel. 

The process of pixel selection can be handled by _Bresenham's algorithm_. This attempts to select a point (on the rasterised line) that lies closest to the true line. All rasterised points discussed here will be integer based.

A _decision term_ `decX` (and `decY`) is applied and constantly updated based on the previously plotted point.

```cpp
// two endpoints at (x0, y0) and (x2, y1)
int drawLine8bit(
  int x0, int y0, int x1, int y1, UCHAR colour, UCHAR *videoBuffer, int lpitch) {

  int dx,         // difference in x's
      dy,         // difference in y's
      dx2,        // equals (dx*2), used to calc. decX
      dy2,        // equals (dy*2), used to calc. decY
      xInc,       // no. of pixels to move along x-axis
      yInc,       // no. of pixels to move along y-axis
      decX,       // the decision variable in x
      decY;       // the decision variable in y

  // pre-compute first pixel address in video buffer
  videoBuffer = videoBuffer + x0 + y0*lpitch;

  dx = x1 - x0;
  dy = y1 - y0;

  // test which direction the line is going in 
  // and then expect x to change by one unit
  if (dx >= 0){
    xInc = 1;
  } else {
    xInc = -1;

    dx = -dx;  // need |dx|
  } else {
    xInc = 0;
  }

  // test which direction the line is going in 
  // and then expect y to change by one scan line (pitch)
  if (dy >= 0){
    yInc = lpitch;
  } else {
    yInc = -lpitch;

    dy = -dy;  // need |dy|
  } else {
    yInc = 0;
  }

  // constants required for the decision terms
  dx2 = dx << 1;
  dy2 = dy << 1;

  // now draw the line based on the gradient
  if (dx > dy){
    // |m| < 1, eventually we will 
    // move one unit along the x-axis;
    // ignore the else block, this will never run
    // in this case

    // initialise, then update decision in y
    for (decY = dy2 - dx; /**/; x += incX, decY += dy2){
      // plot pixel
      *videoBuffer = colour;

      if (x == x1){
        // at an endpoint, leave
        break;
      }

      if (decY >= 0){
        // ready to move pointer to next row (y);
        // bring back decY and test again later
        decY -= dx2;

        videoBuffer += yInc;
      }
    }

  } else {
    // |m| >= 1, eventually we will 
    // move one unit along the y-axis;
    // ignore the if block, that will never run
    // in this case

    // initialise, then update decision in x
    for (decX = dx2 - dy; /**/; y += incY, decX += dx2){
      // plot pixel
      *videoBuffer = colour;

      if (y == y1){
        // at an endpoint, leave
        break;
      }

      if (decX >= 0){
        // ready to move pointer to next column (x);
        // bring back decX and test again later
        decX -= dy2;

        videoBuffer += xInc;
      }
    }
  } 

  return(1);
}
```

It's possible to optimise the above algorithm in a number of ways:

+ ignore functions of lines e.g. `y = x`, `y = constant` or `x = constant`, these do not require Bresenham's algorithm
+ for straight line functions, rasterise up to the midpoint and then copy the line after the midpoint
+ if possible, identify a set of points (parts of the rasterised line) that resemble a constant function (as a _run_) that could be handled without Bresenham's algorithm (this optimisation yields the _Run-Slicing_ algorithm)
+ consider applying the _Symmetric Double-Step_ algorithm: this recognises that for every two points, a line segment can only be composed of one of four 3x3 patterns (below), or a 90 degree rotated version of the pattern. The algorithm looks at the decision (or error) term to decide which pattern to render before continuing along the line and is generally much quicker than Bresenham's algorithm.

![](MSVC2005/symmetric_double_step.png)

## Clipping in 2D

Clipping bitmaps is achieved by overlapping the bitmap's bounding rectangle with the viewport's rectangle. The intersection of both rectangles would be the area to blit.

Clipping lines is (computationally) relatively more difficult to do. Given a clipping rectangle and a line, one will need a clipping filter to identify where the line(s) intersect with the clipping rectangle boundaries.

Overall, the clipping process checks:

a. if a line segment (i.e. both endpoints) lies completely within the clipping rectangle
b. if a line segment lies completely outside the clipping rectangle
c. otherwise perform intersection calculations with one or more clipping boundaries

Before outlining line clipping, we review a few basic mathematical prerequisites.

### Finding the intersection of two lines using point-slope form

![](MSVC2005/line_intersection.png)

Using the point-slope form of the equation to a line:

```
(y - y0) = m*(x - x0)
```

We have the point of intersection (x, y) for lines that have segments `p0` and `p1` with gradients `m0` and `mq` respectively:

```
(y1 - y0) = m0*(x1 - x0)
(y3 - y2) = m1*(x3 - x2)
```

Or for any point along each line with, for example:

```
(y - y0) = m0*(x - x0)
(y - y2) = m1*(x - x2)
```

Solving for a point of intesection at (x, y):

```
x = (-m0/(m1 - m0))*x2 + m0*(y2 - y0) + x0
y = (m0*y0 - m1y2 + x2 - x0)/(m0 - m1)
```

Note from above that if both lines are parallel, then `|m1| = |m0|` and they cannot intersect. The above
equations would yield zero as denominators.

#### Finding the intercept of a line using the general form

Using the general form of the equation to a line:

```
a*x + b*y = c
```

Or for some other value of `c` as:

```
a*x + b*y + c = 0
```

Taking the above point-slope form and equating coefficients `a`, `b` and `c` in terms of the gradients `m`, and an intercept at `x = 0`, we
have:

```
(y - y0) = m*(x - x0)
y - y0 = m*x - mx0
```

Then we have the general form for the line:

```
-m*x + y = y0 - mx0
m*x - y = mx0 - y0
```

Then the intercept is `mx0 - y0`.

#### Finding the intersection of two lines in Matrix form

Two lines in general form can be expressed as a matrix.

```
a1*x + b1*y = c1
a2*x + b2*y = c2
```

The matrix is given by: __Ax__ = __Y__, with __A__:

```
A = |a1 b1|
    |a2 b2|
```

and __x__:

```
x = |x|
    |y|
```

and finally __Y__:

```
Y = |c1|
    |c2|
```

To solve for the intersection at (x, y) one can use determinants:

```
x = Det(A1)/Det(A)
y = Det(A2)/Det(A)
```

The matrices A1 (in y) and A2 (in x) are defined here as:

```
A1 = |c1 b1|
     |c2 b2|

A2 = |a1 c1|
     |a2 c2|
```

The determinant (a scalar) for a 2x2 matrix for e.g. A1 and A2 are

```
Det(A1) = c1*b2 - b1*c2
Det(A2) = a1*c2 - c1*c2
```

Then knowing 

```
Det(A) = a1*b2 - b1*a2
```

Then the solutions are

```
x = (c1*b2 - b1*c2)/(a1*b2 - b1*a2)
y = (a1*c2 - c1*c2)/(a1*b2 - b1*a2)
```
