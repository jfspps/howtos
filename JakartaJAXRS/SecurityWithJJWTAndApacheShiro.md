---
title: Security with JJWT and Apache Shiro
nav_order: 5
parent: Jakarta EE JAX-RS
---

# Security in JAX-RS

Java security is more commonly handled by the exchange of matching "JSON web tokens" between the client and web service. The standard is referred to as JSON Web Tokens, or JWT. There are many implementations of JWT for a range of languages (other than Java) and platforms. The example shown here will use the [Java JSON Web Token](https://github.com/jwtk/jjwt) or JJWT API. The JJWT will be implemented through post-matching filters in JAX-RS.

This section will also introduce the [Apache Shiro](https://shiro.apache.org/) API with JAX-RS.

Before continuing, it is advisable to refer to the [JWT Introduction](https://jwt.io/introduction) and understand the basic components of a JWT: the header, the payload and the signature. 

The Maven dependencies for JJWT are [here](https://mvnrepository.com/artifact/io.jsonwebtoken/jjwt/) and for Apache Shiro are [here](https://mvnrepository.com/artifact/org.apache.shiro/shiro-core). (For more on dependency scope, see the official [docs](https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html#Dependency_Scope).) Apache Shiro will require Simple Logging Facade for Java [SLF4J](http://www.slf4j.org/).

```xml
<!-- for reference only; set scope to provided to make container 
to provide the dependency at runtime -->
<dependency>
  <groupId>javax</groupId>
  <artifactId>javaee-api</artifactId>
  <version>8.0.1</version>
  <scope>provided</scope>
</dependency>

<dependency>
  <groupId>io.jsonwebtoken</groupId>
  <artifactId>jjwt</artifactId>
  <version>0.9.1</version>
</dependency>

<dependency>
    <groupId>org.apache.shiro</groupId>
    <artifactId>shiro-core</artifactId>
    <version>1.7.1</version>
</dependency>

<!-- required for Apache Shiro -->
<dependency>
  <groupId>org.slf4j</groupId>
  <artifactId>slf4j-api</artifactId>
  <version>1.7.30</version>
</dependency>
```

Overall, one annotates the relevant resource methods with ```@Secure``` to indicate which methods require a HTTP authorisation header (this is a custom annotation, explained later in this section). To gain access, the client would normally login (via a HTTP body Content type: URL-Encoded Form) and receive a token from the service. The JWT is a "bearer string", essentially, an encoded string. The client would then send the token for subsequent requests through a "Bearer Token" (normally bearer token is set to "Without Authentication"; there are several other standards available including [OAuth](https://oauth.net/)) as part of the HTTP header (not the body). The user would usually not need to log in again, assuming the web token has not expired. 

# The model and JPA persistence and query services

For demonstration purposes, the User bean will have a email, password and "salt" (related to encryption) String fields.

```java
@Entity
@NamedQuery(name = User.FIND_USER_BY_CREDENTIALS, 
  query = "select u from User u where u.email = :email")
public class User extends AbstractEntity {
  
  @Id
  private Long id;

  public static final String FIND_USER_BY_CREDENTIALS = "User.findUserByCredentials";

  @NotEmpty(message = "Email is required")
  @Email(message = "Format must be user@domain.com")
  @FormParam("email")
  private String email;

  @NotEmpty(message = "Password required")
  @Size(min = 10)
  @FormParam("password")
  private String password;

  private String salt;

  @Lob
  @Basic(fetch = FetchType.LAZY)
  private byte[] image;

  // ... constructors, public getters and setters ...
}
```

The persistence service is a stateless EJB which handles JPA entities.

```java
@DataSourceDefinition(
  name = "java:app/SomeDB/ATable",
  className = "org.apache.derby.jdbc.ClientDriver",
  url = "jdbc:derby://localhost:1527/somedb",
  user = "appuser",
  password = "password")
@Stateless
public class PersistenceService {

  @Inject
  EntityManager entityManager;

  @Inject
  QueryService queryService;

  @Inject
  SecurityUtil securityUtil;

  public void saveUser(User user) {

      if (employee.getId() == null) {
          entityManager.persist(user);
      } else {
          entityManager.merge(user);
      }
  }

  public void saveUser(User user) {

      Map<String, String> credMap =
         securityUtil.hashPassword(user.getPassword());

         user.setPassword(credMap.get("hashedPassword"));
         user.setSalt(credMap.get("salt"));

      if (user.getId() == null) {
          entityManager.persist(user);

      } else {
          entityManager.merge(user);
      }

      credMap = null;

  }
}
```

The QueryService is another stateless EJB and manages the JPA queries. 

```java
@Stateless
public class QueryService {

    @Inject
    private SecurityUtil securityUtil;

    @Inject
    EntityManager entityManager;

    @PostConstruct
    private void init() {
    }

    @PreDestroy
    private void destroy() {
    }

    // ... JPA named and dynamic queries would be listed here ...

    public boolean authenticateUser(String email, String plainTextPassword) {

        User user = 
            entityManager.createNamedQuery(User.FIND_USER_BY_CREDENTIALS, User.class)
                .setParameter("email", email.toLowerCase()).getResultList().get(0);

        if (user != null) {
            return securityUtil.passwordsMatch(
              user.getPassword(), user.getSalt(), plainTextPassword);
        }
        return false;
    }
}
```

# Password encryption with Apache Shiro

Passwords must always be hashed and never stored as plain Strings. The SecurityUtil class encrypts passwords in a hashed form. This is where Apache Shiro comes in. The API provides, amongst other things, password hashing techniques.

```java
@RequestScoped
public class SecurityUtil {

    @Inject
    private QueryService queryService;

    // retrieve DB records and compare (note that this call then invokes 
    // passwordsMatch(), below)
    public boolean authenticateUser(String email, String password) {
        return queryService.authenticateUser(email, password);
    }

    // JSON web token related methods =======================================

    public Key generateKey(String keyString) {
      return new SecretKeySpec(
         keyString.getBytes(), 0, keyString.getBytes().length, "DES");
    }

    // used to set the expiration date
    public Date toDate(LocalDateTime localDateTime) {
        return Date.from(
            localDateTime.atZone(ZoneId.systemDefault()).toInstant());
    }

    // password-related methods =============================================

    // Apache Shiro related
    private final PasswordService passwordService =
       new DefaultPasswordService();

    public String encryptText(String plainText) {
      return passwordService.encryptPassword(plainText);
    }

    public boolean passwordsMatch(
        String dbStoredHashedPassword, String saltText, String clearTextPassword) {

        ByteSource salt = ByteSource.Util.bytes(Hex.decode(saltText));
        String hashedPassword = hashAndSaltPassword(clearTextPassword, salt);
        return hashedPassword.equals(dbStoredHashedPassword);
    }

    public Map<String, String> hashPassword(String clearTextPassword) {
        ByteSource salt = getSalt();
        Map<String, String> credMap = new HashMap<>();

        credMap.put("hashedPassword", hashAndSaltPassword(clearTextPassword, salt));
        credMap.put("salt", salt.toHex());
        return credMap;
    }

    private String hashAndSaltPassword(String clearTextPassword, ByteSource salt) {
        return new Sha512Hash(clearTextPassword, salt, 2000000).toHex();
    }

    private ByteSource getSalt() {
        return new SecureRandomNumberGenerator().nextBytes();
    }
}
```

The salt field (a randomly generated sequence of bytes) is generated before a plain String password is hashed. The salt acts as a key which enables a another plain password to be hashed in the same way. When the user needs to log in again, the system will need salt field so that future passwords submitted can be compared to the persisted hashed password. Note that salt related methods are private and can only be invoked through the public methods. Additionally, the hashed password is never decrypted to a plain password.

# The JAX-RS "controller" layer

With the User model and security services prepared, one then proceeds to build the User resource class and methods. This represents the controller (web service) layer and through HTTP methods, invokes the PersistenceService methods (which in turn makes use of the SecurityUtil class methods). It also contains the main point of this section, which is the generation of a JSON web token, via the method ```getToken()```. Note that the web token is unique to a particular URL and hence a particular resource method. In this case, the User's email is used to build a JWT "key" or "secret", an attribute that would be known by the client and web service (since they both know the email). The key is needed to build the signature.

```java
// stores the email for a given session
@SessionScoped
public class ApplicationState implements Serializable {
    private String email;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}

// elsewhere...

@Path("users")
@Consumes("application/json")
@Produces("application/json")
@RequestScoped
public class UsersResource {

    // session-scoped bean, defined above
    @Inject
    ApplicationState applicationState;

    @Inject
    private SecurityUtil securityUtil;

    // part of JAX-RS
    @Inject
    JaxRsClient jaxRsClient;

    @Inject
    PersistenceService persistenceService;

    // part of Java EE
    @Context
    private UriInfo uriInfo;

    // part of java.util.logging
    @Inject
    private Logger logger;

    @POST
    public Response createUser(@Valid User user) {
        persistenceService.saveUser(user);

        jaxRsClient.checkBreachesRx(user.getEmail());

        return Response.created(uriInfo
            .getAbsolutePathBuilder()
            .path(user.getId().toString()).build())
              .status(Response.Status.OK).build();
    }

    @POST
    @Path("login")
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public Response login(
        @FormParam("email") @NotEmpty(message = "Email must be set") String email,
        @NotEmpty(message = "Password must be set") @FormParam("password") String password) {

            if (!securityUtil.authenticateUser(email, password)) {
                throw new SecurityException("Email or password incorrect");
            }
            applicationState.setEmail(email);
            String token = getToken(email);

            return Response.ok().header(AUTHORIZATION, "Bearer " + token).build();
        }

    @GET
    @Path("{id}")
    @Produces({MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML})
    public Response getUserById(@PathParam("id") Long id) {
        return Response.ok().status(Response.Status.OK).build();
    }

    // this is the central part of the JWT: get a token for an authenticated user;
    // in this example, we use the User's email to generate a JWT key
    private String getToken(String email) {
        Key key = securityUtil.generateKey(email);

        String token = Jwts.builder()
                .setSubject(email)
                .setIssuer(uriInfo.getAbsolutePath().toString())
                  .setIssuedAt(new Date()).setExpiration(
                      securityUtil.toDate(LocalDateTime.now().plusMinutes(15)))
                .signWith(SignatureAlgorithm.HS512, key)
                      .setAudience(uriInfo.getBaseUri().toString())
                .compact();

        logger.log(Level.INFO, "Generated token is {0}", token);
        return token;
    }

}
```

When the user fails to get authenticated (via POST method "/api/v1/users/login") then a SecurityException is thrown. This exception is mapped to a HTTP response, as defined below.

```java
@Provider
public class SecurityExceptionMapper implements ExceptionMapper<SecurityException> {
    @Override
    public Response toResponse(SecurityException exception) {
        return Response.status(Response.Status.UNAUTHORIZED).entity(exception.getMessage())
                .build();
    }
}
```

# The post-matching request filter and @Secure

With the user authenticated, they can then invoke all resource methods that are annotated with ```@Secure```. First, the request filter is defined in its own class, given next. This also introduces a new annotation, ```@Priority(Priorities.AUTHENTICATION)```. This prioritises the SecurityFilter over all other filters (the lower the number, the higher the priority; AUTHENTICATION = 1000). Hence, this filter filters traffic before other filters, which makes sense since it defines the authentication layer as it were. 

The ```@Secure``` is a "name-binding" annotation. Name-bind associates an annotation with a filter (a class which implements a JAX-RS filter interface). Any method which uses the same annotation, that is ```@Secure``` is then referred to SecurityFilter and hence requires authentication. It does not mean (as with resource methods) that this class, SecurityFilter, or its methods require authentication or require a HTTP authorisation header. The ```@Secure``` class level annotation is essentially a reference for all resource methods.

```java
// custom interface which connects SecurityFilter with resource methods annotated
// with @Secure (referred to as "name-binding")
@NameBinding
@Retention(RetentionPolicy.RUNTIME)
@Target({TYPE, METHOD})
public @interface Secure {
}

// ... the request filter is next ...

@Provider
@Secure
@Priority(Priorities.AUTHENTICATION)
public class SecurityFilter implements ContainerRequestFilter {

    private static final String BEARER = "Bearer";

    @Inject
    private Logger logger;

    @Inject
    ApplicationState applicationState;

    @Inject
    private SecurityUtil securityUtil;

    @Override
    public void filter(ContainerRequestContext reqCtx) throws IOException {

        //1. Get the token from the request header
        String authHeader = reqCtx.getHeaderString(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith(BEARER)) {
            logger.log(Level.SEVERE, "Wrong or no authorization header found {0}", authHeader);
            // JAX-RS will also return the HTTP header to the client with feedback when the
            // following exception is thrown
            throw new NotAuthorizedException("No authorization header provided");
        }

        String token = authHeader.substring(BEARER.length()).trim();

        //2. Parse the token
        try {
            Key key = securityUtil.generateKey(applicationState.getEmail());

            // throws an exception if it fails
            Jwts.parser().setSigningKey(key).parseClaimsJws(token);

            // get the current context and re-build a new one
            SecurityContext securityContext = reqCtx.getSecurityContext();
            reqCtx.setSecurityContext(new SecurityContext() {
                @Override
                public Principal getUserPrincipal() {
                    return () -> Jwts.parser()
                                      .setSigningKey(key)
                                      .parseClaimsJws(token)
                                      .getBody()
                                      .getSubject();
                }

                @Override
                public boolean isUserInRole(String s) {
                    return securityContext.isUserInRole(s);
                }

                @Override
                public boolean isSecure() {
                    return securityContext.isSecure();
                }

                @Override
                public String getAuthenticationScheme() {
                    return securityContext.getAuthenticationScheme();
                }
            });
            logger.info("Token parsed successfully");

            //3. When parsing fails....get help!
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Invalid {0}", token);
            //Another way to send exceptions to the client
            reqCtx.abortWith(Response.status(Response.Status.UNAUTHORIZED).build());
        }
    }
}
```
