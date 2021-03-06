import { Component, OnInit } from '@angular/core';
import { HighlightResult } from 'ngx-highlightjs';

@Component({
  selector: 'app-jakarta-producers',
  templateUrl: './jakarta-producers.component.html',
  styleUrls: ['./jakarta-producers.component.css']
})
export class JakartaProducersComponent implements OnInit {

  response: HighlightResult;

  lang = ["java"];

  constructor() { }

  ngOnInit(): void {
  }

  producerMethod = `
  import javax.enterprise.inject.Produces;
  import javax.enterprise.inject.spi.InjectionPoint;
  import java.util.logging.Logger;
  
  public class LoggerProducer {
    // note that Logger is now a bean
    @Produces
    public Logger produceLogger(InjectionPoint injectionPoint) {
        return Logger.getLogger(injectionPoint.getMember().getDeclaringClass().getName());
    }
  }`;

  injectLogger = `    //Producer object in a class that implements Serializable, inheriting the same scope
  @Inject
  private Logger logger;`

  producerMethodList = `
  public class SomeNonBean {
    @Produces
    public List<String> getList() {

      List<String> someList = new ArrayList<>();

      someList.add("Greetings");
      someList.add("Bye for now");
      
      return someList;
    }
  }`;

  producerMethodListField = `
  public class SomeNonBean {
      @Produces
      SomeOtherNonBean example;
  }
  
  // some other class, inject SomeOtherNonBean
  
  @Inject
  SomeOtherNonBean anotherBean;
  `;

  producerMethodListQualifier = `
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
  private CommonInterface someInstance;`;

  producerMethodListFieldDisposes = `
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
  `;

  interceptor = `
  @InterceptorBinding
  @Retention(RetentionPolicy.RUNTIME)
  // consecutively, by method and by class
  @Target({ElementType.METHOD, ElementType.TYPE})
  @Inherited
  public @interface Logged {
  }`;

  interceptorBinding = `
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
    }`;
    
  onHighlight(e) {
    this.response = {
      language: e.language,
      relevance: e.relevance,
      second_best: '{...}',
      top: '{...}',
      value: '{...}'
    }
  }
}
