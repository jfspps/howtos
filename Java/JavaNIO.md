---
title: Java NIO files
nav_order: 7
parent: Intermediate Java
---

# Java NIO files

The Java NIO was introduced to provide a non-blocking implementation of Java IO. The speed and other design features
of Java NIO as to whether the newer package is more effective or preferable is still debated. Java NIO handles
streams in blocks of data.

## Text files (NIO with IO)

The first example below shows how text files are handled. In most cases, one uses a ```Path``` class with NIO and pass it
to an instance of a ```Files``` class.

```java
public someFunction() throws IOException {

    Path somePath = FileSystems.getDefault().getPath("textFileName.txt");

    try (BufferedWriter someBufferedWriter = Files.newBufferedWriter(somePath)) {

        for(...) {
          // write to the text file
          someBufferedWriter.write(pojo.getInt());
          ...
        }

    } catch(IOException e) {
        System.out.println("IOException: " + e.getMessage());
    }

    // reading from a text file
    try (Scanner scanner = new Scanner(
        Files.newBufferedReader(somePath))) {

        scanner.useDelimiter(",");

        while(scanner.hasNextLine()) {
            int someInt = scanner.nextInt();
            scanner.skip(scanner.delimiter());
            String someString = scanner.nextLine();
            ...
        }

    } catch(IOException e) {
        e.printStackTrace();
    }
}
```

## Binary files with serialisable objects (NIO with IO)

Handling of binary files with NIO as shown below. Take note of the exceptions covered:


```java
public someFunc() throws IOException {

Path somePath = FileSystems.getDefault().getPath("someFileName.dat");

try (ObjectOutputStream objectStream = 
    new ObjectOutputStream(
        new BufferedOutputStream(
            Files.newOutputStream(somePath)))) {

            for(...) {
            objectStream.writeObject(pojoInstance);
            }

}

// reading from a binary file
Path somePath = FileSystems.getDefault().getPath("someFileName.dat");
    try (ObjectInputStream someStream = 
        new ObjectInputStream(
            new BufferedInputStream(
                Files.newInputStream(somePath)))) {

                boolean eof = false;
                
                while(!eof) {
                    try {
                        POJO pojo = (POJO) someStream.readObject();
                        // do something with pojo
                        } catch(EOFException e) {
                        eof = true;
                    }
                }

    } catch(InvalidClassException e) {
        System.out.println("InvalidClassException " + e.getMessage());
    } catch(IOException e) {
        System.out.println("IOException " + e.getMessage());
    } catch(ClassNotFoundException e) {
        System.out.println("ClassNotFoundException " + e.getMessage());
    }
}
```

## Exclusive use of NIO

Some terminology:

+ A __channel__ is the data-source written to or read from
+ A __buffer__ is the container for the block of data passed (data must be of one type) and can be varied in length
+ __Selectors__ (mostly used in large enterprise development) allow a single thread to manage multiple channels

One channel can serve both reading and writing, and need not be buffered.

## Writing data to a binary file

```java
try {
      //JDK 8 or above only
    Path dataPath = FileSystems.getDefault().getPath("data.txt");

    // open, write the bytes then close the file in one go
    Files.write(dataPath, "\\nLine 5".getBytes("UTF-8"), StandardOpenOption.APPEND);

    // default is to read assuming UTF
    List<String> lines = Files.readAllLines(dataPath);

    for(String line : lines) {
    // do something with each line
    }

} catch(IOException e) {
    e.printStackTrace();
}
```

There are two methods which exemplify one of the main uses of Java NIO: ```wrap()``` and ```flip()```. 

The ```wrap()``` method:

+ ties the buffer with the byte array; changes to either one affects the other
+ sets the position (index of the next element, <= capacity) of the buffer to zero
+ the buffer's capacity (no. of elements) is set according to the size of the byte array (thus wrap() has a set capacity)
+ the buffer's mark (initially undefined and used as a custom pointer; buffer's reset() sets the pointer to mark's) is undefined

Each operation on the buffer (```getInt()``` and ```putInt()```, for example) advances the buffer's pointer one place forward. 
Quite often one needs to reset the pointer before reading or writing from/to the buffer. This is achieved with the ```flip()``` method. 
The ```flip()``` method also discards any custom mark. The example below writes Hello World followed by two Integers.

```java
try(
      FileOutputStream binFile = new FileOutputStream("data.dat");

      FileChannel binChannel = binFile.getChannel()) {

        byte[] outputBytes = "Hello World!".getBytes();

        // couple a Buffer to the array (no relation to data.dat yet)
        ByteBuffer buffer = ByteBuffer.wrap(outputBytes);

        // send buffer's data to, eventually, data.dat and confirm
        int numBytes = binChannel.write(buffer);
        System.out.println("numBytes written was: " + numBytes);
        // at this stage buffer's pointer is at the end of the buffer 
        // see read() snippet below***

        // start another buffer, with potentially different capacity
        // this time set by allocate() instead of wrap()
        ByteBuffer intBuffer = ByteBuffer.allocate(Integer.BYTES);

        // methods, including putInt() advance the buffer's position
        intBuffer.putInt(245);

        intBuffer.flip();

        // send intBuffer, now at the position zero, to data.dat
        numBytes = binChannel.write(intBuffer);
        System.out.println("numBytes written was: " + numBytes);

        // intBuffer can only store one Integer at a time so reset
        // Once reset, overwrite the previous value 245 with -98765 and 
        // then send it to data.dat
        intBuffer.flip();
        intBuffer.putInt(-98765);
        intBuffer.flip();
        numBytes = binChannel.write(intBuffer);
        System.out.println("numBytes written was: " + numBytes);

} catch(IOException e) {
  e.printStackTrace();
}
```

