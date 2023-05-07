---
title: Jakarta RESTful Web Services
nav_order: 1
parent: Jakarta EE JAX-RS
---

## Jakarta RESTful Web Services

JAX-RS is an API that is part of the Java EE standard (previously known as Java API for RESTful Web Services), and uses interfaces and annotations to support the construction of RESTful Web Services. It is not necessary to include other dependencies when the ```javaee-api``` is imported. This introduction presents the minimum required to build a RESTful web service with JAX-RS.

The REST architecture is specification within a set of constraints. For example, the client (be it Angular, React, Vue etc.) must be separated from the server (.NET, Python, Spring, Java etc.), and are independent units. There are a few other constraints:

- The client-server requests are all stateless. Each request is treated independently of all other requests and do not depend on the ongoing execution of other requests.
- The client and server should cache resources to help with performance and scalability
- The client should have general interface that can access resources on the server. The server must in turn expose a general uniform interface from which the client can access resources.
- The server should be built around a layered system and is required as a part of a load balancer related to scaling

## JAX-RS configuration classes

Classes (representing different REST API versions, for example) which extend ```javax.ws.rs.core.Application``` constitute the definition of the web service and the root path. The class is annotated with ```@ApplicationPath("api/v1")``` (the resources route "api/v1" can be changed). With Spring REST, one could use the ```@RestController``` and ```@RequestMapping("/api/v1")``` annotations on a simple POJO. All other REST endpoint paths or routes will be based on whatever is set in place of "api/v1".

## JAX-RS paths and request methods

With Spring REST, one would define a ```@RestController``` annotated class to define the root path "/api/v1" and/or "sub-paths" needed. This is also the case with Java EE, where a class, which represents a particular resource (files, records, data etc. on the server managed in part by Java classes) is annotated with ```@Path("somePath")```. There is only one parameter, value, expected. This annotation _exposes_ resources through RESTful resource points.

Once the ```@Path("somePath")``` annotation is applied to the resource class, one exposes at least one resource related method by defining the path needed to invoke the method. (Note that the prefixing/postfixing forward-slash characters used to break up the URL is inserted automatically in Java EE: "api/v1" is fine, "/api/v1/" is not expected.) An experienced Spring REST developer should be able to follow the snippet below.

```java
  @Path("somewhere")
  public class SomeResource {

    @Path("{parameter}")
    @GET
    public Response returnParameter(@PathParam("parameter") String entered){
      String returnString = "Parameter recieved: " + entered;

      return Response.ok(returnString).build();
    }

    @GET
    // this would be "api/v1/somewhere/overHere"
    @Path("overHere")
    public String getResponse() {
      return "over here";
    }
  }
```

The HTTP request methods are the usual standards:

- ```@GET```: GET methods are used to retrieve resources from the server without making changes to the resource on the server
- ```@POST```: POST methods are used to create new resources, using a payload or body. Repeated POST requests lead to the construction of more new resources
- ```@PUT```: PUT methods are used to update changes to a resource that already exists on the server. Repeated PUT requests will only change one resource and will not build new resources.
- ```@DELETE```: DELETE methods instruct the server to remove resources from the server. Repeated DELETE requests will not lead to further change to the resource or other resources.

GET, PUT and DELETE are _idempotent_ methods: they can be called multiple times without making subsequent changes to the resource or server. The state of the resource or the server following the first call will not change. 

Clearly, it is important to set different resource paths for the same HTTP method, even though the same method can be called using different paths. The container is only interested in the annotation and not the method signature. Only one method for each HTTP request method can use the class' path annotation. Generally it is recommended to explicitly define different sub-paths for all methods.

The REST controller class is intended to expose the resources and business layer of the application, not implement or define them. A service class will contain the fields and methods that are specific to the resources on hand. Injecting an instance of the service layer will enable the controller class to invoke the service methods.

## HTTP content types

The main payload formats (content type) between the client and the server used are:

- XML
- CSV
- EXCEL
- TEXT
- JSON

