---
title: Array operations in C++
nav_order: 11
parent: Data Structures and Algorithms in C++
---

# Array operations in C++

## The dot (.) and arrow (->) operators

The dot operator is used to call a given method or member (of a structure) on an object which was passed by reference. See Display(), below, for an example.

The arrow operator is used when the object was passed as a pointer. See Append() for an example.

## The array structure

The following examples are based on an array structure, with three variables.

```cpp
struct Array
{
    int size;       //represents the number of elements with user-defined values
    int A[10];    
    int length;     //represents the total number of elements currently available
}
```

## Operations on the array structure

We store the structure in the heap. For display functions we simply pass by value (a copy is temporarily stored in the stack) but for other operations which can edit elements, we pass by pointer.

## Dot and arrow operators

The dot `(.)` operator calls a method on the given object when the object was passed by value. See `Display()` below for an example. If the object was passed by pointer then the arrow operator `(->)` is used instead. See `Append()` for an example.

## Displaying and appending to an array

```cpp
void Display(struct Array arr)
{
    int i;
    printf("\nElements are\n");
    for(i=0; i<arr.length; i++)
        printf("%d ", arr.A[i]);
}

//somewhere in main(){}
struct Array arr1 = {5, {2,3,4,5,6},10};
Display(arr1);
```

The add() operation increases `length` and changes a padded zero element accordingly. Append() is the same as add().

```cpp
void Append(struct Array *arr, int x)
{
    if(arr->length < arr->size)
        arr->A[arr->length++] = x;
}

//somewhere in main(){}
struct Array arr1 = {5, {2,3,4,5,6},10};
Display(arr1);
Append(&arr1, 10);
Display(arr1);  //this would print 2,3,4,5,6,10
```

We pass the address of `arr` to Append() and all other non-display functions.

## Inserting to and deleting from an array

The insertion function insert() starts the last element and copies all preceding elements until the point of insertion `index` is reached.

```cpp
void Insert(struct Array *arr, int index, int x)
{
    int i;
    if(index >= 0 && index <= arr->length)
        {
        for(i = arr->length; i > index; i--)
            arr->A[i] = arr->A[i-1];
        arr->A[index] = x;
        arr->length++;
        }
}

//somewhere in main(){}
Insert(&arr1, 0, 12);
```

The deletion operation delete() finds the given element by its index and then shifts subsequent elements down by one element. In this method, we return the integer stored at the given index.

```cpp
int Delete(struct Array *arr, int index)
{
    int x = 0;
    int i;
    if(index >= 0 && index < arr->length)
    {
        x = arr->A[index];
        for(i = index; i < arr->length-1; i++)
            arr->A[i] = arr->A[i+1];
        arr->length--;
        return x;
    }
    return 0;
}
```

```cpp
//somewhere in main(){}
struct Array arr1 = { { 2,3,4,5,6 } ,10, 5};
printf("%d", Delete(&arr1, 0));     //prints 2
Display(arr1);      //prints 3,4,5,6
```

## Reversing an array

Apart from creating an array in which the elements are copied back to front, a more efficient algorithm is the immediate swapping of elements in the given array when the initial counter `i` is less than the second counter `j`. We pass by pointer this time since we want to change the elements' values.

```cpp
void Reverse2(struct Array *arr)
{
    int i, j;
    for(i = 0, j = arr->length-1; i < j; i++, j--)
    {
        swap(&arr->A[i], &arr->A[j]);
    }
}

void swap(int *x, int *y)
{
    int temp = *x;
    *x = *y;
    *y = temp;
}
```

## Inserting an element in a sorted array

The approach here is to check the value that is to be inserted and the element (for example) at the end of the array. If a condition is met then shift the last element down the array. Continue with this until the element in the array is less than the value to be inserted. No need to check all other preceding elements.

```cpp
void insertIntoSorted(struct Array *arr, int newElement){
    int i = arr->length - 1;

    //check that there is space to insert the element
    if (arr->length == arr->size){
        return;
    }

    //shift the values
    while (i >= 0 && arr->A[i] > x){
        arr->A[i+1] == arr->A[i];
        i--;
    }

    arr->A[i] = x;
    arr->length++;
}
```

## Merging sorted arrays

Two sorted arrays can be merged such that the resultant array is also sorted. This is achieved by comparing sequential elements from both arrays and then deciding about which element to copy across to the new, larger array.

```cpp
//assume Merge is a method of a class Array (Array() is then the constructor); array A is a instance variable of the object on which Merge operates on (full code for the class is below)
    Array Merge(Array& B){
        Array C(length + B.length, length + B.length);
        int i = 0;
        int j = 0;
        int k = 0;
        while (i < length && j < B.length){
            if (A[i] < B.Get(j)){
                C.Set(k++, A[i++]);
            } else {
                C.Set(k++, B.Get(j++));
            }
        }

        //check for and the add trailing elements from either array (the object array or B)
        for (; i < length; i++){
            C.Set(k++, A[i]);
        }
        for (; j < B.length; j++){
            C.Set(k++, B.Get(j));
        }
        return C;
    }

    //somewhere in main(){}
        struct Array array1 = { { 2,6,10,15,25 }, 10, 5};
        struct Array array2 = { { 3,4,7,18,20 }, 10, 5};

        struct Array array3 = array1.Merge(array2)

```

