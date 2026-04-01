---
title: Microsoft Visual Studio 2005
nav_order: 1
parent: Programming in C++
---

This article outlines the basics to application development with Visual Studio 2005.

## New Win32 projects

Start a new project as a Win32 project:

![](./MSVC2005/new_project.PNG)

In the above case, the _Solution_ represents the combination of programs and related resources intended to solve a problem. For basic C++ applications,
choose an empty project:

![](./MSVC2005/empty_project.PNG)

To add project files, right-click on the Solution Explorer as appropriate.

![](./MSVC2005/adding_project_files.PNG)

Add a C++ source file:

![](./MSVC2005/new_source_file.PNG)

Generally, one builds a _debug_ version of the application (to allow for debugging and tracing) and, later, a _release_ version of the application that
is more optimal. Clicking the green arrow will build the application, open and (in this case) close the app. To prevent the app from closing right away, enter CTRL+F5 instead.

![](./MSVC2005/building_debug_apps.PNG)

![](./MSVC2005/ctrl_f5.PNG)