Historically, XML was the main format. However, these days most payloads are transferred as JSON and is predominantly a key-value pair based format. When making REST based requests, the client normally requests which content type it expects, otherwise the server will default to one, given below.

```java
  @Path("somewhere")
  public class SomeResource {

    @Inject
    SomeService someService;

    @GET
    @Path("overHere")
    @Produces("application/json")
    public List<SomeClass> getResponse() {

      return someService.getSomeClassResource();
    }
  }
```

The return type of the resource (GET) method needs to conform to the HTTP 1.1 standard, which is language agnostic. The conversion is handled automatically by the JAX-RS _message body writers_ (discussed later). To signify which content type to use, annotate the method with ```@Produces```, as shown above. Any fields which are not initialised or populated will be returned in the content type array (JSON or XML etc.) as empty fields.

One can also perhaps more conveniently annotate the class with ```@Produces("application/json")``` to instruct the container to return JSON for all GET methods. Furthermore, it is possible to override the content type at the method-level by using, for example, ```@Produces("application/xml")```.

When the client submits a payload to the server through a PUT or POST request is handled similarly, with the ```@Consumes("application/json")``` annotation. As with payload publication, all the conversion is handled on behalf of the developer. The method-level annotation also applies.

```java
  @Path("somewhere")
  @Consumes("application/json")
  public class SomeResource {

    @Inject
    SomeService someService;

    // this assumes that the client sends a json in the body
    // with the expected fields for SomeClass
    @POST
    @Path("overThere")
    public void getResponse(SomeClass payload) {

      someService.save(payload);
    }
  }
```

## Path Parameters (URI templates)

Path parameters (aka "URI Templates") via the URL can be passed directly to an exposed method. The annotation ```@PathParam()``` instructs the container to inject the URL String passed. The example below would be sent as "api/v1/somewhere/printMe". Here the literal "printMe" would be passed to ```returnParameter()```. Other types (Long, Integer etc.) can also be injected directly.

```java
  @Path("somewhere")
  public class SomeResource {

    @Path("{parameter}")
    @GET
    public Response returnParameter(@PathParam("parameter") String entered){
      String returnString = "Parameter recieved: " + entered;

      return Response.ok(returnString).build();
    }
  }
```

Validation of the parameter is clearly needed. One needs to restrict the parameter format using regular expressions. The client will receive a malformed URL exception if the expected parameter formatting is not sent.

```java
  @Path("somewhere")
  public class SomeResource {

    @Path("{ID: ^[0-9]+$}")
    @GET
    public Response returnObject(@PathParam("ID") Long id){
      return someService.getObjectById(id);
    }
  }
```

If a default parameter value is needed (and the client should not always receive an error page) then use the ```@DefaultValue()``` annotation.

```java
  @Path("somewhere")
  public class SomeResource {

    @Path("{ID: ^[0-9]+$}")
    @GET
    public Response returnObject(@PathParam("ID") @DefaultValue("0") Long id){

      // if the URL is wrong then the default value of 0 is sent (which is null 
      // since all JPA indices are one-based not zero-based)
      return someService.getObjectById(id);
    }
  }
```
 
Note that the URL need not always conform to the normal "path/subpath1/path/subPath2" styled URL. It is possible to pass neighbouring subpaths as "path/{ID}/edit/{username}{serialNumber}.{domain}/something/@{value}".

## Query parameters

Query parameters (e.g. "api/v1/somePath/someEntity?ID=25") proceed the "?" character. With JAX-RS, the query parameter is managed by the ```@QueryParam("ID")``` annotation. The next example shows this more clearly. A default value for the query parameter can also be set. Multiple query parameters can be set up and used.

```java
  @Path("somewhere")
  public class SomeResource {

    // sending "api/v1/somewhere/someObject/has?ID=1" would work
    @Path("someObject/has")
    @GET
    public Response returnObject(@QueryParam("ID") @DefaultValue("0") Long id){
      return someService.getObjectById(id);
    }
  }
```
