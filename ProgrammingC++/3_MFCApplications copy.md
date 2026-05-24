---
title: Microsoft Foundation Classes applications
nav_order: 3
parent: Programming in C++
---

# Microsoft Foundation Classes applications

This article demonstrates the main aspects involved to building Windows applications with MVS using MFC (Microsoft Foundation Classes).

## Setup

Building a demo application similar to that with the Windows API [example](./2_WindowsAPIApplications.md) is much simpler, so much
so that the code is given below. Readers will notice a few areas that overlap from the lower level Windows API approach.

Note that this demo was built as an empty Win32 project, while also enabling _Use MFC in a Shared DLL_ found under the project's
Configuration Properties.

![](./MSVC2005/mfc_shared.PNG)

```cpp
// MFC classes
#include <afxwin.h>

// convention for MFC projects to precede class names
// with C and data members with m_

// All MFC applications are based on CWinApp
class CDemoApp: public CWinApp 
{
public:
	// this will be called by WinMain automatically
	virtual BOOL InitInstance();
};

// windows in MFC are referred to as frame windows, defined by CFrameWnd
class CDemoWindow: public CFrameWnd
{
public:
	CDemoWindow(){
		Create(
			0,		// use the CFrameWnd defaults
			L"Demo MFC Application");
	}
};

BOOL CDemoApp::InitInstance(void){
	m_pMainWnd = new CDemoWindow;

	// key point that links the App (CDemoApp) to
	// an MFC frame window (CDemoWindow); m_pMainWnd
	// is freed up automatically by WinMain()
	m_pMainWnd->ShowWindow(m_nCmdShow);
	return TRUE;
}


// have to build a global instance of the app before
// WinMain() runs (it assumes an instance exists)
CDemoApp AnInstance;

// no need for WinMain(), this is already part of CWinApp
```
