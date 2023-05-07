---
title: Persistence context and Entity Manager
nav_order: 6
parent: Jakarta EE The JPA
---

# The persistence context and entity manager

_Persistence units_ are XML file configurations which group persistence entity classes as discrete units. The file "persistence.xml" is stored in /resources/META_INF. Within each persistence unit are settings, for example, data sources and transaction types.

```xml
<persistence xmlns="http://xmlns.jcp.org/xml/ns/persistence"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="2.2"
  xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/persistence 
  http://xmlns.jcp.org/xml/ns/persistence/persistence_2_2.xsd">

  <!-- Define persistence unit below -->
  <persistence-unit name="my-persistence-unit">
  </persistence-unit>

</persistence>
```

A _persistence context_ is a pool of managed entities (entities managed by the Entity Manager; more shortly). One can think of the persistence context as scratch space or a cache between the model layer and the viewer layer of an MVC framework. All classes that fall under a given persistence unit are managed in their own persistence context by the entity manager. Most of the time, the persistence context is hidden from the application and developer.

The _entity manager_ operates on persistence contexts, of which there can be many. The entity manager itself, like all Java beans, is declared in its own class. If there are more than one persistence units available then it will be necessary to link the entity manager instance with the required persistence unit. If there is only one persistence unit then the CDI will link the entity manager instance automatically. 

```java
public class AppProducers{

    // use @PersistenceContext(unitName = "my-persistence-unit") 
    // if there are >1 units

    // Recall, the EntityManager is assumed as CDI managed bean with 
    // @Produces and allows EntityManager instances to be injected

    @Produces
    @PersistenceContext
    EntityManager entityManager;

}
```

The application container handles the lifetime of the entity manager. One then injects the entity manager into a class where the instance is required, without worrying about its lifecycle.

An CRUD-style example of a service example is given below (this example will not compile at present as there are other required annotations missing). The injected QueryService bean is also defined below. 

```java
@Stateless
public class PersistenceService {

    @Inject
    EntityManager entityManager;

    // use the QueryService methods instead of redefining them here
    @Inject
    QueryService queryService;

    public void saveDepartment(Department department) {
        entityManager.persist(department);
    }

    public void removeParkingSpace(Long employeeId) {
        Employee employee = queryService.findEmployeeById(employeeId);
        ParkingSpace parkingSpace = employee.getParkingSpace();

        // update employee before removing (one-to-one mapping in place)
        employee.setParkingSpace(null);

        entityManager.remove(parkingSpace);
    }

    public void saveEmployee(Employee employee, ParkingSpace parkingSpace) {
        employee.setParkingSpace(parkingSpace);

        // this will also persist the ParkingSpace entity (explained below)
        entityManager.persist(employee);
    }

    public void updateDepartment(Department department) {
        entityManager.merge(department);
    }
}
```

When a new transaction begins, a persistence context is initialised. Changes to the database entities are not made to the database entries (rows) directly but are instead made to entities pulled (using find()) from the database to the persistence context. Once the transaction is committed, any entities in the persistence context are sent back to the database that have matching IDs, thus saving any changes. The transaction is then no longer in action and the persistence context is flushed.

The key EntityManager methods to note are persist(), find(), detach(), merge() and remove().

+ persist() - save the new entity (not already in the persistence context) to a given persistence context (and ultimately the database)
+ find() - find the entity on, usually by primary key, from the persistence context or the provider (more below)
+ detach() - remove the entity from the persistence context (usually sent to the viewer layer, e.g. JSF); this does not remove the entity from the database
+ merge() - the opposite of detach(), placing the object into the persistence context; this is also used to update entities once the transaction is committed
+ remove() - remove the entity from the persistence context and database

Recall that the entity manager operates on the persistence context. A few comments are in order.

+ An exception is thrown when persist() is performed on an entity that already exists in the database
+ The method find() first queries the persistence context and if the entity cannot be found it then queries the provider's database, and places anything found in to the persistence context
+ Detached entities are no longer part of the persistence context. Changes to the detached entity are not automatically applied to the corresponding entity on the database.
+ If the entity was found (using find()) on the persistence layer then it automatically becomes detached. Fields of an entity that are set to be loaded lazily can only be retrieved from the database while the entity resides in the persistence context. Hence, lazily loaded fields must be retrieved (if required later) before the entity is detached, either through detach() or find(). Any getter related to a lazily defined field (that has not already been accessed) that is executed on a detached entity will return undefined behaviour. To get around this, first extract the field data before detachment.

When the transaction is committed, all entities in the persistence context will be transferred to the database. Subsequent calls to a operation will trigger a new transaction and a new persistence context.

```java
@Stateless
public class QueryService {

    @Inject
    EntityManager entityManager;

    @PostConstruct
    private void init() {
    }

    @PreDestroy
    private void destroy() {
    }

    public List<Department> getAllDepartments() {
        return entityManager.createNamedQuery(
          Department.GET_DEPARTMENT_LIST, Department.class).getResultList();
    }

    public List<String> getAllDepartmentNames() {
        return entityManager.createNamedQuery(
          Department.GET_DEPARTMENT_NAMES, String.class).getResultList();
    }

    public List<ParkingSpace> getAllAllocatedParkingSpaces() {
        return entityManager.createNamedQuery(
          Employee.GET_ALL_PARKING_SPACES, ParkingSpace.class).getResultList();
    }

    public Collection<Object[]> getEmployeeProjection() {
        return entityManager.createNamedQuery(
          Employee.EMPLOYEE_PROJECTION, Object[].class).getResultList();
    }

    public List<EmployeeDetails> getEmployeeDetails() {
        return entityManager.createNamedQuery(
          Employee.EMPLOYEE_CONSTRUCTOR_PROJ, EmployeeDetails.class).getResultList();
    }

    public Department findDepartmentById(Long id) {
        return entityManager.find(Department.class, id);
    }

    public Employee findEmployeeById(Long id) {
        return entityManager.find(Employee.class, id);
    }
}
```

