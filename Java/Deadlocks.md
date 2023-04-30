---
title: Deadlocks
nav_order: 3
parent: Intermediate Java
---

# Deadlocks

The deadlock arises because each thread is trying to acquire locks in different order. For example, thread1 seeks lock 1 then lock 2; thread2 seeks lock 2 then lock 1. If they tried to seek both locks in the same order then a deadlock would not occur. These issues can be further complicated with more locks.

```java
public class Main {
    
    // locks are fundamental of all Java objects
    public static Object lock1 = new Object();
    public static Object lock2 = new Object();
    
    public static void main(String[] args) {
      new Thread1().start();
      new Thread2().start();
    }
  
    private static class Thread1 extends Thread {
      
      public void run() {
        // grab lock 1
        synchronized (lock1) {
          System.out.println("Thread 1 has lock 1");
          try {
            Thread.sleep(100);
          } catch(InterruptedException e) {
            
          }
          System.out.println("Thread 1 waiting for lock 2");
          
          // try to grab lock 2 (this is where the problems start)
          synchronized (lock2) {
            System.out.println("Thread 1 has lock 1 and lock 2");
          }
          System.out.println("Thread 1 released lock 2");
        }
        System.out.println("Thread 1 released lock 1, exiting...");
      }
    }
    
    private static class Thread2 extends Thread {
        
        public void run() {
          // changing lock2 <-> lock1 (and the readout messages) 
          // in this block would direct Thread2 to request 
          // locks in the same order as Thread1 and circumvent deadlocks
          synchronized (lock2) {
            System.out.println("Thread 2 has lock 2");
            try {
              Thread.sleep(100);
            } catch(InterruptedException e) {
              
            }
            System.out.println("Thread 2 waiting for lock 1");

            // try to grab lock 1 (this is where the problems start)
            synchronized (lock1) {
              // written in the order the locks would have been obtained
              System.out.println("Thread 2 has lock 2 and lock 1");
            }
            System.out.println("Thread 2 released lock 2");
          }
          System.out.println("Thread 2 released lock 1, exiting...");
        }
    }
}
```

## Starvation

Starvation describes a situation where a thread is unable to gain regular access to shared resources and is unable to make progress. This happens when shared resources are made unavailable for long periods by "greedy" threads. The problem is due to how threads are prioritised. As already mentioned, priorities are not binding or contractual as far the OS is concerned.

```java
public class Main {

    private static Object lock = new Object();
        
    public static void main(String args[]) {
      Thread t1 = new Thread(new Worker(ThreadColour.ANSI_RED), "Priority 10");
      Thread t2 = new Thread(new Worker(ThreadColour.ANSI_BLUE), "Priority 8");
      Thread t3 = new Thread(new Worker(ThreadColour.ANSI_GREEN), "Priority 6");
      Thread t4 = new Thread(new Worker(ThreadColour.ANSI_CYAN), "Priority 4");
      Thread t5 = new Thread(new Worker(ThreadColour.ANSI_PURPLE), "Priority 2");
      
      // OS suggestion only; not binding
      t1.setPriority(10);
      t2.setPriority(8);
      t3.setPriority(6);
      t4.setPriority(4);
      t5.setPriority(2);
      
      // note how, on execution, the priority is not fully 
      // predetermined here (even by changing the order given here)
      // but decided by the OS (also, try commenting out the 
      // setPriority() functions)
      t1.start();
      t2.start();
      t3.start();
      t4.start();
      t5.start();
    }
       
    // static inner classes (as opposed to regular inner classes) 
    // do not have reference to their outer class; using an inner class makes 
    // lock private and hidden
    public static class Worker implements Runnable {

      private int runCount = 1;
      private String threadColour;
      
      public Worker(String threadColour) {
        this.threadColour = threadColour;
      }
      
      @Override
      public void run() {
        for(int i = 0; i < 100; i++) {
          //as shown in main(), each thread will share the same lock
          synchronized (lock) {
            System.out.format(threadColour + "%s: runCount = %d\\n", 
            Thread.currentThread().getName(), runCount++);
          }
        }
      }
    }
}
```
