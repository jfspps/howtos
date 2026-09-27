---
title: DirectDraw (DirectX 7)
nav_order: 8
parent: Programming in C++
---

# DirectDraw (DirectX 7)

This article introduces the concepts behind DirectDraw (for DirectX 7) with the DirectX v9.0c SDK.

## DirectDraw interfaces

There are four DirectDraw interfaces, all derived from `IUnknown`. The following interface identifiers omits any specific version number.

+ `IDirectDraw` - the main interface which effectively represents the GPU
+ `IDirectDrawSurface` - represents the display surface that can reside in VRAM or system memory. Two types of surface: 
  - Primary surface - represents the video buffer being rasterised and displayed on screen
  - Seconday surface - represents the back buffer (off-screen) scene
+ `IDirectDrawPalette` - handles the 256-colour mode [colour palette](6_WindowsAPIGDIPart1.md#excursion-rgb-and-palattes)
+ `IDirectDrawClipper` - assists with clipping bitmap and raster operations, ensuring assets are set within the bounds of windowed applications and DirectDraw surfaces boundaries

## 1. Creating the DirectDraw object

There are principally three ways to create DirectDraw objects (based on `IDirectDraw7`):

+ Use `DirectDrawCreate()` to get an IDirectDraw 1.0 interface `IDirectDraw`, and then via `QueryInterface()` get the latest `IDirectDraw7` interface
+ Use a low-level COM approach to get IDirectDraw7
+ Use `DirectDrawCreateEx()` to get hold of IDirectDraw7

### Using `DirectDrawCreate()` to get `IDirectDraw7`

```cpp
HRESULT WINAPI DirectDrawCreate(
    GUID FAR *lpGUID,
    LPDIRECTDRAW FAR *lplpDD,
    IUnknown FAR *pUnkOuter
);
```

`DirectDrawCreate()` has three parameters:

1. lpGUID - GUID of the display driver to use; set to NULL to use the system default
2. lplpDD - a pointer to a pointer that receives `IDirectDraw` 
3. pUnkOuter - advanced feature, leave as NULL

This section also introduces error handling, with macros `SUCCCEEDED` and `FAILED`. The following sections define functions that return `HRESULT`, as a return code. The only success code is `DD_OK`, so `FAILED(DD_OK)` returns `false`. There are several failure codes, including `DDERR_DIRECTDRAWALREADYCREATED` and `DDERR_OUTOFMEMORY`.

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

## 2. Setting the Cooperative level with Windows

The next step in building a DirectDraw application is consideration to how DirectX draws upon Windows resources. This is particularly notes for windowed applications, where a DirectX application will not have nearly as much attention as a fullscreen application. Other applications may need to refresh their content and so temporarily the DirectX application must yield control to other applications from time to time.

_Cooperative levels_ are determined by `IDirectDraw7::SetCooperativeLevel()`. 

```cpp
HRESULT SetCooperativeLevel(
    HWND hWnd,
    DWORD dwFlags
);
```

The first parameter is normally the main window handle. The second parameter is the control flags parameter and it determines how DirectDraw cooperates with Windows, as bitwise OR flags.

```cpp
// assume the DirectDraw interface pointer lpdd7 is initialised

// for windowed applications
lpdd7->SetCooperativeLevel(
    hWnd,
    DDSCL_NORMAL
);

// for fullscreen applications
lpdd7->SetCooperativeLevel(
    hWnd,
    DDSCL_FULLSCREEN |
    DDSCL_ALLOWMODEX | // allow Mode X (i.e. undocumented) display modes e.g. 320x200
    DDSCL_EXCLUSIVE | // exclusive level
    DDSCL_ALLOWREBOOT | // allow CTRL+ALT+DEL to be detected
);
```

See this [DirectDrawDemo](https://github.com/jfspps/VisualStudio2005Learning/tree/main/DirectDrawDemo) for an
example of running a windowed DirectDraw application. Note that the `ddraw` LIB and header files had to be copied from the DirectX 9.0c SDK to the project folder prior to compilation.

## 3. Setting the display mode

The next step is setting the display mode, with `IDirectDraw7::SetDisplayMode()`.

```cpp
HRESULT SetDisplayMode(
    DWORD dwWidth,
    DWORD dwHeight,
    DWORD dwBPP,
    DWORD dwRefreshRate,
    DWORD dwFlags
);
```

The parameters are:

+ dwWidth - width of display mode in pixels
+ dwHeight - height of display mode in pixels
+ dwBPP - bit-depth or colour depth (per pixel) e.g. 8-bit, 16-bit, 24-bit...
+ dwRefreshRate - refresh rate; 0 is default
+ dwFlags - advanced use; 0 for defaults

For example, the following sets the display mode to 800x600:

```cpp
lpdd7->SetDisplayMode(800, 600, 16, 0, 0);
```

Setting the colour depth to 8-bit (256 colour) will require a [palette](6_WindowsAPIGDIPart1.md#excursion-rgb-and-palettes) to be defined for mappings. Recall that this means there are 256 values for each of the red, green and blue channels. Thus this requires a data type that stores three 8-bit wide channels i.e. a 24-bit wide data type.

Higher level 16-bit, 24-bit and 32-bit colour modes do not require a palette and instead use encoded data
sent straight to the video buffer (discussed later).

### Setting up an 8-bit palette

In applications targetting 8-bit colour, a palette would need to be defined.

This normally involves defining palette data structure as an array of 256 `PALETTENTRY`:

```cpp
PALETTENTRY palette[256];

for (int colour = 1; colour < 255; coloir++){
    palette[colour].peRed = rand() % 256;
    palette[colour].peGreen = rand() % 256;
    palette[colour].peBlue = rand() % 256;

    // this is needed to prevent Windows or DirectX
    // automatically optimising the palette
    palette[colour].peFlags = PC_NOCOLLAPSE;
}

// set black colours (0, 0, 0) - somewhat optional, see the control flags later
palette[0].peRed = 0;
palette[0].peGreen = 0;
palette[0].peBlue = 0;
palette[0].peFlags = PC_NOCOLLAPSE;

// set white colours (255, 255, 255) - somewhat optional, see the control flags later
palette[255].peRed = 255;
palette[255].peGreen = 255;
palette[255].peBlue = 255;
palette[255].peFlags = PC_NOCOLLAPSE;
```

With the above palette set up, one then assigns this to [`IDirectDrawPalette` interface](#directdraw-interfaces) using 
`IDirectDraw7::CreatePalette()`.

```cpp
HRESULT CreatePalette(
    DWORD dwFlags, // control flags
    LPPALETTEENTRY lpColourTable, // palette data or NULL
    LPDIRECTDRAWPALETTE FAR *lplpDDPalette, // palette interface 
    IUnknown FAR *pUnkOuter // advanced usage; leave as NULL
);
```

The first parameter is probably of most concern here, and is composed of one or more control flags, with bitwise
OR operations if needed. Some commonly used flags:

+ `DDCAPS_8BIT` - Represents 8-bit colour, with 256 colour table entries
+ `DDCAPS_ALLOW256` - applies if all 256 entries have been defined by the palette, including `0` for black and `255` for white. Some systems (e.g. Windows NT) do not allow these to be set and assume black and white values are already `0` and `255` respectively. In such cases it will be necessary to exclude these "colours" from the palette and this flag is not required.
+ `DDCAPS_INITIALIZE` - initialise the colours based on the array passed to `CreatePalette()`; this is needed for 8-bit colour

With the above 8-bit palette initialised, one can assign it:

```cpp
// palette array is "palette", above, where black and
// white are defined

// the palette interface received
LPDIRECTDRAWPALETTE lpddpal = NULL;

if (FAILED(lpdd7->CreatePalette(
    DDCAPS_8BIT | DDCAPS_ALLOW256 | DDCAPS_INITIALIZE,
    palette,
    &lpddpal,
    NULL
))){
    // problem setting up the display palette, clean up and exit
}

// OK, lpddpal is no longer NULL and has a valid IDirectDrawPalette interface, palette ready...
```

### Building a Display Surface

A _display surface_ is a DirectDraw abstraction of memory that define a rectangular region that holds bitmap data.
For completeness, a _bitmap_ (or _pixmap_ or _raster_) is an image defined by an array of pixels. Raster graphics define each pixel via an array and have a defined resolution, unlike _vector graphics_ which are defined by mathematical formulae and are not characterised by a finite resolution.

As mentioned previously, there are two types of surface:

+ Primary surface - video memory currently being _rasterised_ (converted to a raster) to the screen by the video card. There is usually only one primary surface in a given DirectDraw application.
+ Secondary surface - this can be either the abstraction of video memory or system memory, which is prepared offscreen prior to the next frame. The secondary surface is a buffer that is eventually _page-flipped_ (copied) to the primary surface. There is usually more than one secondary surface present per application. For example, applications that have two secondary surfaces would support _double buffering_, and three secondary surface applications supporting _triple buffering_.

To build a display surface, one must first define a `DDSURFACEDESC2` structure that describes the surface, before calling `IDirectDraw7::CreateSurface()` to create it.


