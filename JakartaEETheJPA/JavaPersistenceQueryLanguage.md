---
title: Java Persistence Query Language
nav_order: 7
parent: Jakarta EE The JPA
---

## The Java Persistence Query Language JPQL

The JPQL is an API for a Java String based language which resembles much of SQL. JPQL queries on objects/entities in contrast to SQL which queries tables. JPQL can be applied to different SQL vendors. Since the types are defined (or implied) in the String literals, the compiler cannot check for type mismatches. In other words, JPQL is not typesafe. An alternative to JPQL is the Criteria API, which is typesafe but generally more verbose than JPQL.

## Named and Dynamic queries of mandatory expressions

A ```@NamedQuery(name = "someName", query = "JPQL_expression")``` annotation can be used to define the expression and are compiled with the entity class. They are immutable. The name of the particular query is identified by the name property and query expression is given by the query property. A simple example would be ```@NamedQuery(name = "", query = "select d from ClassName d")```. The ```select``` and ```from``` keywords are mandatory for all JPQL expressions. The mandatory token "d" is an alias to the ClassName entity, so "select d" (without a WHERE clause) attempts to select and return a list of objects as a whole. All eagerly fetched fields associated with the object will also be retrieved and made available.

JPA 2.2 allows for multiple annotations, as long as the name properties are different. The name property can optionally be substituted with static fields (public static final String fields of the entity class). Legacy code will use ```@NamedQueries()```.

When data is returned from the database following a JPQL query, the default constructor and annotated fields are used to build the instance. This is why a default, no-arguments constructor is required with all JPA entity classes.

With the query written, the output is passed to the Entity manager. This is an example of a _named query_ because the query has a unique name.

```java
@NamedQuery(name = SomeClass.GET_ITEM_LIST, query = "select d from SomeClass d")
@NamedQuery(name = SomeClass.GET_NAME, query = "select d.className from SomeClass d")
@Access(AccessType.FIELD)
public class SomeClass {

    public static final String GET_ITEM_LIST = "SomeClass.getList";
    public static final String GET_NAME = "SomeClass.getName";

    // this annotation is part of the Bean Validation API, discussed later
    @NotEmpty(message = "This must be set to something")
    private String className;

    // other fields and methods, and no-args constructor

}

// somewhere-else

public class SomeServiceClass {

    @Inject
    EntityManager entityManager;

    // other methods

    public List<SomeClass> getAllEntities() {
        // this initially builds a TypedQuery<> and then its results list
        return entityManager
        .createNamedQuery(SomeClass.GET_ITEM_LIST, SomeClass.class)
        .getResultList();
    }
}
```

To access a particular field of the entity (of the defined type), use the path expression: ```@NamedQuery(name = SomeClass.GET_NAME, query = "select d.className from SomeClass d")```. In this case, the return type is String.

To retrieve entities which are not simple Java types (custom Beans) is also performed similarly. The type is effectively cast as appropriate. Furthermore, one could retrieve the field within the entity e.g. ```@NamedQuery(name = SomeClass.GET_OBJ_name, query = "select d.customObject.name from SomeClass d")```, where customObject is a separate entity that has a relationship with SomeClass entities. The custom class' fields can be lazily loaded.

```java
  @NamedQuery(name = SomeClass.GET_ITEM_LIST, query = "select d from SomeClass d")
  @NamedQuery(name = SomeClass.GET_NAME, query = "select d.className from SomeClass d")
  @NamedQuery(name = SomeClass.GET_OBJ_name, 
    query = "select d.customObject.name from SomeClass d")
  @Access(AccessType.FIELD)
  public class SomeClass {

    public static final String GET_ITEM_LIST = "SomeClass.getList";
    public static final String GET_NAME = "SomeClass.getName";
    public static final String GET_OBJ_name = "SomeClass.getObjName";

    // this annotation is part of the Bean Validation API, discussed later
    @NotEmpty(message = "This must be set to something")
    private String className;

    // here customObject has its own field, "name" of type String
    @OneToOne
    private CustomObject customObject;

    // other fields and methods, and no-args constructor

  }
  
  // somewhere-else

  public class SomeServiceClass {

    @Inject
    EntityManager entityManager;

    // other methods

    public List<SomeClass> getAllEntities() {
      return entityManager
        .createNamedQuery(SomeClass.GET_ITEM_LIST, SomeClass.class)
        .getResultList();
    }

    public List<String> getAllClassNames() {
      return entityManager
        .createNamedQuery(SomeClass.GET_NAME, String.class)
        .getResultList();
    }

    public List<String> getAllObjectName() {
      return entityManager
        .createNamedQuery(SomeClass.GET_OBJ_name, String.class)
        .getResultList();
    }
  }
```

