# The Queue data type #

This represents an example showing how to implement a queue.

```java
public class Queue<T> {

    // like the Stack class, a Queue is implemented with a linked list 
    // and accessed/viewed through public methods
    private static class QueueNode<T> {
        private T data;
        private QueueNode<T> next;

        public QueueNode(T data){
            this.data = data;
        }
    }

    // references to the first and last node or element in the queue
    private QueueNode<T> front;
    private QueueNode<T> back;

    /**
     * Adds a new node or element to the back of the queue. New node's 
     * data can be null.
     * */
    public void enqueue(T item){
        QueueNode<T> newNode = new QueueNode<>(item);

        // if queue is not empty then update last property
        if (back != null){
            back.next = newNode;
        }

        back = newNode;

        // account for a new queue by setting first to newNode
        if (front == null) {
            front = back;
        }
    }

    /**
     * Removes and returns the node's data (which can be null) at the 
     * front of the queue.
     * Throws a NoSuchElementException if the queue is empty.
     * */
    public T dequeue(){
        if (front == null){
            throw new NoSuchElementException();
        }

        //get the first item's data and then update the queue
        T data = front.data;
        front = front.next;

        // if the queue is empty, then update last
        if (front == null){
            back = null;
        }
        return data;
    }

    /**
     * Returns a copy of the the node's data (which can be null) at the 
     * front of the queue.
     * Throws a NoSuchElementException if the queue is empty.
     * */
    public T peek(){
        if (front == null){
            throw new NoSuchElementException();
        }
        return front.data;
    }

    /**
     * Returns true if the queue is empty and false if not
     * */
    public boolean isEmpty(){
        return front == null;
    }
  }
```
