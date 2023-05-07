---
title: Other JPA features
nav_order: 8
parent: Jakarta EE The JPA
---

# Validation

Data should be validated right before it is persisted to a database. This can be achieved with the Bean Validation API, which is integrated with the JPA. The default provider for Bean Validation API is Hibernate (not EclipseLink) so the following subsection is aimed at Hibernate.

To verify the integrity of the beans (and consequently entities), one sets constraints on the bean fields as annotations. If the constraint is violated, then and exception is raised and the current transaction is not committed (causing all other invoked methods to be rolled back). A few are summarised below.

+ ```@NotEmpty(message = "this cannot be null or empty")```: field cannot be null or empty (the message parameter is optional)
+ ```@Past(message = "this must be set in the past"```: this ensures that the local date must be set in the past
+ ```@PastOrPresent(message = "must be set in the past or present")```: the annotated LocalDate field cannot be set in the future
+ ```@NotNull(message = "entity cannot be null")```: a somewhat legacy implementation of ```@NotEmpty``` except that it does not check for empty collections
+ ```@DecimalMax(value = "65", message = "Value must be less than or equal to 65")```: the field must not be greater than the stated value (65, for example)
+ ```@DecimalMin(value = "65", message = "Value must be greater than or equal to 65")```: the field must be less than or equal to the stated value
+ ```@Email(message = "Enter a valid email address")```: expects user@domain.com or similar
+ ```@NotBlank(message = "Value cannot be null or composed entirely of whitespace")```: as instructed, there must be at least one character present
+ ```@Pattern(regExp = "[de][FG]", message = "string must contain the sequence deFG at least once")```: the given field must be recognised by the stated [regular expression](../Java/RegularExpressions.md)
+ ```@Size(min = 3, max = 55, message = "Value must be greater than or equal to 3 and less than or equal to 55")```: a combination of min and max annotations; the default min value is zero if not stated

## Entity lifecycle callbacks

There are a number lifecycle points which are available and enable custom functions to be executed. CDI contextual instance callbacks were briefly introduced [here](../JakartaEETheBasics/ContainersContextsAndBeans.md). For JPA entities, the custom methods are also annotated and then invoked at the required stage.

+ ```@PrePersist```: invoked prior to persistence to the database; can be private or public etc., but must parameterless and void
+ ```@PostPersist```: invoked after persistence (note that this in relation to the individual entity not the transaction as a whole, so this annotated method would still run even if the transaction fails)

There are other fairly self-explanatory annotations which are somewhat JPA provider dependent. These include ```@PreUpdate```, ```@PostUpdate``` and ```@PostLoad```.

Note the above annotations can, in principle, be applied to the same method.

## Entity listeners

Entity listeners provide another way of implementing lifecycle callbacks, including a more general implementation of the callback function. This approach can be cleaner in some cases and focuses solely on entity callbacks.

For example, a method can be annotated with a specific callback or callbacks. Instead of invoking the specific method, one can build and invoke a more general method instead. For example, many entities will have their own logging callback which logs metadata once an entity has been persisted to the database. If for some reason that a more general logging callback is required then it is possible to isolate (or withdraw) the specific callback and instead invoke a more general one. This is achieved through entity listeners.

To implement entity listeners, build a new class with methods that have the same method signature.

```java
  public class CustomerListener {

    @PrePersist
    public void doSomethingBeforePersist(Customer customer){
      customer.setCreatedDate(LocalDateTime.now());
      // do other stuff to Customer entity as required
    }

    @PreUpdate
    public void doSomethingBeforeUpdating(Customer customer){
      customer.setUpdatedDate(LocalDateTime.now());
      // do other stuff if needed
    }
  }
```

The first snippet above shows how the specific callback would be implemented, the second snippet below shows how a more general callback would be applied.

```java
  public class AbstractEntityListener {

    @PrePersist
    public void doSomethingBeforePersist(AbstractEntity entity){
      entity.setCreatedDate(LocalDateTime.now());
      // do other stuff to Customer entity as required
    }

    @PreUpdate
    public void doSomethingBeforeUpdating(AbstractEntity entity){
      entity.setUpdatedDate(LocalDateTime.now());
      // do other stuff if needed
    }
  }
```

To associate the entity with the above listeners (clearly the first listener should only be applied to Customer class), annotate the bean with ```@EntityListener({CustomerListener.class, AbstractEntityListener.class})``` for example. Edit the array parameter as needed.

## Native Queries

Native queries provides some of the provider specific queries which are not normally available to the standard JPQL through the interaction with JPA entities. Native queries supplement the JPQL by allowing one to use native SQL.

The annotation is ```@NamedNativeQuery(name = "someNativeQuery", query = "select * from SomeEntity", resultClass = SomeEntity.class)```. The SQL query is passed as the query parameter and overall, this native query is referred to as a _named native query_. The native query can be passed to a service class methods (via a EntityManager instance) with ```createNamedQuery()``` in very much the same way as named queries (which use ```@NamedQuery()```). All SQL queries are available though some thought about the provider used (this approach may also render the application less database agnostic).

It is also possible to implement _dynamic native queries_ in the same way as dynamic queries by defining a method that returns a Collection. Note in both cases that the terminating semicolon is needed in the string. Also note that native SQL queries work on SQL tables directly, not Java entities.

```java
  // it may be necessary to add annotate here since the compiler returns
  // a Query not a TypedQuery
  @SuppressWarnings("unchecked")
  public Collection<SomeClass> findAllObjects() {
    String nativeSQLstring = "SELECT DISTINCT * FROM tableName ORDER BY someColumn";

    return entityManager
      .createNativeQuery(nativeSQLstring, SomeClass.class)
      .getResultList();
  }
```

With native queries, the return type is not TypedQuery but instead an "untyped" Query (part of EntityManager class). It may be necessary to annotate the method to suppress compiler warnings (see snippet above).

## Overriding equals() and hashCode()

Generally, it is recommended that one override the ```equals()``` and ```hashCode()``` methods when managing JPA beans. Doing so grants more control about how objects are compared and how it rejects new entities that already exist in the database. Another brief exploration of the implications of ```equals()``` and ```hashCode()``` were discussed in the [Collections framework](../Java/CollectionsFramework.md) notes. The Set interface, for examples, relies on ```equals()``` and ```hashCode()``` methods. In short, ```equals()``` checks if two Java objects are the same by comparing their hash code, through ```hashCode()```. If the hash code is not set and overridden properly then ```equals()``` will probably return false positives or negatives.

It is worth highlighting that the id of an entity is not normally decided before the ```equals()``` method is called. The new Java object may be undergoing validation etc. and is only assigned an id by the provider once the object has satisfied the prerequisites. Hence, the id cannot be used to determine if two new Java objects (or one new Java object and one entity with an id) are the same or not. The id field is intended for the database, nothing else.

One would need to choose fields which can help distinguish between objects. Also be aware that the case of the String should be made the same, since different providers may not treat string literals in the same way. Something like the following would work.

```java
  @Override
  public boolean equals(Object o) {
      if (this == o) return true;

      // could use "if (o instanceOf SomeClass) { ... }"
      if (o == null || getClass() != o.getClass()) return false;

      SomeClass other = (SomeClass) o;
      return Objects.equals(
        this.getUniqueIdentifier().toUpperCase(), that.getUniqueIdentifier().toUpperCase());
  }

  @Override
  public int hashCode() {

      return Objects.hash(getUniqueIdentifier().toUpperCase());
  }
```
