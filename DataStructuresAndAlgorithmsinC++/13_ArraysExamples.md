---
title: Examples of algorithms on arrays
nav_order: 13
parent: Data Structures and Algorithms in C++
---

# Examples of algorithms on arrays

The code below comes straight from the [code example](/code/ArrayExamples). They all use the following structure:

```cpp
struct Array
{
    int size;           //represents the number of elements with user-defined values
    int length;         //represents the total number of elements currently available (must be <= 20)
    int A[20];
};
```

## Finding out if there is a missing element in an array, O(n)

```cpp
void findMissingSorted(struct Array arr)
{
    int current;
    for (int i = 0; i < arr.length; i++)
    {
        if (arr.A[i+1] - arr.A[i] > 1)
        {
            cout << "Found a missing value between element: " << i << ", value change of " << arr.A[i] << " to " << arr.A[i+1] << "\n";
            return;
        }
    }
    cout << "Nothing missing here";
}
```

## Finding out if there are multiple missing elements in an array, O(n)

```cpp
void findMultipleMissingSorted(struct Array arr, struct Array* tally)
{
    bool found = false;
    for (int i = 0; i < arr.length; i++)
    {
        if (arr.A[i+1] - arr.A[i] > 1)
        {
            tally->A[i] = -1;
            cout << "Found a missing value between element: " << i << ", value change of " << arr.A[i] << " to " << arr.A[i+1] << "\n";
            found = true;
        }
        else
            tally->A[i] = 0;
    }
    if (!found)
        cout << "Nothing missing here";
}
```

## Finding duplicates in an array, O(n)

```cpp
void findDuplicates(struct Array arr)
{
    bool found = false;
    for (int i = 0; i < arr.length; i++)
    {
        if (arr.A[i+1] == arr.A[i])
        {
            cout << "Found duplicate values at elements " << i << " and " << i+1 << " with a value of " << arr.A[i] << "\n";
            found = true;
        }
    }
    if (!found)
        cout << "Nothing missing here";
}
```

## Finding duplicates in an unsorted array, O(n^2)

```cpp
void findDuplicatesUnsorted(struct Array arr)
{
    //temp records the index where the duplicate is found
    struct Array temp = {arr.size, arr.length, {0}};
    bool found = false;

    for (int i = 0; i < arr.length ; i++)
    {
        for (int j = i+1; j < arr.length; j++)
        {
            if (arr.A[i] == arr.A[j])
            {
                temp.A[i] = j;
                found = true;
                cout << "Found duplicate values at elements " << i << " and " << temp.A[i] << " with a value of " << arr.A[i] << "\n";
                break;
            }
        }
    }

    if (!found)
    {
        cout << "No duplicates found";
    }
}
```

## Finding a pair of elements with the sum 'sum' over a sorted array (increasing, non-repeating only), O(n)

```cpp
void findPairWithSumSortedInc(struct Array arr, int sum)
{
    bool found = false;
    int i = 0, j = arr.length;

    while (i < j)
    {
        if (arr.A[i] + arr.A[j] == sum)
        {
            found = true;
            cout << "Found two values at elements " << i << " and " << j << " with a sum of " << sum << "\n";
            i++;
            j--;
        }
        else if (arr.A[i] + arr.A[j] > sum)
            j--;
        else
            i++;
    }

    if (!found)
    {
        cout << "No operands found";
    }
}
```

## Finding a pair of elements with the sum 'sum' in a sorted/unsorted array (O(n^2))

```cpp
void findPairWithSumGeneral(struct Array arr, int sum)
{
    //temp records the index where the other operand is found
    struct Array temp = {arr.size, arr.length, {0}};
    bool found = false;

    for (int i = 0; i < arr.length ; i++)
    {
        for (int j = i+1; j < arr.length; j++)
        {
            if (arr.A[i] + arr.A[j] == sum)
            {
                temp.A[i] = j;
                found = true;
                cout << "Found two values at elements " << i << " and " << temp.A[i] << " with a sum of " << sum << "\n";
            }
        }
    }

    if (!found)
    {
        cout << "No operands found";
    }
}
```

## Finding the max and min of an array in one scan (O(n))

```cpp
void findMaxAndMin(struct Array arr)
{
    if (arr.length < 2)
    {
        cout << "Need an array of size >= 2" << "\n";
        return;
    }

    int minimum, maximum;
    if (arr.A[0] >= arr.A[1])
    {
        minimum = arr.A[1];
        maximum = arr.A[0];
    }
    else
    {
        minimum = arr.A[0];
        maximum = arr.A[1];
    }

    for (int i = 2; i < arr.length; i++)
    {
        if (arr.A[i] < minimum)
        {
            minimum = arr.A[i];
        }
        else if (arr.A[i] > maximum)
        {
            maximum = arr.A[i];
        }
    }
    cout << "The maximum value is " << maximum << " and the minimum value is " << minimum << "\n";
}
```
