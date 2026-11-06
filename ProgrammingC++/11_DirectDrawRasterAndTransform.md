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

Drawing lines on a grid will almost always involve approximations. A line will almost certainly not cross pixels exactly, it may cross two or more, and then comes the questions how or which pixels should be part of the line.

_Rasterisation_ in this context is the process of filling (plotting) pixels from one point to another that most closely fit to the real line. 

![](./MSVC2005/bresenhams_line_drawing_algorithm.jpg)

Taking the equation to a straight line _y = mx + c_ (where _x_ and _y_ are integers), one can draw a line by

1. determining the gradient _m = (y<sub>f</sub> - y<sub>0</sub>)/(<sub>f</sub> - x<sub>0</sub>) 
2. plot the initial point at (x<sub>0</sub>, y<sub>0</sub>)x
3. determine the next value of (x, y) from the gradient _m = (y - y<sub>0</sub>)/(x - x<sub>0</sub>)_
4. repeat until all values of (x, y) until done at (x<sub>f</sub>, y<sub>f</sub>)

The problem with this approach is that the rasterised line will likely contain gaps, particularly if the line is steep.

To get around this, one could simply calculate values of y for smaller changes to x. This however still won't work for very steep gradients. 

Another approach is handled by _Bresenham's algorithm_ which attempts to select a y-value that lies closest to the line. All rasterised points must be integers.

```cpp
int drawLine8bit(
  int x0, int y0, int x1, int y1, UCHAR colour, UCHAR *videoBuffer, int lpitch) {

  int dx,       // difference in x's
      dy,       // difference in y's
      dx2,      // dx * 2, error term, scaled to int
      dy2,      // dy * 2, error term, scaled to int
      xInc,     // amount in pixel space to move during drawing
      yInc,     // amount in pixel space to move during drawing
      error,    // the discriminant i.e. error i.e. decision variable
      index;    // used for looping

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
  }

  // test which direction the line is going in 
  // and then expect y to change by one scan line (pitch)
  if (dy >= 0){
    yInc = lpitch;
  } else {
    yInc = -lpitch;

    dy = -dy;  // need |dy|
  }

  // compute (dx, dy) * 2
  dx2 = dx << 1;
  dy2 = dy << 1;

  // draw the line based on the delta dx or dy
  if (dx > dy){
    // x-dominant line, |m| < 1

    error = dy2 - dx; 

    for (index = 0; index <= dx; index++){
      // plot pixel
      *videoBuffer = colour;

      // test if error has overflowed
      if (error >= 0){
        error -= dx2;

        // move pointer to next line
        videoBuffer += yInc;
      }

      // adjust the error term
      error += dy2;

      // move pointer to the next pixel
      videoBuffer += xInc;
    }
  } else {
    // y-dominant line, |m| > 1

    error = dx2 - dy; 

    for (index=0; index <= dy; index++){
      // plot pixel
      *videoBuffer = colour;

      // test if error overflowed
      if (error >= 0){
        error -= dy2;

        // move to next line
        videoBuffer += xInc;
      }

      // adjust the error term
      error += dx2;

      // move to the next scan line
      videoBuffer += yInc;
    }
  } 

  return(1);
}
```
