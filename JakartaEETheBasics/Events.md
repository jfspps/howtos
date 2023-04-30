---
title: CDI events
nav_order: 5
parent: Jakarta EE The Basics
---

# CDI events

Disparate classes can be linked, such that one observes the events (occurrences) of another. The observer class (an event observer) is not dependency. One can trigger the observer class (the event is fired by the observed class) to run its own code. The observed class passes data (a payload) to the observer class and the observer class processes the payload. Since CDI 2.0, the observer class can run asynchronously to the observed class.

Less abstractly, a user can book tickets online and the data can be managed by a dependency. The dependency can then fire an event (e.g. ticketsBooked) and send data re. the booking to another observer class. The ticket booking dependency continues on with whatever it was assigned to do and the event observer takes the payload and can process it independently of the booking dependency. Another example are mouse clicks. An application processes the action of a mouse click, usually through the OS, while the class fires an event, onClick, which the application then responds to and performs some directed action.

The Event interface allows the application to fire events. The Event interface (as an injected instance) receives the payload. The payload is defined by its own POJO.

```java
public class Payload {
    private String email;
    private LocalDateTime loginTime;
    
    // constructors, getters and setters
    // note that this payload instance is injected so the bean must have a 
    // defined constructor
  }
```

One then injects an instance of the Event interface, usually at the controller level.

```java
// this represents the dependency whose fields are replicated by Payload
@Inject
SomeUserClass user;

// this represents the event that send PayLoad to the observer class 
// (any valid class, including SomeUserClass, could have also been passed)
@Inject
Event<Payload> someEvent;

// the next two fields represent other events which invokes the observer 
// method annotated with @SpecificEvent or @Admin
@Inject
@SpecificEvent
private Event<PayLoad> someSpecificEvent;

@Inject
@Admin
private Event<PayLoad> conditionalEvent;

public void someMethod(){

    // do stuff

    // this fires a plain event
    someEvent.fire(new PayLoad(user.getEmail(), LocalDateTime.now()));

    // do other stuff

    // this fires the specific event
    someSpecificEvent.fire(new PayLoad(user.getEmail(), LocalDateTime.now()));

    // this fires the asynchronous event (the required return, CompletionStage
    // is part of Java 8's concurrent package)
    CompletionStage<PayLoad> fireAsync = someSpecificEvent.fireAsync(
            new PayLoad(user.getEmail(), LocalDateTime.now()));
}
```

The observer class is then defined and lists the methods that are executed when it receives a payload. Note how specific events can be fired. Each method that can be invoked are more generally referred to as "observers".

```java
@RequestScoped
public class EventObserver implements Serializable {
    
    // inject the necessary dependencies
    @Inject
    private Logger logger;

    // this method is invoked by the CDI when someEvent.fire() is executed
    // where fire() is expecting a new PayLoad object parameter
    void plainEvent(@Observes PayLoad eventData) {

        // do something with PayLoad object (via the logger instance for example)

    }

    // invoked by fire()
    void userDidSomething(@Observes @SpecificEvent PayLoad eventData) {
        
        // do something different to PayLoad object only when an Event instance, 
        // annotated by SpecificEvent, is fired

    }

    // invoked by fireAsync()
    void asyncObserver(@ObservesAsync @SpecificEvent PayLoad eventData) {
        
        // run code asynchronously (not blocking); the CDI manages the new thread
        // this is invoked by fireAsync(), not fire(), so would not run alongside 
        // userDidSomething()

    }

    // this runs when the event, annotated by @Admin, is fired
    // notifyObserver checks two conditions, that Reception is set to available and 
    // TransactionPhase is completed (both classes are part of the java.lang.enum package).
    // Without setting "during", then the defaults are 
    // Reception.IS_AVAILABLE and TransactionPhase.IN_PROGRESS
    void conditionalObserver(@Observes(notifyObserver = Reception.IS_AVAILABLE,
            during = TransactionPhase.AFTER_COMPLETION) @Admin PayLoad eventData) {
        
        // this only runs when the conditions are satisfied

    }
}
```

The custom annotation <span class="annot">@SpecificEvent</span> is given below.

```java
@Qualifier
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.PARAMETER, ElementType.FIELD})
public @interface SpecificEvent {
}
```

If there are multiple observers (methods) then the CDI will execute all in a random order. A specific order can be established by passing the <span class="annot">@Priority(100)</span> annotation. Passing lower integers into the <span class="annot">@Priority()</span> annotation causes the CDI to place more priority to the annotated observer.

```java
void runMeSecond(@Observes @Priority(20) PayLoad someData){
// run this second
}

void runMeFirst(@Observes @Priority(10) PayLoad someData){
// run this first
}
```
