---
title: Synchronisation blocks and synchronised methods
nav_order: 12
parent: Intermediate Java
---

# Synchronisation blocks

'Thread-safe' code is that in which thread interference is not possible. Methods which can only be called within synchronised code are wait(), notify() and notifyAll(). The example shows these methods with a producer and a consumer example. Some methods are 'atomic' in that all threads cannot interrupt any part of the operation of an atomic method.

This also highlights 'deadlocks' on objects, where a thread has not released a handle on an object. An object lock is released with the notify() or notifyAll() methods. A thread waits to be notified of a release, with either notify() or nootifyAll(), with wait().

```java
public class Main {
  
    public static void main(String[] args) {
      Message message = new Message();
      
      // *the order in which these threads appear matters not; 
      // one handles read() and the other handles write()
      (new Thread(new Writer(message))).start();
      (new Thread(new Reader(message))).start();	
    }
  }
  
  class Message{
    
    private String message;
    private boolean empty = true;
    
    // different threads cannot execute read and write at 
    // the same time on the same object (they can on different objects);
    // as soon as one is called, the lock is handed to the calling method 
    // and only allows the other thread execute if it finishes or when the thread runs 
    // notify() or notifyAll()
    
    // *suppose that read() runs first, it is guaranteed to loop; it 
    // allows write() in by calling wait();
    // write() swaps the flag (it has joint access to empty), then goes 
    // straight to assigning the first message
    // fragment, then calls notifiyAll() to say to read() that it can resume; 
    // by then empty is set to false and read proceeds after its loop
    
    // *if write runs first then it skips the loop (empty was initially true)
    // and writes a String fragment

    public synchronized String read() {
      while(empty) {
        try {
          wait();
        } catch(InterruptedException e) {
          System.out.println(e);
        }
      }

      empty = true;
      notifyAll();

      return message;
    }
    
    public synchronized void write(String message) {
      while(!empty) {
        try {
          wait();
        } catch(InterruptedException e) {
          System.out.println(e);
        }
      }
      empty = false;
      this.message = message;
      notifyAll();
    }
  }
  
  // Writer writes Strings to a object (not console), with randomly 
  // chosen time intervals (<= 2 sec) in between Strings

  class Writer implements Runnable{
    private Message message;
    
    public Writer(Message message) {
      this.message = message;
    }
    
    public void run() {
      String messages[] = {
          "Humpty Dumpty sat on a wall",
          "Humpty Dumpty had a great fall",
          "All the King's horses and all the King's men",
          "Couldn't put Humpty back together again"
      };
      
      Random random = new Random();
      
      for(int i = 0; i < messages.length; i++) {
        message.write(messages[i]);
        try {
          // build an int between 0 and 2000
          Thread.sleep(random.nextInt(2000));
        } catch(InterruptedException e) {
          System.out.println(e);
        }
      }
      
      // this last command triggers Reader to also terminate 
      message.write("Finished");
    }
  }
  
  class Reader implements Runnable{
    private Message message;
    
    public Reader(Message message) {
      this.message = message;
    }
    
    public void run() {
      Random random = new Random();
      for(String latestMessage = message.read(); !latestMessage.equals("Finished");
       latestMessage = message.read()) {
        System.out.println(latestMessage);
        try {Thread.sleep(random.nextInt(2000));
        } catch(InterruptedException e) {
          System.out.println(e);
        }
      }
    }
}
```

Another example shown below demonstrates how two consumers and one producer work in tandem. ArrayLists are not thread-safe, hence the ArrayList "buffer" is protected from thread interference with a dedicated synchronisation block.

