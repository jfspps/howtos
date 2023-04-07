# Java NIO filesystems

The Java NIO's Path interface handles a files path information.

```java
Path path = FileSystems.getDefault().getPath("fileName.txt");
printFile(path);  // defined below
```

One can use the Path instance to access the file with BufferedReader or BufferWriter.

```java
private void printFile(Path path) {

    try(BufferedReader fileReader = Files.newBufferedReader(path)) {
        String line;
        while((line = fileReader.readLine()) != null) {
            // do stuff with the line
        }
    } catch(IOException e) {
        System.out.println(e.getMessage());
    }
}
```

One can get the working directory with the dotted notation and return the absolute path with:

```java
filePath = Paths.get(".");
System.out.println(filePath.toAbsolutePath());
```

Working directories are also retrieved using getDefault(). One can also pass each segment of the path (usually separated by a delimiter \ or / depending on the OS) with:

```java
// find ./dir2/someFile.txt
Path path2 = FileSystems.getDefault().getPath("dir2", "someFile.txt");

// find ../siblingDir/someFile.txt; note that .. moves up to the parent
Path path3 = FileSystems.getDefault().getPath("..", "siblingDir", "someFile.txt");

// print the full juxtaposed path with normalize()
System.out.println(path2.normalize().toAbsolutePath());
printFile(path2.normalize());
```

Note how important the order of each segment is.

## Exists and copy methods

Java 7's IO Paths class was replaced by Java NIO's Path interface to accommodate exception handling and address other limitations, including delete() and rename(). With Java IO Paths class, no exceptions are thrown until a buffer is coupled to the file. Until then, the Paths objects is assumed to exist.

With Java NIO, one can check if a file exists:

```java
Path filePath = FileSystems.getDefault().getPath("files");
System.out.println("Exists = " + Files.exists(filePath));
```

One can also use Java NIO's copy() method to copy across a file (without more parameters, files are not copied if they already exist):

```java
try {
    Path sourceFile = FileSystems.getDefault().getPath("someDir", "file.txt");
    Path copyFile = FileSystems.getDefault().getPath("someDir", "fileCopy.txt");
    Files.copy(sourceFile, copyFile);
} catch(IOException e) {
    e.printStackTrace();
}
```

## Moving, renaming and deleting files

The methods to move, rename (with copy() shown below, or move()) and delete methods are:

```java
try {
Path fileToDelete = FileSystems.getDefault().getPath("parentDir", "Dir1", "fileCopy.txt");
Files.deleteIfExists(fileToDelete);

Path fileToMove = FileSystems.getDefault().getPath("parentDir", "file2.txt");
Path destination = FileSystems.getDefault().getPath("parentDir", "childDir", "file2.txt");
Files.move(fileToMove, destination);

// use copy() to replace the given file and effectively rename it
// again, note that no exceptions are thrown at this stage
sourceFile = FileSystems.getDefault().getPath("parentDir", "fileX");
copyFile = FileSystems.getDefault().getPath("parentDir", "fileY");
Files.copy(sourceFile, copyFile, StandardCopyOption.REPLACE_EXISTING);

} catch(IOException e) {
System.out.println(e.getMessage());
}
```

It is also possible move or copy entire directories (see walking the tree, below) by passing directory segments without the file name segment. Note that some operating systems may respond differently to move().

## File metadata

To retrieve a file's attributes or metadata, with regard to the operating system, see the [BasicFileAttributes interface](https://docs.oracle.com/javase/8/docs/api/java/nio/file/attribute/BasicFileAttributes.html). To get all the attributes in one go, use:

```java
Path filePath = FileSystems.getDefault().getPath("exampleDir", "subDir/file.txt");
BasicFileAttributes attrs = Files.readAttributes(filePath, BasicFileAttributes.class);

System.out.println("Size =  " + attrs.size());
System.out.println("Last modified =  " + attrs.lastModifiedTime());
System.out.println("Created = " + attrs.creationTime());
System.out.println("Is directory = " + attrs.isDirectory());
System.out.println("Is regular file = " + attrs.isRegularFile());
```

There are other subclasses of BasicFileAttributes (OS specific) hence the need to pass the class in readAttributes().

## Reading directories

The files and directories present in a given directory, excluding other files in descendant directories, use:

```java
// pass this filter instead of "*.sql" 
// DirectoryStream.Filter<Path> filter = p -> Files.isRegularFile(p);

Path directory = FileSystems.getDefault().getPath("FileTree/Dir");

try (DirectoryStream<Path> contents = Files.newDirectoryStream(directory, "*.sql")) {
    for (Path file : contents) {
        System.out.println(file.getFileName());
    }

    // catch either exception with a bitwise OR
} catch (IOException | DirectoryIteratorException e) {
    System.out.println(e.getMessage());
}
```

