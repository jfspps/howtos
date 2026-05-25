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

## MFC Concepts

### Documents and Views

MFC applications manage documents and views. A _document_ refers to the data the application handles at a given time
and a _view_ refers to the how the document is presented to the user. The window in which the view appears is called
the _frame window_. Each view can only be related to one document (via pointers) whereas each document can be related to 
multiple views (again, via pointers).

Documents are defined as derived classes of `CDocument` whereas views are defined as derived classes of `CView`.

MFC applications can handle one document at a time as _SDI applications_, supported by the _Single Document Interface_ 
of the MFC library. Applications that need to support multiple documents (of varying types if needed) 
at a time are built as _MDI applicaitons_ using the _Multiple Document Interface_.

### Document templates

The connection between a document, a view and frame windows is managed by a document template. The document template can be
assigned to multiple documents of the same type. Technically, the document template (an MFC object) creates document and frame window
objects, while the frame window object creates the views. The document template object is subordinate to the application.

- Application creates...
  + Document template creates...
    - Document
	- Frame window creates...
	  + View

Technically, SDI applications are implemented as derived classes of `CSingleDocTemplate` while MDI applications are
implemented from `CMultiDocTemplate`. More classes are shown below:

![](./MSVC2005/mfc_classes.png)

