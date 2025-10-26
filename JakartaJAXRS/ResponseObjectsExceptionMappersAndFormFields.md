---
title: Response objects, Exception mappers and Form fields
nav_order: 2
parent: Jakarta EE JAX-RS
---

# Response objects

Successful web service transactions normally return feedback (essentially metadata) to the client (a message, a HTTP status code, URI to the newly created resource etc.). This is where a "response object" comes into use.

Previously, the return values of the resource methods were Java objects. Instead of this, one can return a Response, while facilitating the return of the metadata. The HTTP response body will contain the JSON array. The POST method returns the URI of the new resource in the HTTP header. The ```@Context``` annotation is used to inject classes/objects residing in the context.

```java
  @Path("somewhere")
  @Produces("application/json")
  @Consumes("application/json")
  public class SomeResource {

    @Inject
    SomeService someService;

    // inject the interface UriInfo (see POST)
    @Context
    private UriInfo uriInfo;

    @GET
    @Path("overHere")
    public Response getObjects() {

      return Response.ok(someService.findAll())
          .status(Response.Status.OK)   // there are many other HTTP statuses
          .build;
    }

    @GET
    @Path("employee/{id}")
    public Response getObjectById(@PathParam("id") Long id){

      return Response.ok(someService.findById(id))
          .status(Response.Status.OK)
          .build;
    }

    @POST
    @Path("newObject")
    public Response newObject(SomeObject someObject){

      someService.save(someObject);
      URI uri = uriInfo.getAbsolutePathBuilder().path(
        object.getId().toString()
          ).build();

      // the built URI can be sent back to the web service (in 
      // agreement with the above getObjectById())
      return Response.created(uri)
          .status(Response.Status.CREATED)
          .build();
    }
  }
```

# Exception Mappers

When the client pushes a payload to the web service, its data should be validated. The JPA validates data with the Bean Validation API. JAX-RS also uses the same API to validate payloads and ensures that the data adheres to the constraints set in the model. The web service also sends a response to the client to inform the client of the status of the request.

Any violation of the constraints are handled by the JAX-RS "exception mappers". The API maps exceptions to HTTP responses e.g. any bean violations on the server are mapped to a specific HTTP response. The implementation of exception mappers is normally defined in its own class, annotated with the ```@Provider``` to inform JAX-RS that this class should be made available to the container.

```java
  // inform JAX-RS that this is should be available at runtime
  @Provider
  public class ExceptionMapperConstraintViolation 
      implements ExceptionMapper<ConstraintViolationException> {

    // add all violations to a Map and return
    @Override
    public Response toResponse(ConstraintViolationException exc) {

      final Map<String, String> constraintViolations = new HashMap<>();

      for (ConstraintViolation violation : exc.geConstraintViolations()){
        String path = violation.getPropertyPath().toString();
        constraintViolations.put(path, violation.getMessage());
      }

      return Response.status(Response.Status.PRECONDITION_FAILED)
          .entity(constraintViolations)
          .build;
    }
  }
```

Exception mappers are not only applicable to bean validation but also applicable to any Java exception.

As set out, the web service will return a JSON array as a response body, listing the bean field constraints that were violated and a message explaining what the problem was (as defined in the [bean validation](../JakartaEETheJPA/OtherJPAFeatures.md)).

Currently, the payload is validated during the JPA transaction, that is, when ```someService.save()``` is run. The validation is taking place at the persistence (service) level. To validate before the persistence layer (quite often a preferred approach, freeing up the entity manager) at the resource layer, apply the ```@Valid``` annotation to the injected instance.

```java
  @Path("somewhere")
  @Produces("application/json")
  @Consumes("application/json")
  public class SomeResource {

    @Inject
    SomeService someService;

    // inject the interface UriInfo (see POST)
    @Context
    private UriInfo uriInfo;

    // ... other resource methods ...

    @POST
    @Path("newObject")
    public Response newObject(@Valid SomeObject someObject){

      // this method block is only run when validation is satisfactory

      someService.save(someObject);
      
      URI uri = uriInfo.getAbsolutePathBuilder().path(
        object.getId().toString()
          ).build();

      return Response.created(uri)
          .status(Response.Status.CREATED)
          .build();
    }
  }
```

Validating at the resource level does, however, return a different JSON response body. The messages are the same however the field names are more formal.

# Form fields

Clients can post data to web service via forms. The form handling class is, as with the bean validation exception mapping, defined in its own class. The relevant entity classes set their constraints as desired. As with Spring MVC and Thymeleaf templates, the client posts a form with the POST method. Note that the payload will not be sent as a JSON array and so it is necessary to add an extra annotation ```@Consumes()``` which overrides the class level ```@Consumes()``` annotation. Each field of the form that is injected by JAX-RS when annotated with ```@FormParam()```, more elegantly with a MultiValuedMap or (most recommended approach) with a ```@BeanParam()```. Spring developers will see that ```@BeanParam()``` resembles the Spring MVC Model interface.

```java
  @Path("users")
  @Consumes("application/json")
  @Produces("application/json")
  public class FormData {

    // the name parameter of the <input name = ""></input> element forms the 
    // paramter name (clearly, all form field names must be unique) 
    @POST
    @Path("form")
    @Consumes(MediaType.APPLICATION_FROM_URLENCODED)
    public Response createNewUser(@FormParam("username") String username,
        @FormParam("email") String email,
        @FormParam("password") String password) {

        // initialise a new User and commit to the database

    }

    // this one is more suited to forms with a large number of fields
    @POST
    @Path("formManyFields")
    @Consumes(MediaType.APPLICATION_FROM_URLENCODED)
    public Response createNewUser(MultiValuedMap<String, String> formMap) {

      // formMap has all field entries (the key of the Map is the field name)
      String username = formMap.getFirst("username");
      String password = formMap.getFirst("password");
      String email = formMap.getFirst("email");

      // initialise a new User and commit to the database

    }

    // demonstrates the use of @BeanParam
    @POST
    @Path("formBean")
    @Consumes(MediaType.APPLICATION_FROM_URLENCODED)
    public Response createNewUser(@BeanParam User user) {

      // JAX-RS will use the User class @FormParam annotated fields
      // from the HTTP body sent by the client

      // note that the injected User is already initialised with the
      // form data sent
    }
  }

  // given to demonstrate the use of @BeanParam only

  @Entity
  public class User extends AbstractEntity {

    // constraints omitted for clarity

    @FormParam("username")
    private String username;

    @FormParam("email")
    private String email;

    @FormParam("password")
    private String password;

    // ... public getters and setters ...
  }
```

Note that any entity field not annotated with ```@FormParam()``` will not be initialised through the ```@BeanParam()``` approach. Using the entity class directly eliminates the need to build a separate DTO (which is another approach that can be used to handle client form data).

# Other injection parameters

The HTTP header contains much metadata and can be accessed by methods annotated with ```@HeaderParam()```. For example the referrer (the entity or user that makes the request) URL stores the address of the page making the request. Lastly, one can extract HTTP header cookie values with ```@CookieParam()```.

```java
  public Response createSomething(@HeaderParam("Referer") String referer) {

    // so something with the referer URL, referer, taken from the referer key
    // of the HTTP header

    // return the Response
  }
  
  public Response createSomething(@Context HttpHeaders httpHeaders){

    // httpHeaders contains all HTTP header metadata
    // (this method is equivalent to the above)
    httpHeaders.getHeaderString("Referer").get(0);
  }
  
  public Response getCookieParam(@CookieParam("user") String user) {

    // do something with user's cookie header parameter,
    // then return Response
  }
```