Below is the class Array taken from the course:

```cpp
#include <iostream>
#include <cstdlib>
 
using namespace std;
 
class Array{
 
private:
    int* A;
    int size;
    int length;
 
public:
    Array(int size, int length, bool sorted=false){
 
        this->size = size;
        this->length = length;
 
        A = new int [size];
 
        if (sorted){
            cout << "Enter ints in sorted manner" << endl;
            for (int i = 0; i < length; i++){
                cout << "Enter element " << i << " : " << flush;
                cin >> A[i];
            }
        } else {
            for (int i = 0; i < length; i++){
 
                int val;
                val = rand() % 100;  // Random int in range 0 to 100
 
                // Generate random binary int and make value negative
                if (rand() % 2){
                    A[i] = -1 * val;
                } else {
                    A[i] = val;
                }
 
            }
        }
    }
 
    int Get(int index){
        if (index >= 0 && index < length){
            return A[index];
        }
    }
 
    void Set(int index, int x){
        if (index >= 0 && index < length){
            A[index] = x;
        }
    }
 
    void display(){
        for (int i = 0; i < length; i++){
            cout << A[i] << " ";
        }
        cout << endl;
    }
 
    Array Merge(Array& B){
        Array C(length + B.length, length + B.length);
        int i = 0;
        int j = 0;
        int k = 0;
        while (i < length && j < B.length){
            if (A[i] < B.Get(j)){
                C.Set(k++, A[i++]);
            } else {
                C.Set(k++, B.Get(j++));
            }
        }
        for (; i < length; i++){
            C.Set(k++, A[i]);
        }
        for (; j < B.length; j++){
            C.Set(k++, B.Get(j));
        }
        return C;
    }
 
    ~Array(){
        delete[] A;
    }
 
 
};
 
int main() {
 
    Array X(10, 5, true);
    Array Y(10, 4, true);
 
    Array Z = X.Merge(Y);
    Z.display();
 
    return 0;
}
```

## Set operations

Sets contain collections of unique values and in these examples stored as arrays. The set operations covered produce new sets, as new arrays.

### Union

This takes the elements from both sets and be copied to a new set. There are no duplicates.

### Intersection

This takes elements which are common to both sets and copies the elements to a new set.

### Difference

The result depends on the order of the operands. The difference A - B indicates the elements only found in A are copied to the new set (array). The difference B - A indicates the elements only found in B are copied across.

### The code for set operations

In general, set operations on ordered arrays are more efficient, at degree O(n + m) or just O(2n) as O(n). Set operation time complexities on unordered arrays are quadratic, O(nm) or just O(n^2). The code below is presented in C

```cpp
struct Array
{
    int A[10];
    int size;
    int length;
};

void Display(struct Array arr)
{
    int i;
    printf("\nElements are\n");
    for(i=0; i < arr.length; i++)
    printf("%d ", arr.A[i]);
}

struct Array* Union(struct Array *arr1, struct Array *arr2)
{
    int i, j, k;
    i = j = k = 0;
    struct Array *arr3 = (struct Array *)malloc(sizeof(struct Array));

    while(i < arr1->length && j < arr2->length)
    {
    if(arr1->A[i] < arr2->A[j])
        arr3->A[k++] = arr1->A[i++];
    else if(arr2->A[j] < arr1->A[i])
        arr3->A[k++] = arr2->A[j++];
    else
        {
            arr3->A[k++] = arr1->A[i++];
            j++;
        }
    }

    for( ; i < arr1->length; i++)
        arr3->A[k++] = arr1->A[i];

    for( ; j < arr2->length; j++)
        arr3->A[k++] = arr2->A[j];

    arr3->length = k;
    arr3->size = 10;
    return arr3;
}

struct Array* Intersection(struct Array *arr1, struct Array *arr2)
{
    int i, j, k;
    i = j = k = 0;
    struct Array *arr3 = (struct Array *)malloc(sizeof(struct Array));

    while(i < arr1->length && j < arr2->length)
    {
    if(arr1->A[i] < arr2->A[j])
        i++;
    else if(arr2->A[j] < arr1->A[i])
        j++;
    else if(arr1->A[i] == arr2->A[j])
        {
            arr3->A[k++] = arr1->A[i++];
            j++;
        }
    }

    arr3->length = k;
    arr3->size = 10;
    return arr3;
}

struct Array* Difference(struct Array *arr1, struct Array *arr2)
{
    int i, j, k;
    i = j = k = 0;
    struct Array *arr3 = (struct Array *)malloc(sizeof(struct Array));

    while(i < arr1->length && j < arr2->length)
    {
    if(arr1->A[i] < arr2->A[j])
        arr3->A[k++] = arr1->A[i++];
    else if(arr2->A[j] < arr1->A[i])
        j++;
    else
        {
            i++; 
            j++;
        }
    }

    for( ; i < arr1->length; i++)
        arr3->A[k++] = arr1->A[i];

    arr3->length = k;
    arr3->size = 10;
    return arr3;
}

int main()
{
    struct Array arr1 = { { 2,9,21,28,35 }, 10, 5};
    struct Array arr1 = { { 2,3,9,18,28 }, 10, 5};
    struct Array *arr3;

    arr3 = Union(&arr1, &arr2);
    Display(*arr3);
    return 0;
}
```