```java
public class Main {
	
    public static final String EOF = "EOF";
  
    public static void main(String[] args) {
      // consumer - reader
      // producer - writer to a buffer
      List<String> buffer = new ArrayList<>();
      
      // three threads accessing the same object, buffer
      MyProducer producer = new MyProducer(buffer);
      MyConsumer consumer1 = new MyConsumer(buffer);
      MyConsumer consumer2 = new MyConsumer(buffer);
      
      new Thread(producer).start();
      new Thread(consumer1).start();
      new Thread(consumer2).start();
    }
  
  }
  
  // writes to a list
  class MyProducer implements Runnable{
    
    private List<String> buffer;
    
    public MyProducer(List<String> buffer) {
      this.buffer = buffer;
    }
    
    public void run() {
      Random random = new Random();
      String[] nums = {"1", "2", "3", "4", "5"};
      
      for(String num: nums) {
        try {
          System.out.println(colour + "Adding..." + num);

          // this prevents two or more threads from changing the ArrayList
          synchronized (buffer) {
            buffer.add(num);
          }

          Thread.sleep(random.nextInt(1000));
        } catch(InterruptedException e) {
          System.out.println("Producer was interrupted");
        }
      }
      
      System.out.println(colour + "Adding EOF and exiting...");
      synchronized (buffer) {
        buffer.add(Main.EOF);
      }
    }
  }
  
  // prints then removes from a list (opens possibility for thread interference)
  class MyConsumer implements Runnable{
    
    private List<String> buffer;
    
    public MyConsumer(List<String> buffer) {
      this.buffer = buffer;
    }
    
    public void run() {
      while(true) {
        synchronized (buffer) {
          if(buffer.isEmpty()) {
            continue;
            // keeps looping until something is present
          }
          if(buffer.get(0).equals(Main.EOF)) {
            System.out.println("Exiting");
            break;
          } else {
            // print out and remove a String from the list
            System.out.println("Removed " + buffer.remove(0));
          }
        }
      }
    }
}
```

Synchronisation blocks must start and stop in the same method. There are numerous issues with synchronisation, including: 

+ Blocked threads cannot continue or execute a timeout clause beyond a synchronisation block until they receive the lock; they're stuck indefinitely
+ Fundamental lock status is not accessible at run-time
+ Multiple threads waiting for the same lock are awarded the lock on a somewhat random basis, not according to FIFO. While priorities can be set, they should be considered 'suggestions'.

## Introducing Java Util Concurrent

The Java Util Concurrent package attempts to address some of these issues. With more manual control of locks and what can occur while threads are blocked, the above is revised as follows:

```java
public class Main {
    
    public static final String EOF = "EOF";
  
    public static void main(String[] args) {

      List<String> buffer = new ArrayList<>();

      // bufferlock handles locks of objects and monitors 
      // the number of locks and therefore unlock required
      // when locks >> unlocks, or unlocks >> locks, then an exception is thrown
      ReentrantLock bufferlock = new ReentrantLock();
      
      // create a Thread Pool with three threads (this is 
      // not strictly necessary in this application with few
      // threads but valuable for projects with large numbers 
      // of threads which can be managed by the JVM). This
      // needs shutting down at the end of the program
      ExecutorService executorService = Executors.newFixedThreadPool(3);
      
      // three threads accessing the same object, buffer
      MyProducer producer = new MyProducer(buffer, bufferlock);
      MyConsumer consumer1 = new MyConsumer(buffer, bufferlock);
      MyConsumer consumer2 = new MyConsumer(buffer, bufferlock);
      
      executorService.execute(producer);
      executorService.execute(consumer1);
      executorService.execute(consumer2);
      
      // shutdowns when all threads have completed their
      // tasks (use shutdownNow() for immediate shutdown)
      executorService.shutdown();
    }
  
  }
  
  class MyProducer implements Runnable{
    
    private List<String> buffer;
    private ReentrantLock bufferlock;
    
    public MyProducer(List<String> buffer,
      ReentrantLock bufferlock) {
      this.buffer = buffer;
      this.bufferlock = bufferlock;
    }
    
    public void run() {
      Random random = new Random();
      String[] nums = {"1", "2", "3", "4", "5"};
      
      for(String num: nums) {
        try {
          System.out.println("Adding..." + num);

          // alternative to synchronisation (make sure you unlock!!)
          // the code waits here until the lock is released elsewhere
          bufferlock.lock();

          try {
            buffer.add(num);
          } finally {
            bufferlock.unlock();
          }		
          
          Thread.sleep(random.nextInt(1000));
        } catch(InterruptedException e) {
          System.out.println("Producer was interrupted");
        }
      }
      
      System.out.println("Adding EOF and exiting...");
      bufferlock.lock();

      try {
        buffer.add(Main.EOF);
      } finally {
        bufferlock.unlock();
      }
    }
  }
  
  class MyConsumer implements Runnable{
    
    private List<String> buffer;
    private ReentrantLock bufferlock;
    
    public MyConsumer(List<String> buffer,
      ReentrantLock bufferlock) {
      this.buffer = buffer;
      this.bufferlock = bufferlock;
    }
    
    public void run() {
      while(true) {
        bufferlock.lock();

        try {
          if(buffer.isEmpty()) {
            continue;
          }
          if(buffer.get(0).equals(Main.EOF)) {
            System.out.println("Exiting");
            break;
          } else {
            System.out.println("Removed " + buffer.remove(0));
          }
        } finally {
          bufferlock.unlock();
        }			
      }
    }
  }
```
