---
title: The Factory method
nav_order: 3
parent: ADTs and Design Patterns in Java
---

# The Factory method

The Factory method pattern, as the name implies, provides a way of building multiple instances of different types without knowing precisely how the objects are created. That is, we call an abstract method (that is inherently undefined) on a
concrete data type. Quite often, one builds a singleton Factory method implementation and then uses the same method to build other objects as needed.

First, start with an abstract class that defines a generic message.

```java
public abstract class Message {

    public abstract String getContent();
    
    public void addDefaultHeaders() {
      // Adds default headers
    }
    
    public void encrypt() {
      // Encrypt the content
    }
    
}
```

Then provide more specific extensions of the abstract ```Message``` class.

```java
public class JSONMessage extends Message {

    @Override
    public String getContent() {
      return "{JSON:[]}";
    }
    
}
  
// defined elsewhere
  
public class TextMessage extends Message {

  @Override
  public String getContent() {
    return "Text";
  }
  
}
```

The abstract Factory class would instantiate the abstract ```Message``` class.

```java
public abstract class MessageCreator {

    public Message getMessage() {
      Message msg = createMessage();
      
      msg.addDefaultHeaders();
      msg.encrypt();
      
      return msg;
    }
    
    // Factory method (implemented by the concrete classes)
    // this method can also be defined to set defaults if desired
    protected abstract Message createMessage();
}
```

Then extend the abstract Factory method for all relevant concrete classes.

```java
public class JSONMessageCreator extends MessageCreator {
    @Override
    public Message createMessage() {
      return new JSONMessage();
    }
}
  
// defined elsewhere
  
public class TextMessageCreator extends MessageCreator {
  @Override
  public Message createMessage() {
    return new TextMessage();
  }
}
```

The client then requests specific instances as follows, passing a new concrete class instance and applying polymorphism in place of ```MessageCreator``` and ```Message```.

```java
public class Client {

    public static void main(String[] args) {

      printMessage(new JSONMessageCreator());
      printMessage(new TextMessageCreator());
      
    }
    
    public static void printMessage(MessageCreator creator) {

      // call an abstract method on an abstract "instance" which works since
      // an extension (and definition) is known at run-time
      Message msg = creator.getMessage();
      System.out.println(msg);
    }
}
```
