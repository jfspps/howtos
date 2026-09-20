---
title: DirectX 9.0c
nav_order: 8
parent: Programming in C++
---

# DirectX 9.0c

This article introduces the concepts behind DirectX 9.0c, set in relation to the GDI and Win32 APIs.

## Components

DirectX 9 is mainly composed of:

+ DirectX Graphics (Direct3D and additional graphics functionality provided by D3DX [Windows Vista or higher only])
+ DirectInput (all keyboard, mouse and user controller functionality)
+ DirectSound (audio production and capture)

![](./MSVC2005/directx_architecture.png)

As shown, Win32 applications call upon DirectX libraries, which in turn access the hardware via standard interfaces. Hardware vendors produce drivers that conform to the Component Object Model (COM) interfaces so that application developers need not update software too often when hardware is upgraded or replaced.

What is not shown above is an additional layer known as the _Hardware emulation layer_ (HEL) that performs functions in software mode if the underlying hardware does not support said functions. This sits on top of the _Harware abstraction layer_ (HAL).

A major alternative to Direct3D was OpenGL (now at time of writing superseded by Vulkan). OpenGL drivers are released along with DirectX drivers from hardware vendors. OpenGL v2.0 (to v2.1) was released in 2004, at roughly the same time as DirectX 9.0c (integrated with Windows XP SP2). Most hardware vendors release drivers for both APIs.

For completeness, roughly speaking Direct3D 10 (Windows Vista or later) was released at around the same time as OpenGL v3.x. Similarly, Direct3D 11 (Windows 7 or later; added to Vista SP2 shortly after initial release) was released at the same time as OpenGL v4.x.

Full details about what version of DirectX and OpenGL (amongst other APIs) can be extracted with e.g. GPU-Z:

![](./MSVC2005/GPU_Z.PNG)

### Older components: DirectDraw (DirectX 7 and DirectX 9 managed code)

Since DirectX 8.0, all 2-dimensional acceleration was provided by _DirectDraw_. This API is generally much faster then the GDI (or older MCI, Media Control Interface, which DirectX replaces). All 2-dimensional drawing with DirectX 8+ was merged with Direct3D.

More recent APIs that replace DirectDraw include Direct2D (launched ca. 2012, Windows 7 or above).

### Older components: DirectMusic (DirectX 8)

DirectXSound does not support MIDI and wavetable synthesiser music. This is what DirectMusic is for, and was built on top of DirectSound when supported. Since Windows Vista, DirectMusic is not available to 64-bit applications and was deprecated and replaced by Windows Audio Session API (WASAPI).

Alternative to DirectSound include OpenAL.

### Older components: DirectPlay (DirectX 8 and DirectX 9 managed code)

DirectPlay is a networking API, providing features such as "sessions" (games in progress) and "lobbies" (where players congregate and play). 

### Direct3D retained mode (Direct3DRM)

A more high-level object and frame based 3D system. Requires programmers to modify each frame scene, without much need to interface with the DirectX API, and quite slow.

The concepts of retained mode and (below) immediate mode are not unique to the DirectX graphics APIs but applied to other graphical APIs.

### Direct3D immediate mode (Direct3DIM)

A more low-level part of the API (retained mode was built on top of immediate mode) and quite difficult to use in its eariler iterations. Eventually (since Direct3D 5) adopted a more accessible OpenGL like approach to function calls with the rendering engine rather than direct arrays (i.e. buffers).

### DirectShow (DirectX 8)

This component handles video streaming in applications, supporting a numer of formats including Advanced Streaming Format (ASF), Motion Pictures Exports Group (MPEG), Audio-Video Interleaved (AVI), MPEG Audio Layer-3 (MP3) and WAV files. This was removed from the DirectX 9 and moved to the Windows SDK.

DirectShow was eventually superseded by Media Foundation (MF) in Windows Vista or newer.
