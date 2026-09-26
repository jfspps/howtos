---
title: DirectDraw (DirectX 7)
nav_order: 8
parent: Programming in C++
---

# DirectDraw (DirectX 7)

This article introduces the concepts behind DirectDraw with DirectX v8 interfaces.

## DirectDraw interfaces

There are four DirectDraw interfaces, all derived from `IUnknown`. The following interface identifiers omits any specific version number.

+ IDirectDraw - the main interface which effectively represents the GPU
+ IDirectDrawSurface - represents the display surface that can reside in VRAM or system memory. Two types of surface: 
  - Primary surface - represents the video buffer being rasterised and displayed on screen
  - Seconday surface - represents the back buffer (off-screen) scene
+ IDirectDrawPalette - handles the 256-colour mode [colour palette](6_WindowsAPIGDIPart1.md#excursion-rgb-and-palattes)
+ IDirectDrawClipper - assists with clipping bitmap and raster operations, typically for windowed applications

## Creating the DirectDraw object

There are principally three ways to create DirectDraw objects (based on `IDirectDraw7`):

+ Use `DirectDrawCreate()` to get an IDirectDraw 1.0 interface `IDirectDraw`, and then via `QueryInterface()` get the latest `IDirectDraw7` interface
+ Use a low-level COM approach to get IDirectDraw7
+ Use `DirectDrawCreateEx()` to get hold of IDirectDraw7

### Using `DirectDrawCreate()` to get `IDirectDraw7`

`DirectDrawCreate()` has three parameters:

1. lpGUID - GUID of the display driver to use; set to NULL to use the system default
2. lplpDD - a pointer to a pointer that receives `IDirectDraw` 
3. pUnkOuter - advanced feature, leave as NULL

```cpp
// standard DirectDraw 1.0
LPDIRECTDRAW lpdd = NULL;

// FAILED is a DirectX macro (contrast to SUCCEEDED)
if (FAILED(DirectDrawCreate(NULL, &lpdd, NULL))){
    // problem starting up 1.0, return
}

// got DirectDraw 1.0, let's update to 7.0
LPDIRECTDRAW lpdd7 = NULL;

if (FAILED(lpdd->QueryInterface(IID_DirectDraw7, (LPVOID *)&lpdd7))){
    // problem starting up 7.0; clean up then return
}

// release 1.0, don't need it anymore
lpdd->Release();
lpdd = NULL;
```

The `IID_DirectDraw7` naming convention refers to the interface ID (IID) and also applies to other 
DirectX components e.g.

+ `IID_DirectSoundX`
+ `IID_DirectInputX`

where `X` is the version number.

### The COM approach to get `IDirectDraw7`

This approach requires knowledge of the interface ID (IID).

```cpp
// try to load COM libraries
if (FAILED(CoInitialize(NULL))){
    // failed to load COM libraries, return
}

LPDIRECTDRAW lpdd7 = NULL;

if (FAILED(CoCreateInstance(&CLSID_DirectDraw, NULL, CLSCTX_ALL, &IID_IDirectDraw7, &lpdd7))){
    // failed to create DirectDraw 7 object, return
}

if (FAILED(IDirectDraw7_Initialize(lpdd7, NULL))){
    // failed to initialise DirectDraw 7.0 object, clean up and return
}

// could also use this instead to initialise
if (FAILED(lpdd7->Initialize(NULL))){
    // failed to initialise DirectDraw 7.0 object again, clean up and return
}

// finished with COM
CoUninitialize();
```

### Using `DirectDrawCreateEx()` to get `IDirectDraw7`

This is a bit quicker to invoke.

```cpp
LPDIRECTDRAW lpdd7 = NULL;

DirectDrawEx(NULL, (void **)&lpdd7, IID_DirectDraw7, NULL);
```

The function `DirectDrawEx()` has four parameters:

+ lpGUID - the GUID of the driver, NULL for active display
+ lplpDD - receiver of the interface
+ iid - interface ID of the interface requested
+ pUnkOther - advanced COM, leave as NULL
