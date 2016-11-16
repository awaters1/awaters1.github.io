---
layout: post
title: Spring WebSockets for an Angular2 Stomp Backend
published: true
---

The Spring Framework has a very good guide on setting
up WebSockets on the backend.  It describes from start to
finish how to setup the tooling all the way to the sample
HTML and JavaScript to test out the server side. The tutorial
is located at <https://spring.io/guides/gs/messaging-stomp-websocket/> 
and is a nice read.

One part where it falls short is sending out websocket messages
during processing as opposed to just when the method returns.
This, however, is simple to do, one just needs to ```@Inject```
an instance of [SimpMessagingTemplate](http://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/messaging/simp/SimpMessagingTemplate.html)
and invoke one of the ```convertAndSend``` methods based on your use case.
A sample of sending out a websocket message while a function is
executing is below.
{% highlight java %}
@Autowired
private SimpMessagingTemplate messagingTemplate;

public void doGreatStuff() {
    doSomeWork();
    messagingTemplate.convertAndSend("/topic/greatThings", myData1);
    doSomeWork2();
    messagingTemplate.convertAndSend("/topic/greatThings", myData2);
    doSomeWork3();
    messagingTemplate.convertAndSend("/topic/greatThings", myFinalData);
}
{% endhighlight %}

While it is good practice to keep the user informed of the status
of long running tasks, ideally your Web API shouldn't be taking its sweet time
to process data. However, a case where it would be more useful would be 
when running scheduled tasks through Spring's 
[Scheduled Tasks](https://spring.io/guides/gs/scheduling-tasks/) interface.  

Spring's WebSockets support for Stomp will be helpful when we hook
it up to the Angular2 client side in part 2 of this post.
