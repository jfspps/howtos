---
title: Primary keys, relational mapping and embedding Collections
nav_order: 3
parent: Jakarta EE The JPA
---

# Primary keys

Primary keys can take the form of different Java types, not only (wrapped) Long types. Generally, the floating point types like double and Double are not recommended given the representation is not uniformly defined across systems. 

Primary keys generation types vary. The annotation ```@GeneratedValue(strategy = GenerationType.AUTO)``` assigns responsibility of primary key generation to the JPA provider and is fine for development. For deployment, this is not recommended since more control is generally expected. The primary key is only set once the transaction (for example, an insertion) has been completed.

The annotation ```@GeneratedValue(strategy = GenerationType.IDENTITY)``` directs supporting providers to generate unique primary keys in a primary key column. Not all implementations support a dedicated primary key column.

Some database implementation enable (indeed, expect) custom sequences of integers to be constructed, using the SEQUENCE command. In these cases, the database does not have an automatic schema generator (requires administration). By default, a primary key is constructed as unit integers, that is, the next key is one integer greater than the previous. The SEQUENCE command can be used to define a different sequence. The application of the custom sequence can be directed using the annotations ```@SequenceGenerator``` in combination with ```@GeneratedValue```.

```java
public class someClass {

    @SequenceGenerator(name = "CustomSeq", sequenceName = "newKeySeq")
    @GeneratedValue(generator = "CustomSeq")
    @Id
    private Long id;

    // this query would be executed in the DB client beforehand
    // CREATE SEQUENCE newKeySeq MINVALUE 1 START WITH 1 INCREMENT BY 20

    // other fields and methods
}
```

A more flexible primary key generator is the Table Generator and tends to be used during deployment. This generates a separate table in the database which specifically acts as a mapper between the Java object and its persistent entity on the database. 

```java
public class someClass {

    @TableGenerator(name = "tableGen", table = "pkTable",
            pkColumnName = "generatedIDsPKs", valueColumnName = "latestPK")
    @GeneratedValue(generator = "tableGen")
    @Id
    private Long id;

    // other fields and methods
}
```

Going through each part (above), the name of the table is "pkTable". The primary key column for _pkTable_ is "generatedIDsPKs". The second column in _pkTable_ labelled "latestPK" contains a record of the last primary key that was set. This last column informs the JPA provider what the next key should be, normally one unit integer higher. It examines the value in this column and then proceeds to assign the next entity primary key based on teh value in "latestPK".

# Relational mapping with JPA

Relationships between two entities can either be unidirectional or bidirectional (explain in more detail shortly). An address related to a employee is normally unidirectional since it makes more sense for the employee to know its address but it does not make sense for an address to know its employee.

The _cardinality_ refers to the number entities at the end of each relationship. From a department's viewpoint, the department will have many employees, and be one-to-many. From the employees viewpoint it would be many-to-one. The cardinality is one for the department and many for the employees, as such.

The _ordinality_ (or "optionality") refers to a boolean which denotes whether or not a entity must be defined when persisting data. Other authors refer to ordinality as the minimum number of entities that must exist in a given relationship. In order for employees to be saved to the database, a department must exist. However, in order for a department to be saved, having employees is not a requirement. From a global viewpoint, the ordinality (in the department-employee relationship) is said to be "0" or false for employee and "1+" or true for the department.

## Single-valued associations

_Single-valued associations_ are those where there is only one entity at the target end of the relationship. From the employee point of view, whether there is one employee or multiple employees, the target entity (the department) is the sole entity. As such, there are consequently either one-to-one and many-to-one relationships.

The annotations used are ```@ManyToOne``` and ```@OneToOne```.

```java
public class Employee {

    // to the "left" of the annotation, there are many Employees and to
    // the right is one department; note, this assumes field access
    // the optional @JoinColumn annotation sets the provider foreign key (join) column name
    @ManyToOne
    @JoinColumn(name = "departmentID")
    private Department department;
    }

    // some other class file

    public class Department {

    // Department is owned by Employee (see Multivalued relationships)
    @OneToMany(mappedBy = "department")
    private List<Employee> employees = new ArrayList<>();
}
```

To parse this, read the source from the class' point of view. Reading from the Employee literal, of which there are many, is a department, of which there is one. There will be a column in the Employee, known as the _foreign key column_ (in JPA, the "join column", named according to the provider defaults), which references the primary key of the Department table. Thus, the Employee table will store not only the primary keys of its employee entities but also the reference (a foreign key) of the Department entity. The Department table currently does not store references re. the Employees. It does not know anything about Employee entities. As such, the Employee is said to have <b>ownership</b> over the relationship.

By default, the join column name is normally "targetName_id". To customise the name of the join column, annotate the Department field with ```@JoinColumn(name = "departmentID")```, see above.

One-to-one relationships are single-valued and unidirectional. The owner of the relationship is given by the class that references to the other entity.

