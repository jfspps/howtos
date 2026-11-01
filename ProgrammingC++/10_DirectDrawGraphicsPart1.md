---
title: DirectDraw Graphics Part 1
nav_order: 10
parent: Programming in C++
---

# DirectDraw Graphics Part 1

This article extends the DirectDraw setup and foundation from [the previous section](9_DirectDraw.md), covering topics such as:

+ High-colour modes
+ Double buffering and page flipping
+ The _blitter_ (part of the microprocesser that transfer and modifies data in memory, for the CPU)
+ Clipping
+ Bitmaps
+ Colour animation
+ Working with windowed DirectX applications

## High-colour modes

8-bit colour mode applications are good starting points when learning the fundamentals, and with much older hardware 
and/or software-based rasterisers (e.g. the [DirectX9 2D engine](https://github.com/jfspps/DirectX2DEngine)) are
all that is available. 

Working with higher colour modes places more demands because of:

+ increased computational requirements: working with an 8-bit palette can be acccomplished by a per-pixel basis, while 16-bit and 24-bit colour modes will require more sophisticated and consequently slower conversions or very large lookup tables
+ increased GPU memory bandwidth requirements: only new AGP (accelerated graphics port) or PCI-E (peripheral component interconnect) _express_ interfaces can sufficiently handle high-colour modes appreciably

### 16-bit colour modes

The actual colour mode available is decided by the hardware manufacturer. DirectX provides functions that enable an application to query the colour modes on offer.

Some examples of 16-bit colour modes include:

+ __Alpha.5.5.5__ - this can visualised as three 5-bit blocks for red, green and blue colours, with the 16th bit dedicated to the _alpha_ component (for image transparency). Each block can store a value up to 2<sup>5</sup> i.e. 32 values or shades of a given colour. This results in a palette matrix of 32x32x32 i.e. 32,768 colours.
+ __X.5.5.5__ - this is similar to Alpha.5.5.5 except the transparency bit (the MSB, or most significant bit, see below excursion) is not used/is ignored.
+ __5.6.5__ - the most common 16-bit colour mode, with a 5-bit block for red and blue, and a 6-bit block for green (human eyes are more sensitive to green, so it was decided to add more range to the green spectrum). Overall that's 32x64x32 or 65,536 colours.

#### Little endian and big endian ordering

A little excursion about how memory is ordered at the bit level.

A _word_ is a fixed size/length block in memory that represents a unique operand, the dimensions of which are CPU dependent.

A colour word, in this article series, represents the block of memory that stores the red, green and blue shades for a given pixel. For 16-bit colour words (used for 16-bit colour modes) the 0th bit is known as the _least significant bit_ (LSB) and the 15th bit is known as the _most significant bit_ (MSB).

![](./MSVC2005/little_big_endian.png)

When a word is ordered ("filled", if preferred) from the LSB first (as PCs do), the word adopts a __little endian__ format. RGB colour words are organised such that red occupies the higher-order bits (e.g. the 10th to the 15th bits), with blue occupying the lower-order bits, and green somewhere in between. When assigning values red then green then blue in code, it is necessary to order (initialise) the word starting from the MSB. As such colour words adopt a __big-endian__ format.

#### Building the colour word

With the above in mind, the following macros can be used to build colour words (as 2-byte `USHORT`) after passing 4-byte `int` for each red, green and blue parameter:

```cpp
// Alpha.5.5.5, returns a 16-bit USHORT; the parameters are typically 32-bit int
#define _RGB16BIT555(r, g, b) (((r & 31) << 10) + ((g & 31) << 5) + (b & 31))
```

The blue (int) colour is masked so as to fit within the first 31 (2<sup>5</sup> - 1) values (the first five bits), the green colour is masked similarly but with an additional left-shift of 5 bits (equivalent to multipling the green shade by 2<sup>5</sup>), and finally the red colour is masked and left-shifted by 10 bits.

#### Getting the pixel format

The RGB encoding available (the _pixel format_) is hardware dependent and therefore must be known by the application prior to rendering. One can deduce the pixel format with `IDIRECTDRAWSURFACE7::GetPixelFormat()`:

```cpp
HRESULT GetPixelFormat(LPDDPIXELFORMAT lpDDPixelFormat);
```

The sole parameter `LPDDPIXELFORMAT` is a pointer to `DDPIXELFORMAT` which is updated by `GetPixelFormat()` with information about the pixel format. One then queries the parameter (assuming the call hasn't failed) to determine the pixel format.

Assuming that the DirectDraw primary surface (`lpdds_primary`) has already by initialised:

```cpp
// assume this was initialised
LPDIRECTDRAWSURFACE7 lpdds_primary;

// this will store the pixel format
DDPIXELFORMAT ddPixel;

// memset to fill memory block with zeros, to prep ddPixel
memset(&ddPixel, 0, sizeof(ddPixel));
ddPixel.dwSize = sizeof(ddPixel);

lpdds_primary->GetPixelFormat(&ddPixel);

// now check the valid flags to determine the pixel format
if (ddPixel.dwFlags & DDPF_RGB){

	// DDPF_RGB indicates that the surface is an RGB mode 
	// and can be queried via dwRGBBitCount

	switch(ddPixel.dwRGBBitCount)
	{
		case 15: {
			// 5.5.5 mode in use; can use the _RGB16BIT555 macro
		} break;
		case 16: {
			// 5.6.5 mode in use
		} break;
		case 24: {
			// 8.8.8 mode in use
		} break;
		case 32: {
			// alpha(8).8.8.8 mode in use
		} break;

		default: break;
	}
} else {
	if (ddPixel.dwFlags & DDPF_PALETTEINDEXED8){
		// DDPF_PALETTEINDEXED8 indicates 256 (8-bit) colour palettised mode
	} else {
		// something other pixel format...
	}
}
```

So far, we need four variables/pointers to store:

+ DirectDraw7 interface pointer (`LPDIRECTDRAW7`)
+ DirectDraw surface description (`DDSURFACEDESC2`)
+ DirectDraw primary surface pointer (`LPDIRECTDRAWSURFACE7`)
+ Pixel format/RGB encoding provided (`DDPIXELFORMAT`)

### Plotting pixels in 16-bit

The [previous section](./9_DirectDraw.md#how-pixels-are-plotted) covered pixel plotting in some detail in 8-bit. In this section, we cover plotting pixels in 16-bit, i.e. without the need for a palette and instead referring to the pixel format of the hardware.

Like 8-bit colour modes, we still need to lock (and unlock) the video buffer. In general, one should minimise the number of times a buffer is locked and then unlocked: locking and unlocking buffers is expensive.

```cpp
// builds a 16-bit colour value in 5.6.5 format (green dominant);
// note the green spectrum is 6 bits so covers (2^6 - 1) or 63 values
#define _RGB16BIT565(r, g, b) (((r & 31) << 11) + ((g & 63) << 5) + (b & 31))


// locking is handled outside this function so that we don't lock/unlock on a
// per pixel basis 
inline void plotPixel16(
	int x, int y,
	int red, int green, int blue,
	USHORT *videoBuffer, int lPitch)
	{
		USHORT pixel = _RGB16BIT565(red, green, blue);

		// write the data;
		// recall lPitch is the memory width in bytes (8-bit blocks);
		// we adjust to a 16-bit block with a right-shift 
		videoBuffer[x + y*(lPitch >> 1)] = pixel;
	}
```

In general, it is preferable to lock the buffer and draw all that is required before unlocking the buffer. The following shows this in action, and would be applied during a game loop:

#### 24-bit and 32-bit colour modes

24-bit colour modes use three 8-bit (on byte) per channel. An byte can hold up to 2<sup>8</sup> or 256 values, and hence across the RGB mode, there are 256x256x256 = 16.7 million colours. The red, green and blue channels are equally distributed, unlike 16-bit 5.6.5 mode, which is green heavy.

Since 24-bits is made up of three 8-bit blocks, the x- address for each colour word is located every three bytes. Within a colour word, the ordering from the low byte is still blue, then green, and then (the high byte) red.

![](./MSVC2005/24_bit_addressing.png)

The video buffer elements are of type `DWORD` (a 32-bit unsigned int). As shown above, the blue channel of pixel (0,0) resides in memory at 0, the green channel is one 32-bit int above this, and finally red is another above.

Plotting pixels in 24-bit mode involves setting the colour word with each colour channel in step, rather than apply bitwise operations as e.g. 16-bit macro that yield the entire colour word:

```cpp
// again, assume buffer locking and unlocking is handled outside this function;
// recall UCHAR is an unsigned 8-bit int
inline void plotPixel24(
	int x, int y,
	int red, int green, int blue,
	UCHAR *videoBuffer, int lPitch){
		// DWORD 32-bit unsigned int as the address of the colour 
		// for the pixel (x, y)
		DWORD pixelAddress = (x + x + x) + (y * lPitch);

		// no bit fiddling here, simply set the colours in the 
		// buffer in the order B then G then R 
		videoBuffer[pixelAddress] = blue;
		videoBuffer[pixelAddress + 1] = green;
		videoBuffer[pixelAddress + 2] = red;
	}
```

An equivalent macro that sets the colour word would be:

```cpp
#define _RGB24BIT(r, g, b) (b + (g << 8) + (r << 16))
```

32-bit colour modes follow in that the blue channel resides in the low byte and each channel occupies 8-bits.

+ __Alpha(8).8.8.8__ - the high byte represents the alpha channel (usually for transparency but also for
other purposes). Being a 32-bit word, this fits entirely within 32-bit CPU registers.
+ __X(8).8.8__ - this is similar to Alpha(8).8.8.8 but the alpha channel is not used at all.

It may seem as though 32-bit colours modes are redundant given that they don't perform much more than 24-bit. Both
support about 16.7 million colours. The situation is some GPUs do not support or address three-byte words and require a fourth byte to align words correctly. Hence, DirectX applications sometimes ignore 24-bit modes altogether and go with 
32-bit colour modes without offering 24-bit colour modes.

We can extend the 16-bit pixel plotting function to suit 32-bit colours modes:

```cpp
// builds a 32-bit colour value as a WORD
#define _RGB32BIT(alpha, r, g, b) (b + (g << 8) + (r << 16) + (alpha << 24))

// (32-bit) DWORD pitch
int lPitch32 = lPitch >> 2; 

// locking is handled outside this function so that we don't lock/unlock on a
// per pixel basis 
inline void plotPixel132(
	int x, int y,
	int alpha, int red, int green, int blue,
	UINT *videoBuffer, int lPitch32)
	{
		// UINT is a 32-bit unsigned int
		UINT pixel = _RGB32BIT(alpha, red, green, blue);

		// write the data;
		// lPitch is in 4 byte (32-bit) blocks
		videoBuffer[x + y*(lPitch32)] = pixel;
	}
```

## Double buffering and page flipping

Drawing to an offscreen surface allows applications to hide surface operations (removing elements, updating pixel colours etc.) from viewers. 

The process of drawing to an offscreen area and then copying it to a surface is known as _double buffering_.

A similar operation, known as _page flipping_. This is where the application draws to one of e.g. two visible areas (surfaces) before directing the hardware to display to newly drawn surface. Instead of copying an image to a surface, the hardware points to a different portion of memory.

### Implementing double buffering

In short, one allocates a portion of memory for the offscreen area with the same resolution as the primary surface, fills the buffer with the next scene, before copying it to the primary surface.

Copying the data is somewhat involved, in that the memory stride (pitch) of the primary surface determines which C++ operations are required.

If the stride equals the horizontal resolution (i.e. there are no extraneous elements to the memory row) then one can call `memcpy()` e.g.:

```cpp
// UCHAR is an unsigned 8-bit int
UCHAR * primaryBuffer;
// ...assume the primary buffer is already initialised

UCHAR * doubleBuffer = new UCHAR[640*480];
// ...assume the double buffer is filled later...
// e.g. doubleBuffer[x + (640*y)] = someColour

// the last parameter of memcpy() is the number of bytes to copy 
// (from doubleBuffer to primaryBuffer)
memcpy((void *) primaryBuffer, (void *) doubleBuffer, 640*480); 
```

If the stride is greater than the horizontal resolution, then one needs to skip the extraneous elements by advancing a pointer:

```cpp
// UCHAR is an unsigned 8-bit int
UCHAR * primaryBuffer;
// ...assume the primary buffer is already initialised

UCHAR * doubleBuffer = new UCHAR[640*480];
// ...assume the double buffer is filled later...
// e.g. doubleBuffer[x + (640*y)] = someColour

for (int y = 0; y < 480; y++){
	
	// copy the first 640 bytes (each pixel is one byte or 8-bits)
	memcpy((void *) primaryBuffer, (void *) doubleBuffer, 640);

	// memPitch is in number of bytes;
	// advance the primary surface buffer by memPitch bytes
	primaryBuffer += memPitch;

	// get ready for the next line of pixels
	doubleBuffer += 640;
}
```

### Complex surfaces

Surfaces can be described as _primary surfaces_ or _secondary surfaces_. Secondary surfaces are part of an animation chain that have the same resolution and colour depth as the primary surface. One can utilise page flipping to point the primary display to the next secondary surface.

Each offscreen surface (secondary surface) is a _back buffer_, and usually occupies the GPU VRAM. Page flipping in such cases is generally much faster than copying data between surfaces, though the number of back buffers is limited by the resolution requested and the amount of VRAM available.

For 8-bit colour depth, an `m*n` resolution will require `m*n` bytes per surface. A more common application which requires 16-bit colour depth with double buffering (i.e. one back buffer) will require `2*2*m*n` bytes of VRAM (e.g. 640x480 at 16-bit with double buffering is 1,228,800 bytes, roughly 1.2 MB; likewise 2560x1440 at 32-bit colour depth with double buffering requires 7,372,800 bytes).

Creating a back buffer and relating it to the primary surface (in preparation for page flipping) is carried out in DirectX by creating a _complex surface_. Reviewing the procedure set out [here](./9_DirectDraw.md#b-building-a-display-surface)

```cpp
// assume the DirectDraw interface pointer lpdd7 has been initialised

// pointer to the PRIMARY surface interface
LPDIRECTDRAWSURFACE7 lpddsprimary = NULL;

// pointer to A BACK BUFFER interface
LPDIRECTDRAWSURFACE7 lpddsBack = NULL;

// the surface description
DDSURFACEDESC2 ddsd;

// a general recommendation to clear (really fill with zeros) and prep ddsd
// with memset()
memset(&ddsd, 0, sizeof(ddsd));

// start initialising the structure's fields
ddsd.dwSize = sizeof(ddsd);

// the application can expect valid surface settings: 
// ddsCaps (for DirectDraw) and a back buffer count (one in this case)
ddsd.dwFlags = DDSD_CAPS | DDSD_BACKBUFFERCOUNT;

// now set the capabilities of the chosen field(s)

// set the back buffer count
ddsd.dwBackBufferCount = 1;

// set up for a complex, flippable surface
ddsd.ddsCaps.dwCaps = DDSCAPS_PRIMARYSURFACE | DDSCAPS_COMPLEX | DDSCAPS_FLIP;

// now create the primary surface, and initialise lpddsprimary
if (FAILED(lpdd7->CreateSurface(&ddsd, &lpddsprimary, NULL))){
    // failed to build the primary surface, clean up and exit
}

// get ready to request the back buffer
ddsd.ddsCaps.dwCaps = DDSCAPS_BACKBUFFER;

// now request the attached back buffer
if (FAILED(lpddsprimary->GetAttachedSurface(&ddsd.ddsCaps, &lpddsBack))){
	return (0);
}

// okay, now establised with the primary lpddsprimary
// and secondary surface lpddsBack...
```

To draw to the back buffer, simply lock the surface, draw to it then unlock it. The flip the page...this is decribed next.

### Page flipping

Despite first appearances, a page-flipping mechanism does not change the definition of primary or secondary surfaces. A back buffer is _always_ offscreen, with the primary surface _always_ onscreen. That is, even though the pointer to a surface is updated during page flipping, the back buffer does not _become_ the primary surface, and neither does the primary surface become a back buffer.

To flip the primary surface use `Flip()` (one does not flip a back buffer), the signature is given below:

```cpp
HRESULT Flip(LPDIRECTDRAWSURFACE7 lpDDSurfaceTargetOverride, DWORD dwFlags);
```

The first parameter is advanced and passing NULL is normally fine. The second parameter is one of the following control flag:

+ DDLIP_INTERVAL2 - flip after two retraces (vertical sync)
+ DDLIP_INTERVAL3 - flip after three retraces
+ DDLIP_INTERVAL4 - flip after four retraces
+ DDFLIP_NOVSYNC - flip as close as possible to the next (monitor) scan line
+ DDFLIP_WAIT - wait until a flip is possible (commonly used control flag)

The first three flags indicate how many vertical retraces to wait between each flip (defaults to one), and are only
valid if `DDSCAPS2_FLIPINTERVAL` is declared by the `ddsd` surface description.

Both the back buffer and primary surface must be unlocked before the primary surface is flipped.

```cpp
// this approach allows for repeated attempts
while(FAILED(lpddsprimary->Flip(NULL,  DDFLIP_WAIT)));
```

### The blitter (bit block transfers)

From a basic standpoint, drawing a bitmap to a surface involves can involve copying each pixel. 
For example, an 8x8 256-colour (8-bit) bitmap can be copied to a 640*480 surface at position (x,y) by the blitter as follows:

```cpp
UCHAR *videoBuffer;
// assume this is initialised with an 8x8 image
UCHAR *bitmap;

int x;
int y;

// for each row of the bitmap
for (int bmY = 0; bmY < 8; bmY++){ 

	// for each pixel along a row
	for (int bmX = 0; bmX < 8; bmX++){
		// pitch is 640 pixels; the origin (top-left) of the bitmap is at (x,y) on the surface
		// and fills the surface to the right and below relative to this
		videoBuffer[(x + bmX) + (y + bmY)*640] = bitmap[bmX + (bmY*8)];
	}
}
```

The above code will copy everything over, including pixels that should be ignored i.e. transparent pixels (value of 0).

The above can be optimised to remove some of the addition and multiplication operators (in favour of bitwise operators) 
and ignore transparent pixels, with:

```cpp
UCHAR *videoBuffer;
// assume this is initialised with an 8x8 image
UCHAR *bitmap;

int x;
int y;

// get the starting point on the surface
// i.e. videoBuffer += (x + (y)*640)
videoBuffer += (x + (y << 9) + (y << 7));

// used to read/write pixels
UCHAR currentPixel;

for (int bmY = 0; bmY < 8; bmY++){ 

	// for each pixel along a row
	for (int bmX = 0; bmX < 8; bmX++){
		if (currentPixel = bitmap[bmX]){
			// currentPixel > 0, not transparent
			videoBuffer[bmX] = currentPixel;
		}
	}

	bitmap += 8; // next row
	videoBuffer += 640; // next line
}
```

The hardware blitter frees up the processor to work on other aspects.

DirectDraw provides two bitting methods, `IDIRECTDRAWSURFACE7::Blt()` and ``IDIRECTDRAWSURFACE7::BltFast()`. The former is more comprehensive, supporting additional features such as clipping, while the latter is simpler and consequently faster in simpler contexts.

```cpp
HRESULT Blt(
	LPRECT lpDestRect,
	LPDIRECTDRAWSURFACE7 lpDDSrcSurface,
	LPRECT lpSrcRect,
	DWORD dwFlags,
	LPDDBLTFX lpDDBltFx
)
```

+ `LPRECT lpDestRect` - the rectangle (portion of destination surface) to blit to (if NULL then blit to the entire surface)
+ `LPDIRECTDRAWSURFACE7 lpDDSrcSurface` - the address to the source surface
+ `LPRECT lpSrcRect` - the rectangle (portion of source surface) to blit from (if NULL then blit from the entire surface)
+ `DWORD dwFlags` - defines blitting behaviour or operations, e.g. scaling, rotation
+ `LPDDBLTFX lpDDBltFx` - an extensive structure detailing blitting properties e.g. special effects, what operations are supported

As mentioned, `BltFast()` is simpler:

```cpp
HRESULT BltFast(
	DWORD dwX,
	DWORD dwY
	LPDIRECTDRAWSURFACE7 lpDDSrcSurface,
	LPRECT lpSrcRect,
	DWORD dwTrans
)
```

The parameters `dwX` and `dwY` represent the x and y coordinates to blit to (on the destination surface). The last parameter `dwTrans` defines the type of blitter operation e.g. whether to adopt the source or destinations colour key 
(which colours should be treated as transparent), or just copy with no transparency.

#### Filling a surface with a colour with the blitter

To fill a region of an 8-bit colour surface:

```cpp
DDBLTFX ddBltFx;
RECT destRect;

// initialise the FX structure
memset(&ddBltFx, 0, sizeof(ddBltFx));
ddBltFx.dwSize = sizeof(ddBltFx);

// for 8-bit mode only e.g. colourIndex some value 0-255
// (actual colour is palette dependent);
// for higher modes e.g. for 16-bit mode green use
// ddBltFx.dwFillColor = __RGB16BIT565(0, 255, 0);
ddBltFx.dwFillColor = colourIndex;

// upper-left inclusive, these pixels are included
destRect.left = x1;
destRect.top = y1;

// lower-right exclusive, these pixels are a boundary,
// so really (x2 - 1) and (y2 - 1) are the lower right pixels
// included
destRect.right = x2;
destRect.bottom = y2;

lpddsPrimary->Blt(
	destRect,
	NULL,
	NULL,
	DDBLT_COLORFILL | DDBLT_WAIT,
	&ddBltFx
);
```

The `dwFlags` `DDBLT_COLORFILL` and `DDBLT_WAIT` passed instruct the application to fill the destination surface with an RGB colour and wait until blitting is completed.

#### Blitting from a back buffer to the primary surface

The power of blitting is really the domain of moving bitmaps in blocks. This is often useful for _sprites_ (bitmaps that
move around the screen).

Blitting can only take place if the source and destination surfaces are defined. One can also blit from surfaces that are not related to the primary surface, though in the next example, we will blit from a back buffer (secondary surface) to the primary surface. (Later, when handling bitmaps is covered, this example can be extended to blit bitmaps.)

Following a slight modification to the colour fill blitter example:

```cpp
// we don't require the Blt FX structure

RECT sourceRect, destRect;

sourceRect.left = x1;
sourceRect.top = y1;
sourceRect.right = x2;
sourceRect.bottom = y2;

destRect.left = x3;
destRect.top = y3;
destRect.right = x4;
destRect.bottom = y4;

lpddsPrimary->Blt(
	destRect,
	NULL,
	&sourceRect,
	DDBLT_WAIT,
	NULL
);
```

### Clipping

_Clipping_ is the process of ignoring or omitting pixels or parts of an image that would otherwise be out of bounds of
the viewport or window. DirectDraw does not support clipping of pixels or lines, so this must be implemented manually. DirectDraw does however support clipping of bitmaps.

#### Clipping on a pixel basis

To illustrate, one can define a rectangular region outside of which pixels will not be rendered.

```cpp
// assume these define the upper-left and lower-right boundaries
// and are inclusive (pixels can occupy the boundary too)
int x1, y1, x2, y2;

// attempt to plot a pixel at (x, y) on a 640x480 8-bit surface
void plotPixelAndClip(
	int x,
	int y,
	UCHAR colour,
	UCHAR *videoBuffer){
		
		if (x >= x1 && x <= x2 && y >= y1 && y <= y2){
			videoBuffer[x + (y*640)];
		}
}
```

To take into account the viewport dimensions, one can generalise the above as follows:

```cpp
// assume these define the upper-left boundaries
// and are inclusive (pixels can occupy the boundary too)
int x1, y1;

// assume these viewport dimensions are already defined;
// we don't allow pixels to occupy the right and bottom boundaries
int width, height;

// attempt to plot a pixel at (x, y) on a 640x480 8-bit surface
void plotPixelAndClip(
	int x,
	int y,
	UCHAR colour,
	UCHAR *videoBuffer){
		
		if (x >= x1 && x < width && y >= y1 && y < height){
			videoBuffer[x + (y*640)];
		}
}
```

#### Clipping without DirectDraw

As mentioned, DirectDraw support bitmap clipping. First, we review how to clip in software mode.

This can be achieved by overlaying the bitmap on the destination surface (e.g. the primary surface)
and then clipping the bitmap where it lies outside of the viewport.

Let us assume the bitmap of dimensions `width` x `height` is first overlayed at a point (x, y) which may or may not reside in the viewport, with dimensions `viewWidth` x `viewHeight`. We overlay the bitmap, then identify the portion of the bitmap that does lie inside the viewport and only draw what lies inside the viewport.

![](./MSVC2005/bitmap_clipping.png)

```cpp
int viewWidth = 640;
int viewHeight = 480;

void blitClipped(
	int x,
	int y,
	int width,
	int height,
	UCHAR *bitmap,
	UCHAR *videoBuffer,
	int memPitch){
		// make sure the bitmap top-left (origin) isn't out of the viewport
		// or bitmap bottom-right isn't above and to the left of the viewport origin
		if ((x >= viewWidth) || (y >= viewHeight) || 
				(x + width <= 0) || (y + height) <= 0){
			return;
		}

		// some of the bitmap is in the viewport, overlay it
		// and find out, from the viewport's perspective, where the top-left
		// and bottom-right of the bitmap are (exclusive)
		int x1 = x;
		int y1 = y;

		// bottom-right at most is determined by width
		// and height
		int x2 = x1 + width - 1;
		int y2 = y1 + height - 1;

		// now check both corners don't reside outside
		// the viewport and adjust if so
		if (x1 < 0){
			// can't draw top-left any further to the left
			x1 = 0;
		}

		if (y1 < 0){
			// can't draw top-left any further upwards
			y1 = 0;
		}

		if (x2 >= viewWidth){
			// can't draw bottom-right any further to the right
			x2 = viewWidth - 1;
		}

		if (y2 >= viewHeight){
			// can't draw bottom-right any further downwards
			y2 = viewHeight - 1;
		}

		// now determine the (offset) origin of the bitmap
		// from the viewport's perspective
		int xOff = x1 - x;
		int yOff = y1 - y;
		
		// determine the no. of columns and rows
		// of the bitmap to blit (this defines the 
		// area of the clipped bitmap)
		int dx = x2 - x1 + 1;
		int dy = y2 - y1 + 1;

		// determine where blitting starts
		// within the viewport (buffer)
		videoBuffer += (x1 + (y1 * memPitch));

		// determine where bitmap scanning 
		// starts (within the bitmap array)
		bitmap += (xOff + (yOff * width));

		// clipping prepared, start blitting
		UCHAR currentPixel;

		// for each row in the clipped bitmap
		for (int bmY = 0; bmY < dy; bmY++){ 

			// for each pixel along a row
			for (int bmX = 0; bmX < dx; bmX++){
				if (currentPixel = bitmap[bmX]){
					// currentPixel > 0, not transparent
					videoBuffer[bmX] = currentPixel;
				}
			}

			bitmap += memPitch; // next row
			videoBuffer += width; // next line
		}
	}
```

#### Clipping with DirectDraw

Instead of invoking a custom clipper, as above, one can utilise methods from the `IDirectDrawClipper` interface. To clip with DirectDraw:

1. Create a clipper with `IDirectDrawClipper::CreateClipper()`
2. Create a _clipping list_: a list of `RECT` structures for each clipped bitmap in the viewport [so the above example would involve two rectangles]. DirectDraw will only blit within the rectangles i.e. the _clip list_.
3. Set the clip list to the clipper
4. Attach the clipper to the surface or window

The method `IDIRECTDRAW7::CreateClipper()` can in most cases be used without consideration to the parameters, as:

```cpp
// assume DIRECTDRAW7 lpdd7 was initialised

// this will refer to the clipper
LPDIRECTDRAWCLIPPER lpddclipper = NULL;

if (FAILED(lpdd7->CreateClipper(0, &lpddclipper, NULL))){
	// failed to create clipper, clean up and leave
	return(0);
}
```

Creating a clipping list involves using a rather old data structure `RGNDATA`:

```cpp
typedef struct _RGNDATA{
	RGNDATAHEADER rdh;
	char Buffer[1];
} RGNDATA;
```

The rectangles (the clipping list) is stored in a `Buffer` array (which can change in length dynamically). The
array is stored in the stack and must be allocated appropriately before building the clipping list.

The `RGNDATAHEADER` acts as the header of a `RGNDATA` instance (_region data_) and is followed immediately (and continuously) by the `Buffer` array. The header contains information related to the array:

```cpp
typedef struct _RGNDATAHEADER {
	DWORD dwSize; // size of header in bytes
	DWORD iType; // type of region data
	DWORD nCount; // number of rectangles as RECTs
	DWORD nRgnSize; // size of Buffer[]
	RECT rcBound; // a bounding box around all RECTs
} RGNDATAHEADER;
```

(An example of initialising the clipping list will be given shortly.)

With the clipping list initialised, one then sets the clipping list with `IDIRECTDRAWCLIPPER::SetClipList()`. 
Finally, one then attaches the clipper to the surface with `IDIRECTDRAWSURFACE7::SetClipper()` (again, there is usually one one way to call these methods so the prototypes are not given here).

```cpp
// assume DIRECTDRAW7 lpdd7 was initialised

// this will refer to the clipper
LPDIRECTDRAWCLIPPER lpddclipper = NULL;

if (FAILED(lpdd7->CreateClipper(0, &lpddclipper, NULL))){
	// failed to create clipper, clean up and leave
	return(0);
}

// initialise the clipping list 
// (skipped here for now)

// assume this holds both the header and Buffer of RECTs
LPRGNDATA regionData;

if (FAILED(lpddclipper->SetClipList(&regionData, 0))){
	// failed to set clipping list to clipper, clean up and leave
	return (0);
}

// now attach clipper to surface (assume it is lpddsurface)
if (FAILED(lpddsurface->SetClipper(&lpddclipper))){
	// failed to set clipper to surface, clean up and leave
	return (0);
}
```

The clip list would take the form of an array of RECTs, for example:

```cpp
RECT rectList[3] = {
	{10, 10, 50, 50},
	{100, 100, 200, 200},
	{300, 300, 500, 450}
};
```

The code to set up the region data based on the above array is best managed by a function:

```cpp
LPDIRECTDRAWCLIPPER attachClipper(
	LPDIRECTDRAWSURFACE7 lpdds, int numRects, LPRECT clipList){

	int index;                         // looping var
	LPDIRECTDRAWCLIPPER lpddclipper;   // pointer to the newly created dd clipper
	LPRGNDATA regionData;             // pointer to the region data that contains
									// the header and clip list

	// first create the DirectDraw clipper
	if (FAILED(lpdd7->CreateClipper(0, &lpddclipper, NULL)))
		return(NULL);

	// create the clip list....

	// first allocate memory for region data
	regionData = 
		(LPRGNDATA)malloc(sizeof(RGNDATAHEADER) + (numRects * sizeof(RECT)));

	// now copy the rects into region data
	memcpy(regionData->Buffer, clipList, (numRects * sizeof(RECT)));

	// set up fields of header
	regionData->rdh.dwSize          = sizeof(RGNDATAHEADER);
	regionData->rdh.iType           = RDH_RECTANGLES;
	regionData->rdh.nCount          = numRects;
	regionData->rdh.nRgnSize        = numRects * sizeof(RECT);

	// set the bounding rectangle
	regionData->rdh.rcBound.left    =  64000;
	regionData->rdh.rcBound.top     =  64000;
	regionData->rdh.rcBound.right   = -64000;
	regionData->rdh.rcBound.bottom  = -64000;

	// find bounds of all clipping regions
	for (index = 0; index < numRects; index++){
		// test if the next rectangle unioned with the current bound is larger
		if (clipList[index].left < regionData->rdh.rcBound.left)
		regionData->rdh.rcBound.left = clipList[index].left;

		if (clipList[index].right > regionData->rdh.rcBound.right)
		regionData->rdh.rcBound.right = clipList[index].right;

		if (clipList[index].top < regionData->rdh.rcBound.top)
		regionData->rdh.rcBound.top = clipList[index].top;

		if (clipList[index].bottom > regionData->rdh.rcBound.bottom)
		regionData->rdh.rcBound.bottom = clipList[index].bottom;

	}

	// now we have computed the bounding rectangle region and set up the data
	// now let's set the clipping list

	if (FAILED(lpddclipper->SetClipList(regionData, 0))){
		// release memory and return error
		free(regionData);
		return(NULL);
	}

	// now attach the clipper to the surface
	if (FAILED(lpdds->SetClipper(lpddclipper))){
		// release memory and return error
		free(regionData);
		return(NULL);
	}

	// all is well, so release memory and send back the pointer to the new clipper
	free(regionData);
	return(lpddclipper);
}
```

Calling the function is straighforward to the back buffer:

```cpp
LPDIRECTDRAWCLIPPER lpddclipper = attachClipper(lpddsback, 3, rectList);
```
