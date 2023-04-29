# Merge sorting #

The method continually divides an array in half until there are two singleton arrays. The helper method ```mergeArrays()``` then proceeds to copy across all elements from "array" to the working array ("array" will retain sorted elements on each iteration). Then it copies the element with the lowest value from the pair and update the index (the working lower or upper) accordingly. This repeats until the lower or upper pointers reaches the current array boundary. If the upper indexed elements were sent to the front, then all remaining lower indexed elements (which would have higher value) are copied across. Time complexity is ```O(n (log[2]n))```.

```java
public class MergeSort {

    void startMergeSort(int[] array){
        int[] workingArray = new int[array.length];

        // split up the array into half until the lower index is the same 
        // as the upper index
        mergesort(array, workingArray, 0, array.length - 1);
    }

    void mergesort(int[] array, int[] workingArray, int lowerIndex, int upperIndex){
        if (lowerIndex < upperIndex){
            int halfwayPoint = lowerIndex + (upperIndex - lowerIndex)/2;

            // try to find the new indices again
            mergesort(array, workingArray, lowerIndex, halfwayPoint);
            mergesort(array, workingArray, halfwayPoint+1, upperIndex);

            // by now, the element indices would have been set such 
            // that (lowerIndex = upperIndex) i.e. a singleton array
            mergeArrays(array, workingArray, lowerIndex, halfwayPoint, upperIndex);
        }
    }

    // called when lowerIndex < upperIndex
    void mergeArrays(
      int[] array, int[] workingArray, int lowerIndex, int halfwayPoint, int upperIndex){
        
        for (int i = lowerIndex; i <= upperIndex; i++){
            workingArray[i] = array[i];
        }

        int workingLowerIndex = lowerIndex;
        int workingUpperIndex = halfwayPoint + 1;
        int currentLowest = lowerIndex;

        while (workingLowerIndex <= halfwayPoint && workingUpperIndex <= upperIndex){
            if (workingArray[workingLowerIndex] <= workingArray[workingUpperIndex]) {
                array[currentLowest] = workingArray[workingLowerIndex];
                workingLowerIndex++;
            } else {
                array[currentLowest] = workingArray[workingUpperIndex];
                workingUpperIndex++;
            }
            currentLowest++;
        }

        int elementsRemaining = halfwayPoint - workingLowerIndex;
        for (int i = 0; i <= elementsRemaining; i++){
            array[currentLowest + i] = workingArray[workingLowerIndex + i];
        }
    }
  }
```