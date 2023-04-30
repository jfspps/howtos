---
title: Types of data structures
nav_order: 4
parent: Data Structures and Algorithms in C++
---

# Types of data structures

a. __Physical__ _e.g._ arrays and linked lists, which define how memory is allocated.

b. __Logical__ _e.g._ stack (LIFO based), queues (FIFO based), trees, graphs and hash tables. These data types describe how operations on the data are performed but are implemented by arrays or linked lists, or some combination.

**Arrays** in C++ are fixed in size (static) and can reside on the stack or heap. They are generally more efficient than linked lists, particularly if the max. size of the array is known.

**Linked lists** are variable in size (dynamic) and always exist on the heap. The pointer to the head of the linked list resides on the stack.

## Abstract data types

ADTs are defined by:

1. Representation of data
2. Operations on the data

Internally, for example, integers are 1. represented as a sequence of (compiler dependent) 2 bytes or 16 bits. The first bit is the sign and the remaining 15 bits hold the value. Integers are operands to the operators `+`, `-`, `/`, `*`, `%`, `++` and `--`. These details are usually hidden from the user.

Lists are represented by arrays or linked lists. They are operated on by `add()`, `remove()` and `search()`, for example.