Note here that the query is made from the point of view of SomeClass, not CustomObject. It is also possible to extract multiple fields from a custom entity by separating the requested fields with commas. For example, ```@NamedQuery(name = SomeClass.GET_OBJ_name, query = "select d.customObject.name, d.customObject.date from SomeClass d")```. The return type in this case is ```Collection<Object[]>```, here each field (of the same type) is stored in its own Collection element. This also introduces _dynamic queries_ which, in contrast to named queries, are not initially identified by a name. They can be called by function. The entity manager call would be:

```java
  public Collection<Object[]> getMixedFields() {
    return entityManager.createNamedQuery(SomeClass.IDENTIFIER, Object[].class).getResultList();
  }
```

An alternative to combined path expressions are constructor expressions. This is implemented first by preparing for a new POJO which contains the fields that are needed. View it as a data-transfer object, DTO. The return type is then the POJO with ```@NamedQuery(name = "DTO", query = "select new packagePath.POJO(d.field1, d.field2, d.field3) from ClassName d")``` declared in the original (non-DTO) class. 

```java
  // essentially, pass d fields to a new POJO entity
  @NamedQuery(name = "DTO", 
    query = "select new packagePath.POJO(d.field1, d.field2, d.field3) from SomeClass d")
  @Access(AccessType.FIELD)
  public class SomeClass {

    // fields and methods

  }

  // in a different package

  public class POJO {
    private String field1;
    private String field2;
    private Object field3;

    // all-args constructor, no-args constructor, setters and getters
  }
```

In this case, the all-args constructor of POJO is used as the return to the query.

```java
  public List<POJO> getPOJO() {
    return entityManager.createNamedQuery("DTO", POJO.class).getResultList();
  }
```

More on the ```from EntityClass alias``` clause. The EntityClass, as shown, must be a JPA entity. The alias must be unique across the given expression. To extract from an entity referenced in the queried class (a collection) through a join expression use the following.

```java
  @NamedQuery(name  = "", query = "select cl from Variable v join v.classes cl")
  // using the property "v.mapField", return entities from 
  // the map, maps, which have matching properties
  // to "v.mapfield" based on the value; then list their key and value
  @NamedQuery(
    name = "mapsQuery",
    query = "select v.mapField, KEY(m), VALUE(m) from Variable v join v.maps m")
  public Class Variable {

    @OneToMany(cascade = {CascadeType.PERSIST, CascadeType.REMOVE})
    private Set<SomeOtherClass> classes = new HashSet<>();

    @ElementCollection
    @MapKeyEnumerated(EnumType.STRING)
    private Map<SomeObject, String> maps = new HashMap<>();
  }
```

Optionally, one can prefix the collection alias with the "distinct" keyword to, like SQL, retrieve unique records.

Querying Java Maps. By default, queries compare the value of the map, not the key (demonstrated above). 

When an entity has been detached from the persistence context (when sent to the viewer layer for example) any lazily loaded fields not already loaded are inaccessible. The normal workaround is to set the field as eagerly loaded or to use the JPQL "fetch join" expression. The latter can be applied even when the entity is in a detached state. Note that this feature only relates to JPQL "join fetch" expression and not other routine Java getters. The field remains lazily loaded. This is demonstrated next.

```java
  @NamedQuery(
    name = "joinFetchDemo",
    query = "select e from SomeClass e join fetch e.classes")
  public Class Variable {

    @OneToMany(cascade = {CascadeType.PERSIST, CascadeType.REMOVE})
    private Set<SomeOtherClass> classes = new HashSet<>();
  }
```

