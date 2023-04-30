---
title: Utilising data structures in memory
nav_order: 1
parent: ADTs and Algorithms in C++
---

# Utilising data structures in memory

Memory addresses are zero-based. Memory is partitioned into code, stack and heap sections.

## The stack

At compile-time, variables local to `main()` are allocated statically (known, fixed amount of data). Other function calls are allocated a portion of the stack (called the stack frame or activation record) on a LIFO basis.

The term stack relates to how functions stack on top of each other as they are called. When a function returns, its stack frame is cleared automatically.

## The heap

The heap is a randomly arranged portion of memory where data resides in randomly allocated heaps. Data which utilises the heap must be allocated and de-allocated (to prevent memory leaks).

Programs do not access heap memory directly. They can access them with pointers indirectly.

```cpp
void main(){
  int *p;
  p = new int[5];  // this allocated 5*size of int in the heap, somewhere

  //the C based version of new assuming int's are 2 bytes long
  //p = (int *)malloc(2 * 5);
  
  //do stuff to p...

  delete[] p;      // clear the heap (do this before resetting the pointer!)
  p = NULL;        // reset the pointer
 }
```
