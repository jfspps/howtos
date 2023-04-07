# Threads in Java

This project highlights the implementation of separate threads in Java, by either implementing the Runnable interface (generally more convenient)...

```java
public class MyRunnable implements Runnable {

    // executes one its own thread
    @Override
    public void run() {
        // do stuff in a runnable thread
    } 
}
```

...or by extending a required class from the Thread class.

```java
public class AnotherThread extends Thread {

    @Override
    public void run() {
      // an instance of AnotherThread runs on its own thread
    }
}
```

The main() method then starts its own thread and manages all others.

```java
public static void main(String[] args) {

    // methods called here run in main() thread
    System.out.println(someString);

    // start the thread class
    Thread anotherThread = new AnotherThread();
    anotherThread.start();

    // definition only
    Thread myRunnableThread = new Thread(new MyRunnable() {
        // override MyRunnable run() again!
        @Override
        public void run() {
            // join two threads: the thread which joins waits for the other to terminate
            // before continuing
            try {
                // wait for up to 2000 ms for AnotherThread to finish...
                anotherThread.join(2000);

                // ...then continue (regardless if anotherThread dies or not)
                System.out.println("anotherThread finished or 2 secs have elapsed");

            } catch (InterruptedException e) {
                System.out.println("myRunnableThread interrupted");
            }
        }
    });

    // note that the above myRunnableThread hasn't been invoked yet; start with start()
    myRunnableThread.start();

    // interrupt anotherThread
    anotherThread.interrupt();

}
```

Two methods of note are ```threadX.interrupt()``` to interrupt the given threadX and ```threadY.join()```, which enables a one to run right after (and on) the same thread, threadY, after threadY has finished its execution. The ```join()``` method is useful when threadY needs to finish something (e.g. completing database transactions). The code which runs after the ```join()``` method is executed when threadY has finished.

Entering a parameter to ```join()``` sets the timeout for ```threadY.join()``` to wait, like ```threadY.join(2000)```. This will set a time limit for the threadY to complete. If the time passes, then the statements proceeding ```join()``` will run regardless if threadY finished or not.

The GitHub repo for the above example is [here](https://github.com/jfspps/JavaThreadsDemo).