## Reading data from a binary file

The following section is a continuation of the above try block.

The ```read()``` method: ```public int read(byte[] b) throws IOException```

+ Reads some number of bytes from the input stream and stores them into the buffer array b. The number of bytes actually read is returned as an integer. This method blocks until input data is available, end of file is detected, or an exception is thrown.
    
+ If the length of b is zero, then no bytes are read and 0 is returned; otherwise, there is an attempt to read at
least one byte. If no byte is available because the stream is at the end of the file, the value -1 is returned;
otherwise, at least one byte is read and stored into b.
    
+ The first byte read is stored into element b[0], the next one into b[1], and so on. The number of bytes read is,
at most, equal to the length of b. Let k be the number of bytes actually read; these bytes will be stored in
elements b[0] through b[k-1], leaving elements b[k] through b[b.length-1] unaffected.

The following sends the input stream data (data.dat via channel) to 'buffer', with read(). Hint: whenever "flipping"
from read to write, or vice versa, always call ```flip()```.

```java
RandomAccessFile ra = new RandomAccessFile("data.dat", "rwd");
FileChannel channel = ra.getChannel();

// outputBytes is coupled to buffer; however, buffer pointer is at the end
// of the buffer *** see above write() snippet; 

// this only affects outputBytes not buffer (buffer pointer is at the end)
outputBytes[0] = 'a';
outputBytes[1] = 'b';

buffer.flip();
long numBytesRead = channel.read(buffer);

// reads all character bytes ("Hello World!" not "abllo World!" 
// since the buffer hasn't be updated)
if(buffer.hasArray()) {
  // print the entire array's contents
  System.out.println("byte buffer = " + new String(buffer.array()));
}
```

One can access a particular element of the buffer with absolute read. Consequently, there is no need to always call flip().

```java
// Absolute read (passed index to getInt())
intBuffer.flip();

numBytesRead = channel.read(intBuffer);
System.out.println(intBuffer.getInt(0));

intBuffer.flip();
numBytesRead = channel.read(intBuffer);
System.out.println(intBuffer.getInt(0));

channel.close();
ra.close();
```

With relative reads, the flip() method is used more often.

```java
// Relative read (no parameters passed to getInt())
intBuffer.flip();

numBytesRead = channel.read(intBuffer);
intBuffer.flip();

System.out.println(intBuffer.getInt());
intBuffer.flip();

numBytesRead = channel.read(intBuffer);
intBuffer.flip();
System.out.println(intBuffer.getInt());

channel.close();
ra.close();
```

## Copying files between channels and threads

Files are coupled to Java NIO channels, and as such, one can copy file contents via their channels. The following ```transferTo()``` sends data from someOtherChannel to someFileChannel.

```java
RandomAccessFile someFile = 
    new RandomAccessFile("someFileName.dat", "rw");

FileChannel someFileChannel = someFile.getChannel();

// optional: set the position from which other 
// channels start in someOtherChannel when transferring data
// from someOtherChannel
// someOtherChannel.position(0);

// transfers from someOtherChannel to someFileChannel
// returns the value transferred and is used here for confirmation
long someLong = someOtherChannel.transferTo(
  0, someOtherChannel.size(), someFileChannel);
```

Note that the position parameter is relative to the current position in the channel. One can also send data with respect to the destination channel with ```transferFrom()```. The following is equivalent to the above ```transferTo()```.

```java
RandomAccessFile someFile = 
    new RandomAccessFile("someFileName.dat", "rw");

FileChannel someFileChannel = someFile.getChannel();

// optional
// someOtherChannel.position(0);

// transfers from someOtherChannel to someFileChannel
long someLong = someFileChannel.transferFrom(
someOtherChannel, 0, someOtherChannel.size());
```

One can also transfer data between threads, via __pipes__. Pipes are one-way.

```java
try {
    Pipe pipe = Pipe.open();

    Runnable writer = new Runnable() {
        @Override
        public void run() {
            try {
                Pipe.SinkChannel sinkChannel = pipe.sink();
                ByteBuffer buffer = ByteBuffer.allocate(56);

                for(int i=0; i<10; i++) {
                    String currentTime = "The time is: " + System.currentTimeMillis();

                    buffer.put(currentTime.getBytes());
                    buffer.flip();

                    while(buffer.hasRemaining()) {
                        sinkChannel.write(buffer);
                    }
                    buffer.flip();
                    // give the reader a chance to read from the pipe's source channel
                    Thread.sleep(100);

                }

            } catch(Exception e) {
                e.printStackTrace();
            }
        }
    };


    Runnable reader = new Runnable() {
        @Override
        public void run() {

            try {
                Pipe.SourceChannel sourceChannel = pipe.source();
                ByteBuffer buffer = ByteBuffer.allocate(56);

                for(int i=0; i<10; i++) {
                    int bytesRead = sourceChannel.read(buffer);
                    byte[] timeString = new byte[bytesRead];
                    buffer.flip();
                    buffer.get(timeString);
                    System.out.println("Reader Thread: " + new String(timeString));
                    buffer.flip();

                    // wait for the sink channel to have more data written
                    Thread.sleep(100);
                }

            } catch(Exception e) {
                e.printStackTrace();
            }

        }
    };

    new Thread(writer).start();
    new Thread(reader).start();

} catch(IOException e) {
    e.printStackTrace();
}
```