To apply other matchers or wildcards (instead of *.sql), see [the official docs](https://docs.oracle.com/javase/8/docs/api/java/nio/file/FileSystem.html#getPathMatcher-java.lang.String-).

## Other file system related features

Different operating systems use different directory separators. Linux and Macs use "/" whereas Windows uses "\". To get the current system's separator, use:

```java
Path directory = FileSystems.getDefault().getPath("dirTree" + File.separator + "descendantDir");

// print the separator
String separator = FileSystems.getDefault().getSeparator();
```

To create temporary files in the OS's temp directory, use:

```java
try {
  // filePrefix is not normally the final filename
  Path tempFile = Files.createTempFile("filePrefix", ".suffix");
  System.out.println("Temporary file path = " + tempFile.toAbsolutePath());

} catch(IOException e) {
  System.out.println(e.getMessage());
}
```

To get the drives (file stores) representing physical drives or partitions, and root paths use:

```java
Iterable<FileStore> stores = FileSystems.getDefault().getFileStores();
for(FileStore store : stores) {
    // output is OS specific
    System.out.println("Volume name/Drive letter = " + store);
    System.out.println("file store = " + store.name());
}

Iterable<Path> rootPaths = FileSystems.getDefault().getRootDirectories();
for(Path path : rootPaths) {
    System.out.println("Root directory: " + path);
}
```

## Walking a file tree

This tends to be useful when searching for all files from a given parent directory. The approach is given below:

```java
Path dirPath = FileSystems.getDefault().getPath("fileTree" + File.separator + "someDir");
try {
  // using the extension, PrintNames, below
    Files.walkFileTree(dirPath, new PrintNames());
} catch(IOException e) {
    System.out.println(e.getMessage());
}
```

Walking the tree is normally supported by an extension of SimpleFileVisitor. This class keeps track of which file was used and can be extended to return info each time a file is visited:

```java
public class PrintNames extends SimpleFileVisitor<Path> {

  // handles files
  @Override
  public FileVisitResult visitFile(Path file, BasicFileAttributes attrs)
   throws IOException {
      System.out.println(file.toAbsolutePath());
      return FileVisitResult.CONTINUE;
  }

  // handles methods run before a directory is processed
  // there are other methods e.g. postVisitDirectory which can be overridden
  @Override
  public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs)
   throws IOException {
      System.out.println(dir.toAbsolutePath());
      return FileVisitResult.CONTINUE;
  }

  // override the default IOException throwing behaviour if a file is not found
  @Override
  public FileVisitResult visitFileFailed(Path file, IOException exc)
   throws IOException {
      System.out.println("Error accessing file: " + file.toAbsolutePath() 
        + " " + exc.getMessage());
      return FileVisitResult.CONTINUE;
  }
}
```

This approach also provides a way of copying all files found. Again, a class which extends SimpleFileVisitor can implement this functionality.

```java
Path source = FileSystems.getDefault().getPath(
  "FileTree" + File.separator + "subDir");
Path destination = FileSystems.getDefault().getPath(
  "FileTree" + File.separator + "subDir" + File.separator + "anotherSubDir");
try {
    Files.walkFileTree(source, new CopyFiles(source, destination));

} catch(IOException e) {
    System.out.println(e.getMessage());
}
```

The supporting class is provided below:

```java
public class CopyFiles extends SimpleFileVisitor<Path> {

  private Path sourceRoot;
  private Path targetRoot;

  public CopyFiles(Path sourceRoot, Path targetRoot) {
      this.sourceRoot = sourceRoot;
      this.targetRoot = targetRoot;
  }

  @Override
  public FileVisitResult visitFileFailed(Path file, IOException exc)
   throws IOException {
      System.out.println("Error accessing file: " + file.toAbsolutePath() 
      + " " + exc.getMessage());
      return FileVisitResult.CONTINUE;
  }

  @Override
  public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs)
   throws IOException {

    // get relative path (removes root path info from absolute source path)
    // of source directory
    Path relativizedSourcePath = sourceRoot.relativize(dir);
    System.out.println("relativizedSourcePath = " + relativizedSourcePath);

    // appends the source relative path to destination target absolute path
    Path destinationPath = targetRoot.resolve(relativizedSourcePath);
    System.out.println("Resolved path for copy = " + destinationPath);

    try {
        Files.copy(dir, destinationPath);
    } catch(IOException e) {
        System.out.println(e.getMessage());
        // since this directory has errors, skip its sub-directories too
        return FileVisitResult.SKIP_SUBTREE;
    }

    return FileVisitResult.CONTINUE;
  }

  @Override
  public FileVisitResult visitFile(Path file, BasicFileAttributes attrs)
   throws IOException {
      Path relativizedSourcePath = sourceRoot.relativize(file);
      System.out.println("relativizedSourcePath = " + relativizedSourcePath);

      Path destinationPath = targetRoot.resolve(relativizedSourcePath);
      System.out.println("Resolved path for copy = " + destinationPath);

      try {
          Files.copy(file, destinationPath);
      } catch(IOException e) {
          System.out.println(e.getMessage());
      }

      return FileVisitResult.CONTINUE;
  }
}
```
