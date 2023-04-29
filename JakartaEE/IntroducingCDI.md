# Context Dependency Injection CDI #

__Inversion of control (IOC)__ is a paradigm which enables individual components of a program to be loosely
coupled with one another. It makes large scale programs to be extended more easily and tested more independently.
The primary responsibility of instantiating and supplying (injecting) objects is not handled by the method executed.
IOC is implemented by __dependency injection (DI)__, in which the container manages the instantiating of classes
(beans) and injects them into a method.

Some of the main features of CDI 2.0 (an API that implements DI) are:

+ Typesafe dependency: the dependencies are typesafe; the compilation or runtime execution of the context is       halted if the wrong type is passed to a method
+ Lifecycle contexts: the context (where beans are instantiated) and objects (contextual instances) have a lifecycle and are automatically managed in the background by the container
+ Interceptors: these can perform tasks before, during and after a method is executed (typical example includes the logging of metadata for a specific method)
Events: these are responses to particular events executed by the user or program, and can be asynchronous
+ Service Provider Interface: these are extensions available to the CDI
