---
title: Access and mapping types, Fetching and Embeddable
nav_order: 2
parent: Jakarta EE The JPA
---

# Access types

As stated, the JPA implementation is also known as the provider. Access types describe the method which the provider follows to map data to/from the database/Java object. Regarding the Java object, the data can be retrieved or set directly via the fields or though its class' getter and setters.

Take the case when a provider extracts field values from the POJO's fields directly and stores them in the database. This direct mechanism is referred to as "Field Access" and is the default mechanism for all fields of a class, where at least one field not method (normally the ```@Id``` annotated field) is given a valid JPA annotation. More fundamentally, the runtime will use 'reflection' to access the field "income" above directly. It will not make use of any getter.

In general, all fields of a class which are then assumed to follow field access are field access types and should be either private or protected. Furthermore, classes which extend said class are also assumed to follow field access. Only the JPA provider will have access to the fields.

"Property Access" is a mechanism where the provider uses getters and setters to access fields' values. The getters and setters must be public. To signal property access of the Id, for example, simply move the ```@Id``` annotation from its field to the getter.

```java
@Entity
@Table(name = "Some_Table_Name")
public class Costs {

    private Long id;

    private double income;

    // getters and setters

    // this signal the use of Property access
    @Id
    public Long getId(){
        return this.id;
    }
}
```

Generally, field access tends to be easier to read and is applied more often than property access. It is also possible to follow a "Mixed Access" method which is essentially a mixture of Field and Property access types. This can be achieved by a combination of the ```@Access``` and ```@Transient``` annotations. This approach is quite rare and not described here.

# Mapping types and Fetching

Java String types are mapped to the database as VARCHAR (in fact, all mapping types are provider dependent so this discussion attempts to be somewhat generic). Other Java primitive types, wrapper types, enums and Serializable objects can also be mapped to the JPA.

Enum types are normally assigned ordinal values, according to the order they are listed in the class.

```java
public enum Status {
    // each enum is zero-based, so VACANT is 0, OCCUPIED is 1 etc.
    // this also means that the order of the list is important
    VACANT,
    OCCUPIED,
    MAINTENANCE
}
```

The ordinals are, by default, stored to the database as integers. This is fine as long as the enumerated list never changes. If however the order changes or an enum is added/removed, then any database stored values will be mis-assigned. To overcome this, the enum can be mapped as a string (a VARCHAR) and use the literal of the enum instead of its ordinal value. In the enum field, use the ```@Enumerated(EnumType.STRING)```. Storing as a string tends to be the preferred method.

```java
public class SomeClass {

    // assume to store ordinals of the enum
    private Status currentStatus;


    // assume to store strings of the enum
    @Enumerated(EnumType.STRING)
    private Status currentStatusString;

    // only load someImage when the getter is called
    @Lob
    @Basic(fetch = FetchType.LAZY)
    private byte[] someImage;
}
```

Large entities of variable length (arrays, lists etc.) are represented as CLOBs and BLOBs, that is, character large objects and binary large objects. A primitive array of Java char would be handled by a CLOB whereas a primitive array of Java byte would be handled by a BLOB. The annotation ```@Lob``` signals to the JPA provider to handle the Java array or list with large format file routines, optimised for the specific purpose.

When dealing with large files, it is more optimal to retrieve data only when needed, typically through a getter. When an object (a database row) is retrieved from the database, all fields by default (where fields are "eagerly" fetched) are extracted and assigned to the properties of the object. To prevent the JPA provider from retrieving certain fields when a Java object is built with database fields, apply the ```@Basic(fetch = FetchType.LAZY)``` annotation to the fields that must be excluded. Only when the object getter (if the field is private) is called does the annotated field get extracted from the database and are said to be "lazily" fetched.

JPA 2.2 introduced support for Java 8's java.time package. The JPA provider will normally use the corresponding Date type in the database. No special annotations are required. Prior version of the JPA required the use of specific annotations to get things going.

# Embeddable classes

Inner classes or classes which are embedded into others (through composition) in Java usually have no purpose other than to serve the Java class they are embedded in. Instances of the outer class typically have fields which are the same type as the inner (embedded) class. To store the inner class, annotate the class to be embedded with ```@Embeddable``` and then annotate the field of the class which is embedded with ```@Embedded```. This causes the JPA to save the embedded (inner) class with its own columns, into the 'main class'. Note that an embeddable class should <b>not</b> be annotated with ```@Entity``` at the same time.

```java
@Embeddable
public class HelperClass {
    // other fields and methods
}

// in some other class file...

public class MainClass {

    @Embedded
    private HelperClass embeddedClass;

    // getters and setters etc.
}
```
