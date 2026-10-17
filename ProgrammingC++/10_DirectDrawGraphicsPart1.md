---
title: DirectDraw Graphics Part 1
nav_order: 10
parent: Programming in C++
---

# DirectDraw Graphics Part 1

This article extends the DirectDraw setup and foundation from [the previous section](9_DirectDraw.md), covering topics such as:

+ High-colour modes
+ Page flipping and double buffering
+ The blitter
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

The RGB encoding available (the _pixel format_) is hardware dependent but evidently needs to be known, because the colour word for each encoding is hardware dependent. One can deduce the pixel format with `IDIRECTDRAWSURFACE7::GetPixelFormat()`:

```cpp
HRESULT GetPixelFormat(LPDDPIXELFORMAT lpDDPixelFormat);
```

The sole parameter `LPDDPIXELFORMAT` is a pointer to `DDPIXELFORMAT` which is updated by `GetPixelFormat()` with information about the pixel format. One then queries the parameter (assuming the call hasn't failed) to determine the pixel format.

Assuming that the DirectDraw primary surface (`lpdds_primary`) has already by initialised:

```cpp
DDPIXELFORMAT ddPixel;

LPDIRECTDRAWSURFACE7 lpdds_primary;

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
		// 256 (8-bit) colour palettised mode
	} else {
		// something else
	}
}
```
