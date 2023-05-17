---
title: The Linked List
nav_order: 6
parent: ADTs and Design Patterns in Java
---

# The Linked List

This represents how one way to implement a [linked list](../DataStructuresAndAlgorithmsinC%2B%2B/17_LinkedLists.md) data type.

```java
public class LinkedList<T> {
    LinkedList<T> next = null;
    private T data;

    public LinkedList(T data) {
        this.data = data;
    }

    public LinkedList(T[] arrayOfT){
        if (arrayOfT.length == 0){
            System.out.println("Cannot build from an empty array");
            return;
        }
        //assign the Head node
        int index = 0;
        LinkedList<T> currentNode = this;
        currentNode.data = arrayOfT[index++];

        // note that data can be null; criteria is not to retrieve outOfBounds for arrayT
        while (index < arrayOfT.length){
            LinkedList<T> newNode = new LinkedList<>(arrayOfT[index]);
            currentNode.next = newNode;
            currentNode = newNode;
            index++;
        }
    }

    /**
     * Traverses the entire list to find the length. Is always O(n)
     * */
    public int length(){
        int count = 0;
        LinkedList<T> linkedList = this;

        while (linkedList != null){
            count++;
            linkedList = linkedList.next;
        }
        return count;
    }

    /**
     * Retrieves the data from the current linked list node
     * */
    public T getData() {
        return this.data;
    }

    /**
     * getNode() traverses the list and returns the first instance of LinkedList with 
     * given data, hence O(n); can also be used to check if data is present
    */
    public LinkedList<T> getNode(T data){
        if (this.data == data){
            return this;
        }
        LinkedList<T> currentNode = this;
        while (currentNode.next != null){
            if (currentNode.next.data == data){
                return currentNode.next;
            }
            currentNode = currentNode.next;
        }
        System.out.println("Data not found");
        return null;
    }

    /**
     * Determines is a given node reference is valid for the list; 
     * time complexity is O(n)
     */
    public boolean nodeIsPresent(LinkedList<T> node){
        if (this == node){
            return true;
        }
        LinkedList<T> currentNode = this;
        while (currentNode.next != null){
            if (currentNode.next == node){
                return true;
            }
            currentNode = currentNode.next;
        }
        return false;
    }

    /**
     * Adds to an array of references to LinkedLists, from index i (inc.), which have 
     * the value data; searches the entire list, so is always O(n)
     */
    public LinkedList<T>[] getNodeList(T data, int i){
        LinkedList<T> currentNode = this;
        int currentLength = this.length();

        if (i >= currentLength){
            System.out.println("Given index is out of bounds");
            return null;
        }

        LinkedList<T>[] tempArray = new LinkedList[currentLength];
        int tempArrayLength = 0;

        if (currentNode.data == data){
            tempArray[tempArrayLength++] = currentNode;
        }

        while (currentNode.next != null){
            if (currentNode.next.data == data)
                tempArray[tempArrayLength++] = currentNode.next;

            currentNode = currentNode.next;
        }
        System.out.println("Found " + tempArrayLength + " nodes");

        //build a new array minus the terminal null elements
        LinkedList<T>[] returnArray = new LinkedList[tempArrayLength];

        for (int k = 0; k < tempArrayLength; k++){
            returnArray[k] = tempArray[k];
        }

        return returnArray;
    }

    // -----append methods: ------------------------------------------------------------

    /**
     * Appends data to the end of the list; time complexity is O(n)
     * LinkedList instances cannot be null but data can be null
     * */
    public void append(T data){
        LinkedList<T> newEnd = new LinkedList<>(data);      // new Node referenced by newEnd
        LinkedList<T> thisLinkedList = this;                // grab head node

        // traverse list and append to the tail
        while (thisLinkedList.next != null){
            thisLinkedList = thisLinkedList.next;
        }
        thisLinkedList.next = newEnd;
    }

    /**
     * Appends a node to the end of the list; time complexity is O(n)
     * LinkedList (nodes) instances cannot be null but data can be null
     * */
    public void append(LinkedList<T> next){
        if (next == null){
            System.out.println("Cannot append null node");
            return;
        }
        LinkedList<T> thisLinkedList = this;           // grab this Node

        // traverse list and append to the tail
        while (thisLinkedList.next != null){
            thisLinkedList = thisLinkedList.next;
        }
        thisLinkedList.next = next;
    }

    /**
     * Appends an array of nodes, preserving the order, to the tail of the current 
     * linked list; time complexity is O(n)
     * */
    public void append(T[] array){
        if (array.length != 0){
            LinkedList<T> newList = new LinkedList<>(array);
            LinkedList<T> currentNode = this;

            while (currentNode.next != null){
                currentNode = currentNode.next;
            }

            currentNode.next = newList;
        }
    }

    // -------insert methods: -----------------------------------------------------------

    /**
     * Inserts a node after the first occurrence of precedingData;
     * returns a reference to inserted node if inserted and null if not
     * getNode() is O(n), thus insert() is also O(n)
     */
    public LinkedList<T> insert(T precedingData, T data){
        LinkedList<T> precedingNode = getNode(precedingData);

        // check data is somewhere in the list
        if (precedingNode == null){
            return null;
        }

        LinkedList<T> newNode = new LinkedList<>(data);
        newNode.next = precedingNode.next.next;
        precedingNode.next = newNode;
        return newNode;
    }

    /**
     * Inserts after the given node; nodeIsPresent() is O(n) so insert() is also O(n)
     */
    public LinkedList<T> insert(LinkedList<T> precedingNode, T data){
        if (precedingNode == null){
            System.out.println("Cannot insert a null node");
            return null;
        }

        if (!this.nodeIsPresent(precedingNode)) {
            System.out.println("Node not part of this list");
            return null;
        }

        LinkedList<T> proceedingNode = precedingNode.next;
        LinkedList<T> newNode = new LinkedList<>(data);
        precedingNode.next = newNode;
        newNode.next = proceedingNode;
        return newNode;
    }

    // -----delete methods: updates the next property; garbage collection will clear up heap

    /**
     * Deletes the first node with given nodeData, if present; time complexity is O(n)
     * returns a reference to the second node (which can be null) if the head is deleted, 
     * and returns head otherwise;
     */
    public LinkedList<T> deleteData(T nodeData){
        LinkedList<T> currentLinkedList = this;

        // if head holds requisite data, return head.next
        if (currentLinkedList.data == nodeData){
            LinkedList<T> secondNode = currentLinkedList.next;
            currentLinkedList.next = null;
            if (secondNode == null) {
                System.out.println("Linked list is empty");
            }
            return secondNode;   // could be null
        }

        // still at head; traverse Node until data found
        while (currentLinkedList.next != null){
            if (currentLinkedList.next.data == nodeData){
                currentLinkedList.next = currentLinkedList.next.next;
                return this;
            }
            currentLinkedList = currentLinkedList.next;
        }

        System.out.println("Data not found; nothing deleted");
        return this;
    }

    /**
     * Deletes all nodes with the given data, if present. Cycles through the entire list, 
     * hence is always O(n);
     * Returns a reference to the first (head) node of the updated list and null if the 
     * list is emptied
     * */
    public LinkedList<T> deleteAllOf(T data){
        LinkedList<T> currentNode = this;       // traversal pointer
        LinkedList<T> currentHead = this;

        // delete all leading data values found and update head node
        while (currentHead != null && currentHead.data == data){
            currentHead = currentNode.next;
            currentNode.next = null;
            currentNode = currentHead;
        }

        // found an element.data != data; hence currentHead no longer involved
        while (currentNode != null && currentNode.next != null){
            if (currentNode.next.data == data){
                LinkedList<T> refNode = currentNode.next;
                currentNode.next = refNode.next;
                refNode.next = null;
            } else
                currentNode = currentNode.next;
        }

        return currentHead;
    }

    /**
     * Deletes the given node, if present; time complexity is O(n)
     * returns a reference to the second node (which can be null) if the head is deleted, 
     * and returns head otherwise;
     */
    public LinkedList<T> deleteNode(LinkedList<T> linkedList){
        if (this == linkedList){
            LinkedList<T> secondNode = this.next;
            this.next = null;
            if (secondNode == null)
                System.out.println("Linked list is empty");

            return secondNode;   // could be null
        }

        LinkedList<T> currentLinkedList = this;

        while (currentLinkedList.next != null){
            if (currentLinkedList.next == linkedList){
                currentLinkedList.next = currentLinkedList.next.next;
                System.out.println("Node with value " + linkedList.data + " deleted");
                return this;
            } else {
                currentLinkedList = currentLinkedList.next;
            }
        }

        System.out.println("Node not found; nothing deleted");
        return this;
    }

    // -----print methods: attempts to print a String of data----------------------------
    // time complexity depends on the number of nodes to process; printing lists is O(n), 
    // printing nodes is O(1)

    /**
     * Returns a string of the linked list; time complexity is always O(n)
     */
    public String printToString(){
        StringBuilder stringBuilder = new StringBuilder();

        if (this.next == null){
            stringBuilder.append("(Head) ").append(this.data).append(" (Tail)");
            return stringBuilder.toString();
        }
        stringBuilder.append("(Head) ").append(this.data).append(", ");

        LinkedList<T> currentLinkedList = this.next;
        while (currentLinkedList.next != null){
            stringBuilder.append(currentLinkedList.data).append(", ");
            currentLinkedList = currentLinkedList.next;
        }
        stringBuilder.append(currentLinkedList.data).append(" (Tail)");
        return stringBuilder.toString();
    }

    /**
     * Returns a string of the given node of the linked list;
     * checks if node is part of list so time complexity is O(n)
     */
    public String nodeToString(LinkedList<T> linkedList){
        if (!nodeIsPresent(linkedList))
            return "Node not found in list";

        return String.valueOf(linkedList.data);
    }

    /**
     * Returns a string of all nodes to the right of node k (inc.);
     * checks if k is part of list and cycles through nodes after k, so time complexity is O(n)
     */
    public String printRightPartition(LinkedList<T> k) {
        if (!nodeIsPresent(k))
            return "Node not found in list";

        StringBuilder stringBuilder = new StringBuilder();
        stringBuilder.append("Right-hand partition is: ");

        while (k.next !=null){
            stringBuilder.append(k.data).append(", ");
            k = k.next;
        }
        stringBuilder.append(k.data).append("; END");
        return stringBuilder.toString();
    }

    /**
     * Returns a string of all nodes to the left of node k (inc.);
     * checks if k is part of list and cycles through nodes after k, so time complexity is 
     * at worst O(n)
     */
    public String printLeftPartition(LinkedList<T> k){
        if (!nodeIsPresent(k))
            return "Node not found in list";

        StringBuilder stringBuilder = new StringBuilder();
        stringBuilder.append("Left-hand partition is: ");

        LinkedList<T> linkedList = this;
        while (linkedList.next != null && linkedList.next != k){
            stringBuilder.append(linkedList.data).append(", ");
            linkedList = linkedList.next;
        }
        stringBuilder.append(linkedList.data).append("; END");
        return stringBuilder.toString();
    }
  }
```