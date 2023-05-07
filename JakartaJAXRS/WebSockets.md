---
title: Web sockets
nav_order: 7
parent: Jakarta EE JAX-RS
---

# Web sockets

Web sockets enable a server to send bidirectional messages to/from the client. Contrast to SSE, which are unidirectional from the server to the client.

To make a POJO a web socket endpoint, one can either use annotations or a more programmatic approach. The former is discussed first.

The class annotation is ```@ServerEndpoint("somePath")``` and is defined in the WebSocket server API. The methods should also annotated.

```java
@ServerEndpoint("/chat")
public class ChatEndPoint {

    private static final ConcurrentLinkedQueue<Session> peers = new ConcurrentLinkedQueue<>();

    @Inject
    private Logger logger;

    // invoked when a client connects to the web socket server (when a new web socket session
    // is opened); Session stores info. re. the connected client
    @OnOpen
    public void open(Session session) {
        logger.log(Level.INFO, "New session opened");
        peers.add(session);
    }

    // invoked when a client closes the session with the server
    @OnClose
    public void close(Session session, CloseReason closeReason) {
        logger.log(Level.INFO, String.format(
                          "Session closed with reason %s",
                          closeReason.getReasonPhrase()));
        peers.remove(session);
    }

    // invoked each time a client sends a message to the web socket server
    @OnMessage
    public void relayMessage(String message, Session session) throws IOException {
        for (Session peer : peers) {
            if (!peer.equals(session)) {
                // send a message from the server to the client
                peer.getBasicRemote().sendText(message);
            }
        }
    }
}
```

The programmatic approach is given below. This approach involves the extension of the Endpoint class.

```java
public class MyProgrammaticEndPoint extends Endpoint {

  // EndPoint stores info re. the handshake process and is needed as the client initiates
  // the session
  @Override
  public void onOpen(Session session, EndpointConfig endpointConfig) {

      session.addMessageHandler((MessageHandler.Whole<String>) s -> {
          System.out.println("Server: " + s);
          try {
            // send a message from the server to the client
              session
                    .getBasicRemote()
                    .sendText("Server response to message received (programmatic)");
          } catch (IOException ex) {
              Logger
                .getLogger(MyProgrammaticEndPoint.class.getName())
                .log(Level.SEVERE, null, ex);
          }
      });
  }
}
```

Note that with the programmatic approach, there is not path info yet. This is handled by an implementation of the ServerApplicationConfig interface (along with two method overrides).

```java
public class ServerConfig implements ServerApplicationConfig {

  @Override
  public Set<ServerEndpointConfig> getEndpointConfigs(Set<Class<? extends Endpoint>> set) {
      return new HashSet<ServerEndpointConfig>() {
          {
              add(ServerEndpointConfig.Builder
                      .create(MyProgrammaticEndPoint.class, "/chat")
                      .build());
          }
      };
  }

  @Override
  public Set<Class<?>> getAnnotatedEndpointClasses(Set<Class<?>> set) {
      return new HashSet<>(set);
  }
}
```

# Path parameters (URI templates)

It is also possible to implement paths with parameters (aka "URI templates") and then pass parameters with ```@PathParam``` (note that the annotation comes from the Web Sockets API, not the JAX-RS API). In the example below, the User's name is part of the message.

```java
@ServerEndpoint(value = "/connect/{user}")
public class ChatEndPointParams {

    private static final ConcurrentLinkedQueue<Session> peers = new ConcurrentLinkedQueue<>();
    
    @Inject
    private Logger logger;

    @OnOpen
    public void open(Session session) {
        peers.add(session);
    }

    @OnClose
    public void close(Session session, CloseReason closeReason) {
        logger.log(Level.INFO, String.format("Session closed with reason %s",
                                             closeReason.getReasonPhrase()));
        peers.remove(session);
    }

    @OnMessage
    public void relayMessage(String message, Session session,
                             @PathParam("user") String name) throws IOException {
        for (Session peer : peers) {
            if (!peer.equals(session)) {
                logger.log(Level.INFO, "User name is " + name);
                peer.getBasicRemote().sendText(name + " <br/> " + message);
            }
        }
    }
}
```

# JSON encoders and decoders

The Web sockets can send different data types over the web socket protocol as a JSON string.

```java
// the encoder is given first ...

public class PojoEncoder implements Encoder.Text<Pojo> {

  @Override
  public String encode(Pojo pojo) throws EncodeException {

      // Using JSON-B (JSR 367) API for mapping to JSON from T
      return JsonbBuilder.create().toJson(pojo);
  }

  @Override
  public void init(EndpointConfig endpointConfig) {
  }

  @Override
  public void destroy() {
  }
}

// the decoder is next ...

public class PojoDecoder implements Decoder.Text<Pojo> {

  @Override
  public Pojo decode(String s) throws DecodeException {

      //Using JSON-B (JSR 367) API for mapping from JSON to T
      return JsonbBuilder.create().fromJson(s, Pojo.class);
  }

  @Override
  public boolean willDecode(String s) {
      return true;
  }

  @Override
  public void init(EndpointConfig endpointConfig) {
  }

  @Override
  public void destroy() {
  }
}
```

The web socket server endpoint is managed by a separate class (using the annotation approach).

```java
// register the encoder and decoder with JAX-RS
@ServerEndpoint(value = "/pojo", encoders = PojoEncoder.class,
        decoders = PojoDecoder.class)
public class PojoEndPoint {

    @Inject
    private Logger logger;

    @OnOpen
    public void opened(final Session session) throws IOException, EncodeException {
        Pojo pojo = new Pojo("Java EE", "bla@bla.com", "Great day! How is life?");

        // send the JSON formatted Pojo to the client as part of the message
        session.getBasicRemote().sendObject(pojo);
    }

    // invoked when the client sends a message to the server
    @OnMessage
    public void processMessage(final Session session, Pojo pojo) 
                                              throws IOException, EncodeException {
        logger.log(Level.INFO, "My pojo received on the server *************");
        logger.log(Level.INFO, pojo.toString());

        // send the JSON formatted Pojo to the client as part of the reply message
        session.getBasicRemote().sendObject(pojo);
    }
}
```

The JAX-RS runtime is informed of the required encoders and decoders to use, with the annotation ```@ServerEndpoint()``` given to the endpoint class.