```java
public class Employee {

    @OneToOne
    private PaySlip payslip;
    }

    // some other class file
    public class PaySlip {

    // various other fields and methods (no reference to Employee)
}
```

In the above case, Employee is the owner of the relationship. The ```@JoinColumn``` annotation can be applied to the PaySlip reference in the same way. In both one-to-one and many-to-one relationships, one can only traverse from one entity to the other in one direction, that is, from Employee to Department and from Employee to PaySlip. Such relationships are _unidirectional_.

_Bidirectional relationships_ are those where it is possible to traverse between entities in both directions of the relationship (or continuum). In this case, both entities would need to reference the other entity in their respective Java beans.

To set Office with the ownership via the join column, set as follows. In this case, the Office entity is the owner and the Employee entity is owned.

```java
public class Employee {

    // use the name of the Java bean field
    @OneToOne(mappedBy = "employee")
    private Office office;
    }

    // some other class file
    public class Office {

    @OneToOne
    @JoinColumn(name = "EMPLOYEE_ID")
    private Employee employee;
}
```

## Multivalued associations

When there is more than one target entity, it gives rise to Collection valued relationships. This includes one-to-many and many-to-many relationships.

The one-to-many relationship has been shown previously between employees and the department (above).

```java
public class Employee {

    // the optional @JoinColumn annotation sets the provider foreign key (join) column name
    @ManyToOne
    @JoinColumn(name = "departmentID")
    private Department department;
    }

    // some other class file

    public class Department {

    // Department is owned by Employee
    @OneToMany(mappedBy = "department")
    private List<Employee> employees = new ArrayList<>();
}
```

Note that the ```@OneToMany``` annotation ensures that one can traverse from Department _to_ Employee and ensure that the relationship is bidirectional. Without the ```@OneToMany``` annotation, the relationship would be unidirectional (from Employee to Department).

A single entity on the one-side is unable to store the foreign keys of multiple entities from the many-side (a single cell in a row can only hold one value). To proceed, virtually all one-to-many relationships require a complimentary many-to-one declaration given on the one-side's target. That is, <b>one cannot have a ```@OneToMany``` annotation in Department without the ```@ManyToOne``` on the Employee side</b>. The converse though is not a requirement, that is, a ```@ManyToOne``` annotation in Employee can exist without the ```@OneToMany``` in Department. (Each Employee will only need to store one foreign key to one department.) If the ```@OneToMany``` annotation is omitted then the JPA provider will build a separate join table (explained shortly) to enable the one-side to store the foreign keys.

The many-to-many relationship is signified by the ```@ManyToMany``` annotation. This brings in _join tables_ which are separate tables that are solely purposed to store primary keys of the related entities.

```java
public class Employee {

    // option to fetch lazily (this is the default anyway)
    @ManyToMany(mappedBy = employees, fetch = FetchType.LAZY)
    private List<Project> projects = new ArrayList<>();

    }

    // another class file

    public class Project {

    // in order, the annotation options are
    // 1. join table name
    // 2. column of PKs of the owning entity
    // 3. column of PKs of the owned entity
    @ManyToMany
    @JoinTable(
        name = "Employees_Projects",
        joinColumns = @JoinColumn(name = "projectID"),
        inverseJoinColumns = @JoinColumn(name = "employeeID"))
    private List<Employee> employees = new ArrayList<>();
}
```

The owned table (entity) is signified by a field with ```@ManyToMany(mappedBy = "ownerField")``` annotation.

With the above relationships, it is necessary to control what other related entities are loaded when a contextual instance is constructed. This is handled with options to the relationship annotations. Note that the provider is not bound to fetch lazily or eagerly, and any fetch annotation is considered a suggestion (consult the provider documentation).

# Embedding Collections

Previously embeddable objects were given their own allocation in the database when the embedded object was persisted to a database. The above example focused on one entity.

To embed a Collection, annotate the field with ```@ElementCollection```. The HelperClass objects are not JDK entities. Generally all non-JDK entities are flagged with ```@ElementCollection```. This causes the provider to build a secondary table, where one column stores a reference to the Employee table and the remaining columns relate to the fields of the HelperClass.

```java
@Embeddable
public class HelperClass {
    // other fields and methods
}

// in some other class file...

public class MainClass {

    // this actually directs the provider to build a secondary table of 
    // HelperClass entities (@CollectionTable is optional)
    @ElementCollection
    @CollectionTable(
        name = "secondaryTableName", 
        joinColumns = @JoinColumn(name = "employeeID"))
    private Collection<HelperClass> embeddedClasses;

    // getters and setters etc.
}
```

The JPA handles the mapping and build of a separate table. The ```@CollectionTable``` overrides the defaults of the secondary table.

Standard JDK entities can be stored along with the owning entity in their own column, as opposed to being stored in a separate table. To handle Collections of standard JDK entities, for example String, use a combination of ```@ElementCollection``` and optionally customise the name of the ```@Column(name = "collectionColumnName")``` annotations.