## The optional expressions

The "where" expression is an example of an optional clause or expression. As with SQL, the "where" clause filters the data returned. The expression is added after the from or (if present) the join expression. Some typical examples are listed.


- ``` where alias.property > 155```: constant parameter
- ```where alias.property > ?1```: via a positional parameter, in this case position 1 (one-based) of a parameter list in a method call (below; this approach is quite rare)
- ```where alias.property > :value```: via a named parameter, where "value" is defined in the method parameter list (this approach is preferred and in many cases can minimise the number of SQL injection attacks)

The latter two expressions can be accomplished by the same method:

```java
  public Collection<Objects> getAllObjects(Integer firstParam) {
    return entityManager.createNamedQuery("queryName", Objects.class)
      .setParameter("value", firstParam).getResultList();
  }
```

Similarly, the "between" and "and" expression can be used to set a range of values: ```where alias.property between :lowerLimit and :upperLimit```. The EntityManager call would be:

```java
  public Collection<Objects> getAllObjects(Integer firstParam, Integer secondParam) {
    // the order of the parameters matters not
    return entityManager.createNamedQuery("queryName", Objects.class)
      .setParameter("lowerLimit", firstParam)
      .setParameter("upperLimit", secondParam)
      .getResultList();
  }
```

To compare string patterns, with wildcards, use the "like" clause. This example also shows an alternative way of defining and executing queries without using annotations. More specifics re. patterns are given [here](https://openjpa.apache.org/builds/1.2.3/apache-openjpa/docs/jpa_langref.html#jpa_langref_like).

```java
  public Collection<Objects> filterByName(String pattern) {
    return entityManager
      .createQuery("select e from SomeClass e where e.name LIKE :filter", SomeClass.class)
      .setParameter("filter", pattern).getResultList();
  }
```

One can also perform queries within queries, that is, subqueries. More deeply nested subqueries can also be designed though are not generally recommended. This particular example also shows how one record (again, from a TypedQuery<>) is returned, as opposed to a Collection, using ```getSingleResult()```.

```java
  public Objects filterByQuantity() {
    // max() is JQPL function (more later)
    return entityManager
      .createQuery(
        "select e from SomeClass e where e.quantity = (select max(an.someQuantity) from AnotherClass an)",
      SomeClass.class).getSingleList();
  }
```

Note that the method ```getSingleResult()``` is expecting a single entity. If no entity is found or more than one entity is found, then an exception (NoResultException or NoUniqueResultException) will be thrown. Therefore, this approach should only be applied when it is known that there is only one unique result.

To ascertain if a single entity can be found in a given collection, use the "where" and "in" expressions. The following returns a list of SomeClass entities which have an "object" field set to (assume String) "open" or "closed". 

```java
  public Collection<Objects> filterObjectByState() {
    return entityManager
      .createQuery("select e from SomeClass e where e.object.state in ('open', 'closed')", SomeClass.class)
      .getResultList();
  }
```

A subquery can be placed immediately after a "in" clause (instead of the literal form above). To negate "in", that is to check an entity is not present is given by "not in" instead of "in".

The Collection operators, "IS EMPTY" and "IS NOT EMPTY" operate on an entity's collection. These operations can be used to list entities which have collections as fields that are empty or not empty. These operations allow one to list such entities.

```java
  public Collection<Objects> filterObjectByState() {
    // list all SomeClass entities which have a collection field "object" that is not empty
    return entityManager
      .createQuery("select e from SomeClass e where e.someCollection not empty", SomeClass.class)
      .getResultList();
  }
```

The "MEMBER OF" operator can be used to return entities where some object, passed as a parameter, is stored in one of the entity's collection field. See the following.

```java
  public Collection<Objects> filterByName(SomeObject member) {
    return entityManager
      .createQuery("select e from SomeClass e where :check member of e.someCollection", SomeClass.class)
      .setParameter("check", member).getResultList();
  }
```

The "AND" and "ALL" operators provide more functionality to the above expressions. The "AND" operator joins boolean conditions. The "ALL" operator compares all records that proceed it in the expression.

```java
  public Collection<Objects> getAll() {
    // get all SomeClass entities with a non-empty someCollection collection and 
    // whose "quantity" property is less than all "quantity" properties of someCollection
    // entities (the subquery returns a list of quantities from someCollection entities)
    String query = "select e from SomeClass e where e.someCollection not empty " + 
      "and e.quantity < all (select s.quantity from e.someCollection s)";

    return entityManager
      .createQuery(query, SomeClass.class)
      .getResultList();
  }
```

The "ANY" operator can be used in place of the "ALL" operator but unlike the "ALL" operator, it will only check for one (whichever is first returned in the subquery). The "SOME" operator is identical to "ANY" and is essentially an alias to "ANY".

The returned entities can be sorted using "ORDER BY". By default sorting method is ascending ("asc"). To override the default to set to descending, use "desc". To use more custom columns with aliases, use the "as" expression along with "order by"

```java
  public Collection<Objects> sortByName(SomeObject member) {
    String query_asc = "select e from SomeClass e where :check member of " + 
      "e.someCollection order by e.someField.someName";

    return entityManager
      .createQuery(query_asc, SomeClass.class)
      .setParameter("check", member).getResultList();
  }
  
  public Collection<Objects> sortByName_AdjustedDesc() {
    // here the parameter (column) e.someValue + 20 is given the alias "adjusted";
    // the returned list is sorted by "adjusted"
    String query_desc = "select e, e.someValue + 20 as adjusted from SomeClass e" + 
      " order by adjusted desc";

    return entityManager
      .createQuery(query_desc, SomeClass.class)
      .getResultList();
  }
```

## JPQL aggregate functions

Aggregate functions are database optimised functions which perform grouped tasks.

The ```sum()``` function sums a set of data. The Entity Manager query String would be something like ```select d.name, sum(e.value) from SomeClass d join d.collection e group by d.name```, where "collection" is a (Collection type) field of SomeClass. This return a list of the name and the sum of the "collection" entities' "value" field, and sorts them in ascending order by name.

The ```avg()``` and ```count()``` functions return the averaged result and number of rows (records), respectively. Both can be applied in a similar way to ```sum()```.

The ```max()``` and ```min()``` functions return the largest and smallest values of a given field, respectively. Both can be applied as already outlined.

The final aggregate function discussed here is the "having" expression. This (like "group by") is used in conjunction with an aggregate function and filters returns based on the output of an aggregate function.

```java
  public Collection<Object[]> getAllAbove(Integer minThreshold) {
    // this concerns entities which have a collection, "collection"
    // that itself has its own entities each with a "value" field;
    // this then returns an entity that has an average above minThreshold
    String query = "select d.name, avg(e.someValue) from SomeClass d " +
    "join d.collection e where e.anotherCollection is empty " +
    "group by d.name having avg(e.someValue) > :threshold";

    return entityManager
      .createQuery(query, Object[].class)
      .setParameter("threshold", minThreshold).getResultList();
  }
```

For the above snippet, recall that since the return type contains more than one field (a name and a computed average), the entity is returned as a collection of two Object arrays, one holding all name attributes and the other holding all computed averages. (A DTO could be applied instead if desired.)

## An example of the Criteria API

As already mentioned, JPQL is not typesafe (checks cannot be performed at runtime on types defined in String literals) whereas Criteria API is typesafe. The following is a simple example which applied the Criteria API.

```java
  public Collection<SomeObject> queryMethod() {

    CriteriaBuilder builder = entityManager.getCriteriaBuilder();
    CriteriaQuery<SomeObject> cq = builder.createQuery(SomeObject.class);
    Root<SomeObject> root = cq.from(SomeObject.class);

    // equivalent to "select e from SomeObject e where e.name = 'findThisString'
    
    CriteriaQuery<SomeObject> query = cq
      .select(root)
      .where(builder.equal(root.get("name"), "findThisString"));

    return entityManager.createQuery(query).getResultList;
  }
```

Clearly, the Criteria API can be checked for type safety but can get quite verbose.