Related entities can be made to persist automatically when the owning entity is persisted. For example, when an employee entity is saved (or furthermore, merged, detached, refreshed or removed), so too would their ParkingSpace entities. This automated form of operations is a referred to as _cascading_. 

```java
public class Employee extends AbstractEntity {

  // other fields and methods

  @OneToOne(
    mappedBy = "employee", 
    fetch = FetchType.LAZY, 
    cascade = CascadeType.PERSIST)
  private ParkingSpace parkingSpace;

}
```

In the above case, whenever an Employee entity is persisted, then its ParkingSpace entity is also persisted.

## Configuring the persistence unit

The XML to the persistence unit can be configured to runtime properties according to the requirements. Normally there is only one unit in a given XMl configuration (persistence.xml).

The name (in this case, "my-persistence-unit") is the unique identifier of the persistence unit.

```xml
<persistence xmlns="http://xmlns.jcp.org/xml/ns/persistence"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="2.2"
  xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/persistence 
  http://xmlns.jcp.org/xml/ns/persistence/persistence_2_2.xsd">

  <!-- Define persistence unit below -->
  <persistence-unit name="my-persistence-unit">
  </persistence-unit>

</persistence>
```

The transaction type defines the type of transaction used by the entity manager. The JTA is the Java Transactions API and is the default (and most commonly applied). This then directs the container to handle the transactions in the background and is generally recommended overall. (To manually handle transactions, use RESOURCE_LOCAL.)

To set the persistence provider, use the provider tags. Different application servers apply their own default provider and so if the provider tag is absent, then the default set by the application server is assumed. Payara server ships with EclipseLink, for example.

```xml
<persistence xmlns="http://xmlns.jcp.org/xml/ns/persistence"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="2.2"
  xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/persistence 
  http://xmlns.jcp.org/xml/ns/persistence/persistence_2_2.xsd">

  <!-- Define persistence unit below -->
  <persistence-unit name="my-persistence-unit" transaction-type="JTA">

    <provider>
      <!-- Override the default application server JPA provider -->
    </provider>

    <jta-data-source>
      java:app/pathTo/theDB
    </jta-data-source>

    <exclude-unlisted-classes>false</exclude-unlisted-classes>

    <properties>
      <!-- Set the application deployment properties -->

      <property name="javax.persistence.schema-generation.database.action" 
        value="drop-and-create" />

      <!-- Handle scripts (if value="drop" then the create-target is not expected etc.) -->
      <property name="javax.persistence.schema-generation.scripts.action"
        value="drop-and-create"/>

      <property name="javax.persistence.schema-generation.scripts.drop-target"
        value="file:///c:/scripts/dropped.ddl"/>

      <property name="javax.persistence.schema-generation.scripts.create-target"
        value="file:///c:/scripts/created.ddl"/>

    </properties>

  </persistence-unit>

</persistence>
```

The JTA datasource tag (optional) defines the configuration (usernames, passwords etc.) need to allow the application server to connect to the database. The datasource itself can take the form of an annotation <span class="annot">@DataSourceDefinition()</span> and list the required settings for a class which requires access to the database. The name given in the "jta-data-source" tag references the name attribute of the <span class="annot">@DataSourceDefinition()</span> annotation.

```java
@DataSourceDefinition(
  name = "java:app/pathTo/theDB",
  className = "org.apache.derby.jdbc.ClientDriver",
  url = "jdbc:derby://localhost:1976/theDB",
  user = "usernameHere",
  password = "pwd")
@Stateless
public class SomeService {

  @Inject
  EntityManager entityManager;

  // other methods and fields

}
```

The datasource can also be set more globally (and arguably more concisely) in the web.xml file (usually located in the same directory as beans.xml: /main/webapp/WEB_INF/).

```xml
<web-app ...>

    <data-source>
        <name>java:app/pathTo/theDB</name>
        <class-name>org.apache.derby.jdbc.ClientDriver</class-name>
        <url>jdbc:derby://localhost:1976/theDB</url>
        <user>usernameHere</user>
        <password>pwd</password>
    </data-source>

</web-app>
```

To define non-JTA datasources, use "non-jta-data-source" tag instead of "jta-data-source". Post Java EE 7, if both JTA and non-JTA tags are omitted from the XML configuration then the application will use an in-memory database.

Classes not marked as JPA classes (i.e. not JPA annotated) are not scanned or included in the given persistence unit if the "exclude-unlisted-classes" tag is set to true. If the tag is set to false, then all classes (regardless if annotated as JPA classes or not) are scanned and included.

Finally, deployment properties are given by the "properties" tag. A commonly set property relates to schema generation (given above) handled by the JPA provider. The other schema generation options are "none" (the default, equivalent to having no "property" tag), "create" and "drop". Scripts can also be managed with the scripts property. A dropped script and a new script (both optional) can be applied.
