---
title: Resources, JSON-B, JSON-P, Clients and SSE
nav_order: 6
parent: Jakarta EE JAX-RS
---

# Executing resource methods asynchronously

Running methods asynchronously in the web service. Suppose the same method can be applied to multiple clients, for example, multiple clients want to monitor their users' account and find out how it is credited and debited over a few years. Such a process, running alongside all other processes is costly. To give the resource method time to process one can suspend the response and then either wait for the method to complete (and respond accordingly) or respond with a timeout. The costly method will be made to run on its own thread.

To proceed, one can extend Java SE's ExecutorService with ManagedExecutorService (MES). The central piece is AsyncResponse's ```resume()``` method. One uses the MES to start a new thread (spawnedThread) and execute ```expensiveMethod()```. When ```expensiveMethod()``` returns, AsyncResponse's ```resume()``` method then communicates with the client. If ```expensiveMethod()``` takes longer than the timeout threshold, then the client will receive a timeout notice.

```java
  @Path("expenses")
  public class AccountingResource {

    // herein referred to as MES
    @Resource
    ManagedExecutorService managedExecutorService;

    @Inject
    AccountingService accountingService;

    @POST
    @Path("run")
    public void run(@Suspended AsyncResponse asyncResponse) {

        // get the HTTP request thread
        final String currentThread = Thread.currentThread().getName();
        asyncResponse.setTimeout(5000, TimeUnit.MILLISECONDS);
        
        // 1. Optional: Implement a timeout handler. This communicates with the client
        // if resume() was not run after 5 sec 
        asyncResponse.setTimeoutHandler(asyncResponse1 -> {
            asyncResponse1
              .resume(Response.status(Response.Status.REQUEST_TIMEOUT)
              .entity("The request timed out")
              .build());
        });

        // 2. Optional: register other callbacks (see overrides below)
        asyncResponse.register(CompletionCallbackHandler.class);

        // 3. Required: pass long running task to MES on a separate thread and on completion
        // communicate with client through resume()
        managedExecutorService.submit(() -> {
            final String spawnedThreadName = Thread.currentThread().getName();

            //Long running task
            payrollService.expensiveMethod();

            asyncResponse.resume(Response.ok()
                .header("HTTP request Thread", currentThread)
                .header("Spawned Thread", spawnedThreadName)
                .status(Response.Status.OK).build());
        });
    }

    // this is invoked when a request is processed and can be passed to AsyncResponse
    static class CompletionCallbackHandler implements CompletionCallback {

        @Override
        public void onComplete(Throwable throwable) {
        }
    }

    // Optional for implementations (provider dependent)
    static class ConnectionCallbackHandler implements ConnectionCallback {

        @Override
        public void onDisconnect(AsyncResponse disconnected) {
        }
    }

    // this is an alternative way of running on a separate thread with 
    // CompletableFuture CF interface
    @POST
    @Path("run-cf")
    public void computePayrollCF(@Suspended AsyncResponse asyncResponse,
       @QueryParam("i") @DefaultValue("3") long number) {

        CompletableFuture.runAsync(() -> 
          payrollService.expensiveMethod(), 
          managedExecutorService).thenApply(
            (result) -> asyncResponse.resume(Response.ok(result).build()
          )
        );
    }
  }
```

The request was made on one thread (currentThread). One then usually sets the timeout in case the AsyncResponse's ```resume()``` method (i.e. ```expensiveMethod()``` did not return on time) is not called. The alternative method, shown above, uses a CompletableFuture interface that is part of Java SE's Concurrent package.

# Java API for JSON Binding JSON-B

Without further change to the current JSON responses applied thus far, all are managed by the JSON-B (JSON Binding) API. This works both ways, with consumption and production of JSON strings.

In a few (rare) cases, it may be expected that the _marshalling_ (Java objects to JSON or XML) and _unmarshalling_ (JSON or XML to Java objects) processes need to be customised. Generally, the former is part of _serialisation_, where Java objects are converted into byte streams required for network transfer. The latter stage is part of _deserialisation_ where the byte stream from the network is converted back to a Java object. Consequently, entities are almost always based on beans that implement the Serializable interface. The customisation generally amounts to using more annotations, a few of which are listed below.

