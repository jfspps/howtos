---
title: EJBs and transactions
nav_order: 5
parent: Jakarta EE The JPA
---

# Enterprise JavaBeans EJBs

Components are self-contained units and can be defined by a class. Java EE gives a component driven APIs, known as EJBs, to help solve business applications. It provides a set of constructs which form an abstract layer and removes (encapsulates) common tasks such as security and scaling amongst others. While historically, EJBs and the JPA were interwoven, now more modern versions of EJB (to date, version 3) are separated but still complimentary to the JPA.

EJBs is largely an annotation driven API. A lot of defaults are set for the developer, and only need to be overridden when needed (in exceptional cases). EJB is aligned with Java EE's CDI and all dependencies are handled automatically by a "EJB container" which specifically manages all forms of EJBs and mirrors much of functionality of the CDI. EJB components have automatically managed lifecycles. They are scalable, secure and portable. All transactions are also handled in the background.

The EJB container and the "EJB component model" are the first and second parts of the EJB architecture. The latter is where the developer focuses on. There are different parts of the component model, or different types of EJBs.

- Stateless EJBs
- Stateful EJBs
- Singleton EJBs

The _stateless session bean_ is an EJB that is designed to complete a given task within the lifetime or cycle of a single method. It is very much like a request-scoped bean. To build a stateless session bean, annotate a POJO with the ```@Stateless``` annotation.

```java
@Stateless
public class SomeService {

    // methods involving other beans
}
```

All methods defined in an EJB are exclusive. Each method does not assume or know about if other methods in the same EJB were invoked before or after its execution. This is because when the method is invoked, the container will take  one EJB from a predefined pool of EJBs, execute the method and then return the EJB to the pool once the method is finished. If it is invoked again, the container will pass another EJB instance (which may or may not be the same as that passed before) and then return the EJB again on completion. This is an example of a _stateless_ bean. This also means that the methods defined in an EJB are isolated and do not rely on one another.

Stateless EJBs pop in and out of a pool of EJB(s), running the method on a needs basis. This makes stateless EJBs scalable and memory efficient. They do not store the state of the system and are overall expendable units. This also marks the beginning and ending of a transaction (when an EJB is injected and when it is returned).

The complement of a stateless EJB is a _stateful_ EJB. Annotate the POJO with ```@Stateful```. Examples of this include a shopping cart. When methods are invoked, it consults the current state of the system and runs based on its state. The stateful EJB can be placed in passive mode, where it resides in the background without taking up vital resources. It is not committed to a (stateless) pool. The state is unique to a client (no use sharing the same shopping cart).

The third type of EJBs are beans which are instantiated only once, throughout the application lifetime, and are known as _Singleton EJBs_. They are stateful and are generally used to share information or state across the entire application and furthermore its state is not handled elsewhere. Annotate the bean with ```@Singleton```. To force the bean to run on startup (i.e. eagerly) then use ```@Startup``` annotation, otherwise it is instantiated lazily when it is needed (this is the default action).

Stateless and singleton EJBs have two lifecycle stages.

+ ```@PostConstruct``` - annotates a void method which is invoked after an EJB is "created"
+ ```@PreDestroy``` - annotates a void method that is invoked before an EJB is destroyed

Stateful EJBs can apply the @PostConstruct and @PreDestroy annotation but also have:

+ ```@PrePassivate``` - invokes a void method before the bean is hibernated or put to sleep as it were
+ ```@PostActivate``` - invokes a void method right after the bean is returned from its passivated state

Jakarta EE also provides message driven beans. This is not covered here.

# Transactions with the JPA

Transactions group operations such that the operations only persist data to a database if all operations in the same group succeeded. If one or more operations failed for whatever reason then all operations are nullified or cancelled. The transaction is characterised by four properties (an acronym of ACID):

- Atomicity - the transaction is broken up into its smallest, simplest operations
- Consistency - the outcomes of the transaction following all atomic operations must be consistent with some expectation (requesting cash out of an ATM and then either receiving cash or no cash is consistent; receiving a bowl of fruit is not)
- Isolation - changes within an individual transaction are not globally visible to other transactions in the application until the transaction is successful
- Durability - changes resulting from a transaction endure or persists long after the transaction has completed

There are two approaches to transaction management: bean management and container management, the latter of which is practised most widely and the default under the Java EE framework. Container management directs the application server to handle the transactions. Bean management requires the developer to manage transactions. 

Since container managed transactions are the default, then all methods are by default transactional. To signal bean management, use the ```@TransactionManagement(TransactionManagementType.BEAN)``` annotation for the given class or bean. This latter approach tends to go against the whole point of EJBs and is not discussed further here. The default would be ```@TransactionManagement(TransactionManagementType.CONTAINER)```.

One can fine tune container managed transaction operations (by annotating the methods within a container managed transactional bean) with ```@TransactionAttribute(TransactionAttributeType.OPTION)```, where OPTION = NEVER, OPTION = MANDATORY and OPTION = NOT_SUPPORTED, OPTION = REQUIRED amongst others. "Never" means never run this method as a transaction, "Mandatory" means that the method must be run in a transaction, "Not_supported" means this method does not support being run in a transaction (and an exception is raised if an attempt to do so occurs) and the default "Required" means a method should be invoked in a transaction (if there is no transaction, then one is created in the background). 
