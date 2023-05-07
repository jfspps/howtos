---
title: The Jakarta Persistence API (JPA)
nav_order: 1
parent: Jakarta EE The JPA
---

# The Jakarta Persistence API (JPA)

The JPA allows Java objects to be mapped to a persistent database. The framework which implements and handles the mapping is referred to as object-relation mapping, or ORM. The ORM handles different database queries, accommodates legacy code and can help perform transactions regardless of where the data is persisted (saved). The default actions can be overridden when required.

The JPA is an interface which is implemented by a number of frameworks or <b>providers</b> or JPA runtime. The default Java EE implementation is [EclipseLink](https://www.eclipse.org/eclipselink/) though there are others in use in the enterprise environment including [Hibernate](https://hibernate.org/) and [Spring Data JPA](https://spring.io/projects/spring-data-jpa).

## Setting up the tables and entities

The fundamental (atomic) unit of a JPA component is a POJO, with its class annotated with the ```@Entity```. The ```@Id``` annotation is then applied to a field, of type Long, to ensure that each instance is unique with a unique Id.

To this point, the minimum needed to declare a JPA component is done. The name of the table is, without further intervention, the same as the class name. To use a different name, use the ```@Table(name = "SomeTableName")``` annotation. So far, the class would look like the following.

```java
@Entity
@Table(name = "Some_Table_Name")
public class Costs {

    @Id
    Long id;

    private double income;

    // getters and setters
}
```

Changing the table name enables POJOs to be stored according to different database requirements. Super classes can form the foundation of JPA entities which have similar fields. This can be implemented by defining an abstract class, itself implementing Serializable.

```java
// note that SomeAbstractEntityClass will not have its own table (this is handled 
// by child classes)
@MappedSuperClass
public abstract class SomeAbstractEntityClass implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    protected Long id;

    @Version
    protected Long version;

    // other fields to be implemented go next

    // getters and setters
}
```

The abstract class can then be extended, using the same fields already listed, as follows.

```java
@Entity
public class ChildOne extends SomeAbstractEntityClass {

    // add other fields, getters and setters that are unique to ChildOne
}
```

To override fields in the child class, annotate the child class with <span class="annot">@AttributeOverride</span>.

```java
@Entity
@AttributeOverride(name = "id", column = @Column(name = "childOneID"))
public class ChildOne extends SomeAbstractEntityClass {

    // ChildOne entities' "id" is now referred to in the JPA table as "childOneID",
    // note that the Java instance is still referred to as "id"

    // add other fields, getters and setters that are unique to ChildOne
}
```

Fields are mapped directly to columns with a column name that is similar to the field name (depends on the JPA implementation), and are by default known as basic fields (types). The optional annotation ```@Basic``` of a field, which follows this mapping approach, emphasises this in the code. The actual type stored in the JPA table depends on the implementation. For example, Java Strings are quite often mapped as VARCHAR types.

To customise the JPA column mapping, use the ```@Column(name = "jpaColumnName")``` annotation for the desired field. There are other options available, including "length", "nullable" and "unique".

To exclude the mapping of super class or child class field, use the ```@Transient``` annotation. In other words, the Java POJO will have a field that is never stored or known when consulting the JPA table. This might be useful if the POJO stores metadata that is not relevant to the database. Otherwise, without the ```@Transient``` annotation the field will automatically be mapped as a basic type.
