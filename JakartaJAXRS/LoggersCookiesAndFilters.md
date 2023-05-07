---
title: Loggers, cookies and filters
nav_order: 4
parent: Jakarta EE JAX-RS
---

# Loggers

Logger producers were introduced in the [CDI section](../JakartaEETheBasics/ProducersAndInterceptors.md). Loggers are part of the java.utils package and can be injected into the resource class and allow the web service to send messages to a console or write logs to a file. To run loggers, simply inject an instance of Logger with ```@Inject``` into the (resource) class.

```java
  public class LoggerProducer {

    // note that Logger is now a bean
    @Produces
    public Logger produceLogger(InjectionPoint injectionPoint) {
        return Logger.getLogger(injectionPoint.getMember().getDeclaringClass().getName());
    }
  }
  
  // some other class
  public class SomeClass implements Serializable {

    @Inject
    Logger logger;

    public void logDemo(){
      logger.log(Level.INFO, "This is an info message");
      logger.log(Level.WARNING, "This is a warning message");
    }
  }
```

Other third-party logging libraries in use are Simple Logging Facade for Java [SLF4J](http://www.slf4j.org/) and [Logback](https://logback.qos.ch/), amongst others.

# Cookies

Cookies saved on the client can be used to store metadata pertaining to the recent and future requests and responses. For example, once a user has downloaded a file, the server can require the client to save a cookie with information related to the download transaction. The cookie information is sent as part of the response to the client. The client side will then build the cookie file and refer to it in future. Cookies are saved as name-value pairs.

```java
  @Entity
  public class User {
    
    @Id
    private Long id;

    // ... other fields ...

    @Lob
    @Basic(fetch = FetchType.LAZY)
    private byte[] image;

    // ... public getters and setters, and methods ...
  }

  @Path("users")
  @Consumes("application/json")
  public class SomeClass {

    @Inject
    SomeService someService;

    // use something like "api/v1/users/download/mugShot.png?id=22"
    @GET
    @Path("download/{file}")
    @Produces({MediaType.APPLICATION_OCTET_STREAM, "image/png", "image/jpeg", "image/jpg"})
    public Response downloadImageFile(@QueryParam("id") @NotNull Long id,
         @PathParam("file") String fileName){

      User user = someService.findById(id);

      // build a new HTTP cookie which stores the database ID of the file
      NewCookie cookie = new NewCookie("userID", String.valueOf(id));

      if (user != null){
        return Response.ok()
            .entity(Files.write(Paths.get(fileName), user.getImage()).toFile())
            .cookie(cookie)
            .build();
      }

      return Response.noContent().build();
    }
  }
```

Cookies has a maxAge property which defines the lifetime of a cookie. Expired cookies are discarded.

# Filters

Filters are used to filter requests and responses. They intercept requests and responses just before they payload reaches its target and are quite powerful tools, particularly in the security domain. They can alter the data itself.

Regarding __request filters__, there are two types: "Pre-matching" (intercept before a URL is matched to the resource method) and "Post-matching" (intercept after a URL is matched with the resource method). In the latter case, the filter provides an opportunity for the web service to invoke methods or alter data before the body of the resource method is executed.

__Response filters__ simply intercept payloads as they migrate from the web service to the client.

## Static and dynamic container response filters

The JAX-RS API defines the container request and response filter interfaces. To implement a response filter, for example, simply implement the ContainerResponseFilter interface. Then register the class with the container using ```@Provider```.

Suppose that the web service requires the client to cache a response (from the server) for a given amount of time. This can be managed with its own class.

```java
  // register the filter with JAX-RS
  @Provider
  public class CacheResponseFilter implements ContainerResponseFilter {

    // The requestContext will contain all info related to the request made
    // (similar remarks for the responseContext) and is injected by the runtime
    @Override
    public void filter(ContainerRequestContext requestContext,
       ContainerResponseContext responseContext) throws IOException {

        // GET, POST, PUT or DELETE?
        String methodType = requestContext.getMethod();

        // e.g. "users" (not the full path "/api/v1/users")?
        String uriPath = requestContext.getUriInfo().getPath();

        // only change the response for a given URL and request method
        if (methodType.equalsIgnoreCase("GET") && uriPath.equalsIgnoreCase("users")){

          // cache response
          CacheControl cacheControl = new CacheControl();
          // cache for 200 secs
          cacheControl.setMaxAge(200);
          // only the client should cache (intermediaries should not cache)
          cacheControl.setPrivate(true);

          // edit the response (each entry is given first by a name and a value)
          // the cacheControl will be embedded as an object
          responseContext.getHeaders().add("Cache-Control", cacheControl);
          // this is simply a String based name and value (like a cookie)
          responseContext.getHeaders().add("Custom header message", "Surprise!");
        }
    }
  }
```

The above example is a _static_ filter since it is always registered at runtime. In some cases, it may be preferable to register filters when they are needed, that is, dynamically as a _dynamic_ filter. One can build a dynamic filter with a custom annotation that triggers the registration.

```java
  @Retention(RetentionPolicy.RUNTIME)
  @Target(ElementType.METHOD)
  public @interface MaxAge {
    int age();
  }
```

```java
  public class DynamicFilter implements ContainerResponseFilter {

    int age;

    public DynamicFilter(int age){
      this.age = age;
    }

    public DynamicFilter() {
    }
    
    @Override
    public void filter(ContainerRequestContext requestContext,
       ContainerResponseContext responseContext) throws IOException {

        if (requestContext.getMethod().equalsIgnoreCase("GET")){
          CacheControl cacheControl = new CacheControl();
          cacheControl.setMaxAge(age);
          responseContext.getHeaders().add("Cache-Control", cacheControl);

          // add other header fields as needed
        }
    }
  }
```

One then implements the JAX-RS DynamicFeature interface. The DynamicFeature interface defines the dynamic registration of (post-matching) filters at deployment and is itself registered with the JAX-RS runtime. Any custom response filters are registered individually on a needs basis through another custom implementation of DynamicFeature: DynamicFilterFeature. (Assume that DynamicFilterFeature is in the same package as the interface MaxAge.)

```java
  @Provider
  public class DynamicFilterFeature implements DynamicFeature {

    // the resourceInfo stores info related to the resource class and methods
    @Override
    public void configure(ResourceInfo resourceInfo, FeatureContext context){
      
      // from the calling resource method, retrieve its method's MaxAge annotation;
      // if the resource method was not annotated then return null
      MaxAge maxAgeAnnot = resourceInfo.getResourceMethod().getAnnotation(MaxAge.class);

      if (maxAgeAnnot != null){
        DynamicFilter dynamicFilter = new DynamicFilter(maxAgeAnnot.age());
        context.register(dynamicFilter);
      }
    }
  }
```

If a resource method (not class; typically a HTTP GET method) is annotated with ```@MaxAge(age = 200)``` for example, then the dynamic container response filter, DynamicFilter, will be registered and the annotation age parameter can be passed to the maxAge field of the cacheControl.

## Pre-matching container request filters

The following example modifies a HTTP request method, effectively overriding what is defined on the server. Assume that the client is not allowed to send an HTTP DELETE method. In this case, one implements the JAX-RS ContainerRequestFilter interface. One then registers the filter statically and annotates with class with ```@PreMatching``` to intercept the payload before the resource method is matched to the URL.

```java
  @Provider
  @PreMatching
  public class PreMatchRequestFilter implements ContainerRequestFilter {

    @Inject
    Logger logger;

    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {

      logger.log(Level.INFO, "Original HTTP method: " + requestContext.getMethod());
      String httpMethod = requestContext.getHeaderString("X-Http-Method-Override");

      if (httpMethod != null && !httpMethod.isEmpty()){
        logger.log(Level.INFO, "Http method received: " + httpMethod);
        requestContext.setMethod(httpMethod);
      }
    }
  }
  
  // in the resource class
  @Path("users")
  @Produces("application/json")
  @Consumes("application/json")
  public class UserResource {
  
      @Inject
      Logger logger;
  
      @Inject
      SomeService someService;
  
      // ... other resource methods ...  

      // here, contacts in User
      @PUT
      @Path("{id: \\d+}")
      @Consumes(MediaType.APPLICATION_FROM_URLENCODED)
      public Response updateUserContacts(@PathParam("id") @NotNull Long id,
        @FormParam("contacts") String contacts) {

          someService.updateContacts(someService.findById(id), contacts);
          return Response.ok().build();
      }
  
      @DELETE
      @Path("{id: \\d+}")
      public Response removeUserContacts(@PathParam("id") @NotNull Long id) {
          
        someService.removeContacts(someService.findById(id));
        return Response.ok().build();
      }
  }
```

The client could then send any HTTP method since with all requests trigger the pre-matching request filter. The web service will then log the original request and then look for a field with name="X-Http-Method-Override". If the value is set with a valid HTTP method type (GET, POST, etc.) then the method with the matching method type and path are invoked. The choices are value="PUT" and value="DELETE", as shown in the above snippet.

## Post-matching container request filters

Authentication of a client can be implemented through a post-matching request filter. Once the URL has been mapped, the web service can verify the identity of the client. Authentication in Jakarta EE is best handled with [JSON Web Tokens JWT](https://jwt.io/) standard and is presented in the next section.
