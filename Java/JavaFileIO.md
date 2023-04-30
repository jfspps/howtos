---
title: Java File I/O
nav_order: 3
---

# Java File I/O

First, we start of with the FileWriter class with the help of an output stream. FileWriter is meant for writing streams of characters. For writing streams of raw bytes, use FileOutputStream. With regard to text files, the order in which data is printed to and extracted from must clearly match.

```java
FileWriter someFile = null;

try {
    someFile = new FileWriter("someFileName.txt");
    for( ... ) {
        someFile.write(POJO_getters_etc);
    }
} catch(IOException e) {
    e.printStackTrace();
} finally {
    try {
        if(someFile != null) {
            // try to close the file and catch another exception
            someFile.close();
        }
    } catch(IOException e) {
        e.printStackTrace();
    }
}
```

Other statements or conditional statements or iterative blocks can be applied to print to the text file as required. Closing the file (the file stream) is important. The IOExceptions (checked exceptions, which cannot be ignored on compile time) are thrown when errors are encountered (e.g. read-only access, file not accessible).

The more concise way of implementing the above segment, when no specific action is taken after an exception (other than print exception stack traces), is to use try with resources (new to Java 7). Remember to add the 'throws IOException' to the method signature. The stream is automatically closed.

```java
try(FileWriter someFile = new FileWriter("someFileName.txt")) {

    for(...) {
      someFile.write(POJO_getters_etc);
    }

}
```

To read from the text file, one can use the FileReader class. This can be implemented with the Scanner class (this automatically closes FileReader, which implements the Closeable interface). The delimiter represents the end of a line as such and is a recommended.

```java
Scanner scanner = null;

try {
    scanner = new Scanner(new FileReader("someFileName.txt"));
    scanner.useDelimiter(",");

    while(scanner.hasNextLine()) {
        int someInt = scanner.nextInt();
        scanner.skip(scanner.delimiter());
        String someString = scanner.nextLine();

        // feedback
        System.out.println("Imported int: " + someInt);
        System.out.println("Imported string: " + someString);

        // copy to an Java object somewhere
        Map<String, POJO> someHashMap = new HashMap<>();
        someHashMap.put(someString, new POJO(someInt));
    }

} catch(IOException e) {
    e.printStackTrace();
} finally {
    if(scanner != null) {
        scanner.close();
    }
}
```

Note that the while loop implementation requires the program to look for the next input so a buffered approach, where entire file contents are read, is more efficient. Like FileReader, BufferedReader implements the Closeable interface.

```java
Scanner scanner = null;

try {
    scanner = new Scanner(new Scanner(new BufferedReader(new FileReader("someFileName.txt")));
    scanner.useDelimiter(",");

    while(scanner.hasNextLine()) {
        ...
    }

} catch(IOException e) {
    e.printStackTrace();
} finally {
    if(scanner != null) {
        scanner.close();
    }
}
```

As above, one can convert the try-finally block with a try-with-resources block. In this case, the scanner has been removed and each line is read one at a time. The catch block has been left in for demonstration purposes.

```java
try(BufferedReader reader = new BufferedReader(new FileReader("someFileName.txt"))) { 
    
    while(reader.readLine() != null) {
        ...
    }

} catch(IOException e) {
    e.printStackTrace();
}
```

A BufferedWriter can take a FileWriter instance in much the same way as a BufferReader takes in a FileReader.
