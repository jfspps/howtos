---
title: Java Downloading Files
nav_order: 9
parent: Intermediate Java
---

# Downloading files

Files identified by a URL can be sent to a byte array (suitable for all file formats) via a byte stream. A new InputStream instance is assigned to the URL and holds the byte sequence the URL refers to. The InputStream instance effectively holds the same data as the file, keeping a record of the last known position with a pointer and is read in chunks to an output stream, in this case, a ByteArrayOutputStream instance.

```java
byte[] getFile(String urlPath) throws IOException {
    
  URL url = new URL(urlPath);

  ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

  try(InputStream inputStream = url.openStream()){

      int bytesRead;
      byte[] chunk = new byte[1024];

      // pass data from inputStream in 1024 byte chunks until there is
      // no more data present in the inputStream;
      // note that a pointer is marking the last position in the stream
      while((bytesRead = inputStream.read(chunk)) > 0){

        // write 1024 byte chunks to outputStream
        outputStream.write(chunk, 0, bytesRead);
      }
  }
  return outputStream.toByteArray();
}
```
