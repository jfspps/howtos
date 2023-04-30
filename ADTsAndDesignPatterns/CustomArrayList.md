---
title: The ArrayList
nav_order: 3
parent: ADTs and Design Patterns in Java
---

# The ArrayList

This represents how one way to implement the well-known ArrayList data type.

```java
public class ArrayList<T> {

    private T[] arrayList;
    private int capacity;
    private int length;

    public ArrayList(int capacity) {
        if (capacity == 0){
            this.capacity = 1;
        } else
            this.capacity = capacity;

        this.arrayList = (T[]) new Object[this.capacity];
        this.length = 0;
    }

    /**
     * Adds a new element to array at the lowest-index null
     * element (not necessarily the end of the array).
     * The array capacity increases automatically when the 
     * number of free elements remaining is one.
     *
     * @param newElement - element to be added
     */
    public void add(T newElement){
        if (length > 0 && capacity - length < 2){
            ArrayList<T> newArray = new ArrayList<>(2 * this.capacity);
            int thisLength = clone(newArray);

            newArray.arrayList[thisLength] = newElement;

            // re-reference this.arrayList and properties
            this.arrayList = newArray.arrayList;
            this.capacity = newArray.capacity;
            this.length++;
        } else {
            // get to the next null element
            int j = 0;
            while (this.arrayList[j] != null){
                j++;
            }
            this.arrayList[j] = newElement;

            // only increment this.length if newElement was added at the end
            if (j == length){
                this.length++;
            }
        }
    }

    /**
     * Helper function that copies this.arrayList to a new array.
     *
     * @param newArray - reference to array clone
     * @return number of elements copied (length of array copied)
     */
    private int clone(ArrayList<T> newArray) {
        int i;
        for (i = 0; i < this.length; i++) {
            newArray.arrayList[i] = this.arrayList[i];
        }
        return i;
    }

    /**
     * Returns the length or size of the array
     *
     * @return index of element that proceeds the last non-null element
     */
    public int size(){
        return this.length;
    }


    /**
     * Determines if an array is empty or not
     *
     * @return true if empty and false if not
     */
    public boolean isEmpty(){
        return this.length == 0;
    }

    /**
     * Retrieves the element (which can be null) at the supplied 
     * index and returns null if not found.
     *
     * @param index - index of element requested
     * @return data of the element with the supplied index
     */
    public T get(int index){
        if (index < length){
            return this.arrayList[index];
        } else
            return null;
    }

    /**
     * Clears the entire array and pads all elements as null, 
     * while resetting the length to zero.
     *
     * The capacity of and reference to the array are not changed.
     */
    public void clear(){
        // use the same memory allocation
        for (int i = 0; i < this.length; i++){
            this.arrayList[i] = null;
        }
        this.length = 0;
    }

    /**
     * Searches for the first element with the given data
     *
     * @param data value or data sought after
     * @return index of the first element found; -1 if none found
     */
    public int indexOf(T data){
        for (int i = 0; i < this.length; i++){
            if (this.arrayList[i] == data){
                return i;
            }
        }
        return -1;
    }

    /**
     * Sets the first element found as null, returning the element
     * (which can be null) if valid and null if not.
     *
     * @param data nullable data to be removed
     * @return data of the element removed (can be null); 
     * null if data not found
     */
    public T removeElement(T data){
        int index = this.indexOf(data);
        T temp = null;

        if (index >= 0){
            temp = this.arrayList[index];
            this.arrayList[index] = null;
            if (index == length - 1){
                this.length--;
            }
        }
        return temp;
    }

    /**
     * Sets the element at the provided index to null.
     *
     * @param index index of the element to be removed
     * @return data of element removed (can be null)
     */
    public T removeAtIndex(int index){
        T temp = null;
        if (index >= 0){
            temp = this.get(index);
            this.arrayList[index] = null;
        }
        return temp;
    }

    /**
     * Assigns the element with the data passed.
     *
     * This method is equivalent to addAtIndex(), and expands the 
     * array as necessary to accommodate the newElement.
     *
     * @param data data to be assigned to the element
     * @param index index of element to be set (this can be out of 
     * bounds of the array, the array will adjust length as
     *              required)
     */
    public void set(T data, int index){
        if (index < 0){
            return;
        }

        if (index < length){
            this.arrayList[index] = data;
        } else {
            // build a new array just large enough
            ArrayList<T> newArray = new ArrayList<>(index+1);
            this.clone(newArray);

            newArray.arrayList[index] = data;
            this.arrayList = newArray.arrayList;
            this.length = index + 1;
            this.capacity = newArray.capacity;
        }
    }
  }
```