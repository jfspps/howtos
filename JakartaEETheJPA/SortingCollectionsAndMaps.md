---
title: Sorting collections and Maps in JPA
nav_order: 4
parent: Jakarta EE The JPA
---

# Sorting Collections

It is recommended to use the Collection interface when defining the variable type of a collection of objects. This is because some providers will use their own more optimised implementation of the collection, rather than the Collections List, ArrayList, Set or Map implementations.

By default, elements in a Java List (indeed any JDK entity) are ordered, ascending, by the primary key. This is symbolised by the optional annotation ```@OrderBy()```. To order by a particular field of the persisted object can be applied with ```@OrderBy("fieldName asc, secondaryFieldName desc")```. Here, the list is sorted by fieldName first, and then by secondaryFieldName. One can add more field names. The token asc and desc represent ascending (default) ordering and descending order, respectively.

```java
public class SomeClass {

    @OrderBy("fieldName desc, nextField asc, nextField2 desc")
    private List<SomeNonEntity> customObjects = new ArrayList<>();
}
```

By default, the ordering of primitive Java types is based on the values. The ordering of non-JDK entities is undefined. Note that the fields of a target non-JDK entity used to sort a collection must be orderable and not another non-JDK entity type.

In cases where there are no orderable fields, an alternative sorting method is signalled by the ```@OrderColumn``` annotation. This creates a separate column in the database which mirrors the indices of the Collections List object. As such, the column is zero-based. The name of the column is by default "ClassName_order" and can be overridden with ```@OrderColumn(name = "indexColumnName")``` annotation option. The developer then needs to set the index of the List element as desired separately from the JPA provider. The JPA provider will simply order by index.

# Java Maps in JPA

The persistence of Java Maps (assume that the key and value are JDK entities for now) are handled such that both the key and value are stored in their own columns in a separate table along with a reference to the entity in which they were declared. Use ```@ElementCollection``` and a few other annotations.

```java
public class SomeClass {

    @ElementCollection
    @CollectionTable(name = "collectionTableName")
    @MapKeyColumn(name = "keyColumnName")
    @Column(name = "valueColumnValue")
    private Map<String, String> customObjects = new HashMap<>();
}
```

It is possible to use an enumeration as a key to a map. To enforce the provider to use the literals instead of the ordinals of the enumeration, follow the aforementioned persistence mode.

```java
public class SomeClass {

    // note that for keys as enums, use 
    // @MapKeyEnumerated instead of @Enumerated
    @ElementCollection
    @CollectionTable(name = "collectionTableName")
    @MapKeyColumn(name = "keyColumnName")
    @Column(name = "valueColumnValue")
    @MapKeyEnumerated(EnumType.STRING)
    private Map<SomeEnum, String> customObjects = new HashMap<>();
}
```

One can also use a field of the entity as a key and the entity itself as the value. (For example, a field might be security number of an employee as the key.)

```java
public class SomeClass {

    private Long fieldName;

    // allow the JPA provider to build other tables as needed with @OneToMany
    @OneToMany
    @MapKey(name = "fieldName")
    private Map<Long, Employee> employees = new HashMap<>(); 
}
```

Note that the key is not stored in a separate table since it already exists, effectively, as a column in the given entity.

One can also use non-JDK entities as keys. For example, the key represents a particular employee in a department and the value (of the map) represents shift allocation (late shift is 0, day shift is 1 etc.). The key column is actually represented by the ID of the employee; the actual non-JDK entity is not stored in the column (cell).

```java
public class SomeOtherClass {

    // use the @MapKeyJoinColumn to persist the Employee by employeeID
    @ElementCollection
    @CollectionTable(name = "collectionTableName")
    @MapKeyJoinColumn(name = "employeeID")
    @Column(name = "shiftNo")
    private Map<Employee, Integer> employeeShift = new HashMap<>(); 
}
```

One can in theory use Embeddable types as keys, however, their use is not recommended. This is largely because embeddable types do not have their own tables, and are only persisted with the embedded entity. If the embedded entity is not in the database then the embeddable entities are also absent; as a result, the querying of embeddable types is not guaranteed.
