---
title: The Builder Pattern
nav_order: 3
parent: ADTs and Design Patterns in Java
---

# The Builder pattern

This pattern is quite useful when:

+ Constructors currently in place have too many parameters
+ When all object properties are unknown at run-time (some properties may be mandatory; handle using exceptions or set defaults as required)
+ When building immutable objects (declare the Builder class within the class the Builder instantiates) like Java Strings

The Builder pattern provides a way of building objects while setting some or all of the attributes/fields of the instance. The resultant code is generally cleaner and more concise than having to use a constructor and individual setters manually. A more commonly implemented form of the builder class, in which the class it instantiates is an inner class, is shown here. (Alternatively, classes that would be instanced can be declared as separate, external classes.)

The builder class UserDTOBuilder can only handle UserDTO objects. A DTO is a data-transfer object and can be considered a reduced form of a database entity which retains the info sought after but omits sensitive or unnecessary database/backend metadata.

```java
public class UserDTO {

    private String name;
    private String address;
  
    // name and address public getters and private setters

    @Override
    public String toString() {
      return "name = " + name + "\\naddress = " + address ;
    }
  
    // Get builder instance (common practice, and optional, 
    // since the builder class is public)
    public static UserDTOBuilder getBuilder() {
      return new UserDTOBuilder();
    }
  
    // Builder (declared within the class that it builds objects of) =====================
    public static class UserDTOBuilder {
      
      private String firstName;
      private String lastName;
      private String address;
      
      // link between the Builder and the object it builds (UserDTO)
      private UserDTO userDTO;
  
      // chain methods (note how they return the UserDTOBuilder object;
      // this permits chaining)
      public UserDTOBuilder withFirstName(String fname) {
        this.firstName = fname;
        return this;
      }
      
      public UserDTOBuilder withLastName(String lname) {
        this.lastName = lname;
        return this;
      }
      
      // assume Address is defined as appropriate
      public UserDTOBuilder withAddress(Address address) {
        this.address = address.getHouseNumber() + " " + address.getStreet()
              + "\\n" + address.getCity() + ", " + address.getState() 
              + " " + address.getZipcode();
        return this;
      }
  
      // use the private setters of the outer class and return an object 
      // of its type (this means one can build an immutable object within 
      // the class);
      // Since UserDTOBuilder is an inner class, it can access UserDTO's setters
      public UserDTO build() {
        this.userDTO = new UserDTO();
        userDTO.setName(firstName + " " + lastName);
        userDTO.setAddress(address);
        return this.userDTO;
      }
      
      public UserDTO getUserDTO() {
        return this.userDTO;
      }
    }
  }
```

The client would then execute the builder method (either through a director or directly) as follows. Note that as a result of the defined DTO, not all attributes are transferred.

```java
public class Client {

    public static void main(String[] args) {
      User user = createUser();

      // Use the director to build the DTO;
      // this is the cleaner approach particularly if User is extracted
      // from a datasource
      UserDTO directorDTO = directBuild(UserDTO.getBuilder(), user);
  
      // Call the builder directly;
      // this would be used if a new User was built without reference
      // to an external datasource
      UserDTO directDTO = new UserDTOBuilder()
          .withFirstName(user.getFirstName())
          .withLastName(user.getLastName())
          .withBirthday(user.getBirthday())
          .withAddress(user.getAddress()).build();
  
      // the following should yield identical output
      System.out.println(directorDTO);
      System.out.println("==============================");
      System.out.println(directDTO);
    }
  
    /**
     * This method serves the role of director in builder pattern.
     */
    private static UserDTO directBuild(UserDTOBuilder builder, User user) {
      return builder
                .withFirstName(user.getFirstName())
                .withLastName(user.getLastName())
                .withBirthday(user.getBirthday())
                .withAddress(user.getAddress()).build();
    }
  
    /**
     * Returns a sample user. Simulates a DB datasource and is eventually mapped 
     * to a DTO
     */
    public static User createUser() {
      User user = new User();

      user.setBirthday(LocalDate.of(1960, 5, 6));
      user.setFirstName("Ron");
      user.setLastName("Swanson");

      Address address = new Address();
      address.setHouseNumber("100");
      address.setStreet("State Street");
      address.setCity("Pawnee");
      address.setState("Indiana");
      address.setZipcode("47998");
      user.setAddress(address);

      return user;
    }
  
  }
```

```Calendar```, ```StringBuilder``` and many other Buffer classes in Java are examples, arguably, of builder patterns.