+ ```@JsonbDateFormat(value = "yyyy-MM-dd")```: use this to annotate LocalDate type fields of the entity
+ ```@JsonbTransient```: use this to annotate Collections (fields) that should not be marshalled to JSON (the entity type in the collection would be handled separately)
+ ```@JsonbPropertyOrder(PropertyOrderStrategy.LEXICOGRAPHICAL)```: use this to annotate the class (bean) and determine the order in which the JSON fields should appear (lexicographical or alphabetical, or in reverse with REVERSE)

There are many other customisations available and are documented in the JSON-B [repository](https://javaee.github.io/jsonb-spec/).

# Java API for JSON Processing JSON-P

Set some context first. Hypermedia is an extension of HyperText and allows for the presentation of audio, video and hyperlinks in addition to hypertext, in the HTTP response body. A standard, known as _Hypermedia as the Engine of Application State_ (HATEOAS) is a REST architecture where the client interacts with a web service dynamically, that is, a response from the web service actually provides info or directions about what other resources are _currently_ available. Previously, a client would have to make individual HTTP requests for resources with (statically) predefined HTTP URLs. Furthermore, the client would have to be made compatible with the server at build-time in order to access resources. Dynamic interaction is one in which a client makes a single request without knowing anything-else about the server. The web service would then reply with a response, which itself contain more information about what else is available. Clearly, this response needs to be handled with care and not risk exposing resources to all clients all the time.

A server returns URLs in the body of the response as a JSON feed (instead of the header) and the client would then be able to parse and call said URLs. Which actions or URLs are available are dependent on the state of the resource ("Engine of Application State"), which is managed by the web service. If the web service deems that the request URLs are not available, then it is possible to direct the service to not include them in the body of the response. Overall, the interaction of the client and server is dynamic and not set at build-time.

The Java API for JSON Processing [JSON-P](https://javaee.github.io/jsonp/) is a more low-level API (compared to JSON-B) can provide some of the hypermedia functionality, in the following example, with links to persistent entities.

The JSON-P responses take the form of key-value pairs, in which the key value is always a Java String. The following resource method builds a new User object and then returns a JSON-P hypermedia response, complete with hyperlinks.

```java
  @Produces("application/json")
  @POST //api/v1/users POST Request
  @Path("users")
    public Response createUser(@Valid User user) {
      persistenceService.saveUser(user);

      URI uri = uriInfo
                  .getAbsolutePathBuilder()
                  .path(user.getId().toString())
                  .build();

      // resource path to all other users
      URI otherUsers = uriInfo
                  .getBaseUriBuilder()
                  .path(UserResource.class)
                  .path(UserResource.class, "getUsers")
                  .build();

      URI dept = uriInfo
                  .getBaseUriBuilder()
                  .path(DepartmentResource.class)
                  .path(DepartmentResource.class, "getDepartmentById")
                  .resolveTemplate("id", user.getDepartment().getId())
                  .build();

      // this is the "JSON-P" builder
      JsonObjectBuilder links = Json.createObjectBuilder()
                                  .add("_links", Json.createArrayBuilder()
                                  .add(Json.createObjectBuilder()
                                  .add("_otherUsers", otherUsers.toString())
                                  .add("_self", uri.toString())
                                  .add("_selfDept", dept.toString())
                                  .build()));

      // SSE - server sent event (JAX-RS clients and SSE discussed below)
      jaxRsClient.postUserToSSE(user);

      return Response
                .ok(links.build().toString())
                .status(Response.Status.CREATED)
                .build();
    }
```

The response returned by the service will contain URLs for all other Users, the path to the newly built User and their department. The client can then process the JSON feed and make further requests based on the return.

# The JAX-RS Client API

The client-side API of JAX-RS provides web services the ability to build instances of clients within a web service. The client lifetime is usually brief and can be used to (temporarily) access other web services via REST calls. The following example attempts to find out which sites, where an email address was applied, have been breached. This is achieved by sending a request from the JAX-RS Client instance to [haveibeenpwned.com](https://haveibeenpwned.com/") (at the time of writing, the specific endpoint request is documented [here](https://haveibeenpwned.com/API/v3#BreachesForAccount)).

```java
@RequestScoped
public class JaxRsClient {

    // the JAX-RS Client
    private Client client;

    WebTarget webTarget;

    // check for breaches to an API (pass email as the parameter)
    // https://haveibeenpwned.com/api/v3/breachedaccount/{account}
    private final String haveIBeenPawned = "https://haveibeenpwned.com/api/v3/breachedaccount";

    @PostConstruct
    private void init() {
      // build the short-lived client in the web service
        client = ClientBuilder
                    .newBuilder()
                    .connectTimeout(7, TimeUnit.SECONDS)
                    .readTimeout(3, TimeUnit.SECONDS)
                    .build();

        // set the client's target (pass the root path)
        webTarget = client.target(haveIBeenPawned);
    }

    @PreDestroy
    private void destroy() {
        if (client != null) {
            //Be sure to close to prevent resource leakage
            client.close();
        }
    }

    // synchronous JAX-RS method
    public int checkBreaches(String email) {

        // build a JSON from the breach response
        JsonArray jsonValues = webTarget
                                .path("{account}")
                                // send the email address
                                .resolveTemplate("account", email)
                                // prepare for a plain text response
                                .request(MediaType.TEXT_PLAIN)
                                // get() is HTTP GET; convert response to JSONArray
                                .get(JsonArray.class);              

        parseJsonArray(jsonValues);
        return jsonValues.size();
    }

    public JsonArray getBreaches(String email) {
        return webTarget
                .path("{account}")
                .resolveTemplate("account", email)
                .request(MediaType.TEXT_PLAIN)
                .get(JsonArray.class);                
    }

    // asynchronous (reactive) JAX-RS method
    public void checkBreachesRx(String email) {
        CompletionStage<Response> responseCompletionStage =
                                     webTarget.path("{account}")
                                              .resolveTemplate("account", email)
                                              .request()
                                              .rx()     // reactive stream
                                              .get();

        responseCompletionStage
                .thenApply(response -> response.readEntity(JsonArray.class))
                .thenAccept(this::parseJsonArray);
    }

    // used to print JSON array to the console
    private void parseJsonArray(JsonArray jsonArray) {
        for (JsonValue jsonValue : jsonArray) {
            JsonObject jsonObject = jsonValue.asJsonObject();

            // return the string value stored for the given string keys
            // (see haveIbeenPwned docs for more info)
            String domain = jsonObject.getString("Domain");
            String breachDate = jsonObject.getString("BreachDate");

            System.out.println("Breach name is " + domain);
            System.out.println("Breach date is " + breachDate + "\\n");
        }
        System.out.println("Breach size is " + jsonArray.size());
    }

    public void postUserToSSE(User user) {
        String json = JsonbBuilder.create().toJson(user);

        int status = client
                        .target("http://localhost:8080/someClass/api/v1/sse-path")
                        .request(MediaType.TEXT_PLAIN)
                        .post(Entity.text(json))
                        .getStatus();

        System.out.println("Status received " + status);
        System.out.println(json);
    }
}
```

The above snippet shows how the JSON arrays are built in a non-reactive and reactive way. A client (external to the web service) can invoke the request, through the web service (that is, client -> web service(JAX-RS client -> haveibeenpwned) return to --> client), using the following resource class.

```java
@Path("programmatic")
@Produces(MediaType.APPLICATION_JSON)
public class JaxRsClientResource {

    @Inject
    JaxRsClient jaxRsClient;

    @Path("breach/{email}")
    @GET
    public Response checkBreaches(@PathParam("email") @NotEmpty String email) {

        JsonArray breachesFound = jaxRsClient.getBreaches(email);
        List<JsonObject> jsonObjects = new ArrayList<>();

        if (breachesFound.size() > 0) {
            for (JsonValue jsonValue : breachesFound) {
                JsonObject jsonObject = jsonValue.asJsonObject();

                jsonObjects.add(Json.createObjectBuilder()
                                    .add("breach_domain", jsonObject.getString("Domain"))
                                    .add("breach_date", jsonObject.getString("BreachDate"))
                                    .build()
                );
            }
            return Response.ok(jsonObjects).build();
        }

        return Response.ok("No breaches found for email " + email).build();
    }
}
```

The (external) client will eventually receive a JSON array of all the web sites that have been breached (and when) that have stored the given email address at some point in time.

# Server Sent Event SSE

SSE is essentially a one-way (unidirectional) communication from the web service to a client. The server can push UTF-8 encoded text to the client. New messages are separated by the new line character "\n". A more advanced technology which is bidirectional are Web Sockets (discussed in the next section). Messaging allows servers to relay information to the client and also trigger events on the client (provided the text sent matches the prerequisite format).

The above example with the method ```postUserToSSE()``` will now explained. When a client has posted a new User entity, the method marshals the new User and returns a response to the client with the expected JSON-P hypermedia. Before the response is sent, the method ```postUserToSSE()``` sends the new User to the JAX-RS client (recall, the JAX-RS client resides within the web service and is primarily used to make requests from the service). The User is sent to the JAX-RS client, a portion is repeated below.

```java
public void postUserToSSE(User user) {
  String json = JsonbBuilder.create().toJson(user);

  int status = client
                  .target("http://localhost:8080/someClass/api/v1/sse-path")
                  .request(MediaType.TEXT_PLAIN)
                  .post(Entity.text(json))
                  .getStatus();

  System.out.println("Status received " + status);
  System.out.println(json);
}
```

This triggers the construction of another JSON-B string, via marshalling. The JAX-RS client is then directed to a URL target and is requesting a plain text response upon making a POST request, using the User's JSON-B feed. The request is actually made to the same web service that defines the JAX-RS client. The route is handled by the web services resource class, ServerSentEventResource, given below. The POST request invokes the ```broadCastUser()``` method, which then sends a one-way test stream (with the User's details) via SSE's ```broadcast()``` method (defined in the Java EE 8 API, not here) back to any connected client.

```java
@ApplicationScoped
@Path("sse-path")
public class ServerSentEventResource {

    @Context
    private Sse sse;

    @Inject
    private Logger logger;

    private SseBroadcaster sseBroadcaster;
    private SseEventSink eventSink;

    @PostConstruct
    private void init() {
        sseBroadcaster = sse.newBroadcaster();
    }

    @GET
    @Produces(MediaType.SERVER_SENT_EVENTS)
    public void fetch(@Context SseEventSink sseEventSink) {
        sseBroadcaster.register(sseEventSink);
        this.eventSink = sseEventSink;

        logger.log(Level.INFO,"SSE opened!" );
    }

    @POST
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public Response broadcastMessage(@FormParam("message") String message) {
        OutboundSseEvent broadcastEvent = sse.newEvent(message);

        // note that broadcast() is defined by SseBroadcaster, not this class
        sseBroadcaster.broadcast(broadcastEvent);
        return Response.noContent().build();
    }

    // invoked, ultimately, by postUserToSSE()
    @POST
    @Consumes(MediaType.TEXT_PLAIN)
    public Response broadcastUser(String user) {
        OutboundSseEvent broadcastEvent = sse
                                          .newEventBuilder()
                                          .name("user")
                                          .data(user)
                                          .mediaType(MediaType.TEXT_PLAIN_TYPE)
                                          .build();

        // note that broadcast() is defined by SseBroadcaster, not this class
        sseBroadcaster.broadcast(broadcastEvent);
        return Response.ok().status(Response.Status.OK).build();
    }

    @PreDestroy
    private void destroy() {
        if (eventSink != null) {
            eventSink.close();
        }
    }
}
```

The ServerSentEventResource ```broadcastUser()``` then invokes the SseBroadcaster ```broadcast()``` method, sending a text message to all connected clients, before returning a HTTP status code to the JAX-RS client, which is then printed to the console. The JAX-RS client then prints the JSON-B string to the console as a final step.

Any client that sends a POST request with a URL encoded form invokes the ServerSentEventResource's ```ServerSentEventResource()``` method. This also triggers the SseBroadcaster ```broadcast()``` method, and so the connected client receives a text message.
