---
title: Bean discovery mode
nav_order: 3
parent: Jakarta EE The Basics
---

# Bean discovery mode

__Bean discovery__ is handled by the _beans.xml_ configuration. By default, the __bean-discovery-mode__ is
set to "annotated" and directs only annotated classes (beans) to be managed by the CDI runtime. The other discovery
mode is "all" and directs all beans to to be managed by the CDI runtime. Generally, most projects use the "all"
mode.

Assuming the program runs, then the object will not be null and can be accessed by its reference from anywhere in the application.

# CDI container, beans and contextual instances

The CDI container can be viewed as factory where beans (classes which will be instantiated in preparation for DI) are managed and looks out for adherence to the API standards. Failure to do so prevents the program from running.

The context is a part of the container where beans are instantiated. Contexts build objects, known as contextual instances and there can be more than one context present in the container. Dependencies can be injected through class fields, via a constructor or directly into methods. To do so, set the field/constructor/method with the @Inject annotation.

## Lifecycle callbacks

The ```@PostConstruct``` and ```@PreDestroy``` are applied to methods which will be executed, respectively, once the contextual instance is built and before it is destroyed. The access modifiers private, package-private (i.e. nothing declared), protected (visible to parent and child classes only) and public can be applied.

## Managed beans and bean types

Managed beans are simply beans managed by the CDI runtime. Beans which appear to be of the same type: they implement the same interface (and all parent interfaces before it), for example. The correct dependency is injected via a mechanism known as __CDI qualifiers__.

If one has an interface which can be implemented differently, such as:

```java
public interface CommonInterface{
}
```

One can direct the CDI container to instantiate a specific bean that implements CommonInterface. First define said bean:

```java
@annotationsPackagePath.CustomBean
public class SomeClass implements CommonInterface {
// some fields/methods unique to SomeClass
}
```

Then set a custom annotation CDI qualifier:

```java
// in annotationsPackagePath

@Qualifier
@Retention(RetentionPolicy.RUNTIME)
// set how the dependency can be injected:
@Target({ElementType.FIELD, ElementType.TYPE, ElementType.METHOD})
public @interface CustomBean {
}
```

The ```@Retention``` annotation is explained later. A separate custom interface annotation (CustomBean) is required for each different implementation of CommonInterface.** Inject a specific implementation of CommonInterface:

```java
@Inject
// use SomeClass implementation of CommonInterface
@CustomBean
private CommonInterface someInstance;
```

Note that the above CustomBean refers to one specific type of bean. **A more concise way of declaring a CDI qualifier involves enumerations (it is possible to use other types, though enums are generally safer). That is, only one CustomBean interface needs to be defined.

```java
// in annotationsPackagePath

@Qualifier
@Retention(RetentionPolicy.RUNTIME)
// set how the dependency can be injected:
@Target({ElementType.FIELD, ElementType.TYPE, ElementType.METHOD})
public @interface CustomBeanManager {
CustomBeanType value();

// inner class of constants (enum)
public enum CustomBeanType{
    TYPE1, TYPE2
}

}
```

The important part is pairing SomeClass with CustomBeanManager's value. This is done by setting the specific class with the given value. Note that the ```@annotationsPackagePath.CustomBean``` is no longer needed.

```java
// SomeClass is assigned TYPE2
@CustomBeanManager(value = CustomBeanManager.CustomBeanType.TYPE2)
public class SomeClass implements CommonInterface {
// some fields/methods unique to SomeClass
}
```

Then use the SomeClass (TYPE2) implementation with the following.

```java
@Inject
// use SomeClass implementation of CommonInterface
@CustomBeanManager(value = CustomBean.CustomBeanType.TYPE2)
private CommonInterface someInstance;
```

## CDI scopes and contexts

The context is the environment within the container where contextual instances are created and reside. There can be more than one context in the given container. The container is responsible for the lifecycle of all contexts. When a bean is instantiated in a particular context, the bean is said to be in scope of the given context and is bound to that context. Scopes are definitions that associate a managed bean with a context. That is, it defines which context is responsible for the lifecycle of the bean.

Any bean that is not assigned a scope is by default assigned the DependentScope (optionally, the bean can be annotated with ```@Dependent``` to signify this). The DependentScope is a class which defines the scope of a bean that is not a dependency of any particular context when instantiated. When it is injected into, say, Bean2, which is assigned a scope (so other than DependentScope) then the injected bean will inherit whatever scope Bean2 is assigned. This is why it is called DependentScope because the injected bean's scope depends on what other bean it is injected into.

All CDI beans are <i>lazily</i> created: they are only instantiated when needed. There are other scopes:

+ Request scoped (annotate bean with ```@RequestScoped```): a context which creates and destroys beans based on HTTP requests
+ Session scoped (annotate bean with ```@SessionScoped```): a context based on client-server sessions (conversations as such), beans are created on session startup and destroyed when a session is closed. Session contextual instances tend to run over long periods and consequently bound contextual instances can persist in memory for the same duration. To optimise memory use on the server, contextual instances are set into service when needed but then _passivated_ by the container (placed into hibernation) until they are needed again.
+ Application scoped (annotate bean with ```@ApplicationScoped```): lifecycle of the bean parallels the lifetime of the application. Consequently, only one contextual instance of the given type can exist and as such application scoped instances follow a Singleton pattern.
+ Conversation scoped (annotate with ```@ConversationScoped```): related to JSF API and can partly be viewed as Models in Spring. They have a lifetime shorter than the session and traverse along HTTP requests.
