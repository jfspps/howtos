---
title: Linked lists as alternatives to arrays
nav_order: 18
parent: ADTs and Algorithms in C++
---

# Linked lists as alternatives to arrays

## Representing sparse matrices as linked lists

We require to represent the row no., column no., as well as the non-zero element value. Essentially, each row in the matrix with _n_ non-zero elements is made up of a linked list of _n_ nodes.

![](./images/arrayOfLinkedLists.svg)

An array of length m equals the (number of rows - 1). Each element of the array stores the address of the first node. Hence, we have an array of linked lists. The C++ structure is:

```cpp
struct Node{
    int column_number;
    int matrix_element;
    struct Node * next;
};

// declare an array of m linked lists
// below compared to: Node * temp = new Node;

Node * A[m];
A[m] = 0;
Node *temp, *last;

// initialise in sequence, with a pointer temp to a new Node

//first row has one non-zero element
A[0] = new Node;
A[0]->column_number = 2;
A[0]->matrix_element = 55;
A[0]->next = 0;

//second row has two non-zero elements
A[1] = new Node;
A[1]->column_number = 1;
A[1]->matrix_element = 55;
A[1]->next = 0;
last = A[1];

//build the next Node and then join
temp = new Node;
temp->column_number = 4;
temp->matrix_element = 12;
temp->next = 0;
last->next = temp;

//and so on...
```

To display an `m x n` matrix, with an array of length m:

```cpp
Node * ptr;

for (int i = 0; i < m; i++){
    ptr = A[i];
    for (int j = 0; j < n; j++){
        if (j == p->column_number)
        {
            printf("%d ", ptr->matrix_element);
            ptr = ptr->next;
        }
        else
        {
            printf("0 ");
        }
    }
}
```

## Representing polynomials with linked lists

A node with the coefficient and the exponent (and the pointer to the next node) is sufficient to represent each term in a polynomial.

```cpp
struct Node
{
    int coeff;
    int exponent;
    struct Node *next;
}
```

A polynomial can be evaluated with the following function:

```cpp
long evaluatePoly(struct Node *ptr, int x)
{
    long sum = 0;
    while(ptr)
        {        
            sum += ptr->coeff * pow(x, ptr->exponent);        
            ptr = ptr->next;
        }
    return sum;
}
```

The function pow() will require the header file, as given by `#include <math.h>`.
