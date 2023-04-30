---
title: CDI Producers
nav_order: 4
parent: Jakarta EE The Basics
---

# CDI Producers

Producers are non-void methods (annotated with <span class="annot">@Produces</span>) that convert Java classes, not normally managed or owned, into CDI managed beans. The method must return an object. The method parameters are optional but must be injectable. All are handled by the container.

The return object is not normally handled by the CDI container e.g. an instance of Logger. 

```java
import javax.enterprise.inject.Produces;
import javax.enterprise.inject.spi.InjectionPoint;
import java.util.logging.Logger;

public class LoggerProducer {

    // note that Logger is now a bean
    @Produces
    public Logger produceLogger(InjectionPoint injectionPoint) {
        return Logger.getLogger(injectionPoint.getMember().getDeclaringClass().getName());
    }
}
```

Any class which attempts to inject a Logger instance automatically triggers the execution of produceLogger() and returns the Logger instance as a contextual instance.

```java
//Producer object in a class that implements Serializable, inheriting the same scope
@Inject
private Logger logger;
```

The Producer converts Logger into a bean, scoped as the DependentScope, and in many ways can be viewed as implementations of Factory design patterns. The above injection in particular is scoped according to the calling class.

Any object from the Java library can be returned and managed as a bean e.g. a Collections API List of Strings, for example.

```java
public class SomeNonBean {

    @Produces
    public List<String> getList() {

        List<String> someList = new ArrayList<>();

        someList.add("Greetings");
        someList.add("Bye for now");
        
        return someList;
    }
}
```

Classes can also be injected directly as managed beans using fields. This works if the non-bean does not require further inquiry (e.g. EntityManager).

```java
public class SomeNonBean {

    @Produces
    SomeOtherNonBean example;
}

// some other class, inject SomeOtherNonBean

@Inject
SomeOtherNonBean anotherBean;
```

Related to the above discussion about CDI qualifiers, the producers (methods or fields) can be qualified to eliminate ambiguity. Consequently, an injection of CommonInterface will invoke the above Producer method.

```java
public class SomeNonBean {

    @Produces
    // the important bit is here:
    @pathToPackage.CustomBean
    public CommonInterface getTheRightBean() {        
        return new CustomBean;
    }
}

// some other class

@Inject
// recall, CustomBean is an annotation referencing SomeClass
// SomeClass is one implementation of CommonInterface
@CustomBean
private CommonInterface someInstance;
```

Methods or events can be executed to the contextual instance, produced from the Produces annotation, before the instance is destroyed. This can be achieved by using the <span class="annot">@Disposes</span> annotation.

```java
public class SomeNonBean {

    @Produces
    SomeOtherNonBean example;

    // note that the method must return void
    public void dispose(@Disposes SomeOtherNonBean currentInstance) {
        // do stuff to currentInstance before SomeOtherNonBean instance is destroyed
    }
}

// some other class, inject SomeOtherNonBean

@Inject
SomeOtherNonBean anotherBean;
```

# CDI Interceptors

Interceptors intercept method calls and execute other functions (auditing, security etc.) before the method is executed. Interceptors can also help decide if the method call goes ahead.

Interceptors are implemented by declaring the method that is intercepted and the interceptor code (the binding code)that is executed. Typically, a custom annotation is defined, giving the target type i.e. does the interceptor intercept a method or class. If a class is the target then all methods of the class are intercepted. The approach is similar to Aspect Orientated Programming paradigms.

```java
@InterceptorBinding
@Retention(RetentionPolicy.RUNTIME)
// consecutively, by method and by class
@Target({ElementType.METHOD, ElementType.TYPE})
@Inherited
public @interface Logged {
}
```

The interceptor binding code is demonstrated next. This could run, for example, security related functions. The InvocationContext interface is used to pass info related to calling method and its class so decisions about what to do now next can be carried out.

```java
  @Logged
  @Interceptor
  // this activates the interceptor (Java EE 7+ ; previously done via XML config)
  @Priority(Interceptor.Priority.APPLICATION)
  public class LoggedInterceptor {
  
    @Inject
    private Logger logger;

    private String username = "Jimi";
  
    // This method will be called by the container when the interceptor is triggered
    // InvocationContext passes info re. the class where the interceptor was 
    // triggered/invoked (the invocation target) and grants the runtime access to the 
    // class, allowing it to handle its properties
    @AroundInvoke
    public Object logMethodCall(InvocationContext context) throws Exception {

        // Log for example user who called method and time
        logger.log(Level.INFO, "User {0} invoked {1} method at {2}", 
            new Object[]{username, context.getMethod().getName(), LocalDate.now()});

        // allow the context to continue with the method called
        return context.proceed();
    }

    // other methods and fields...
    }
```
