---
layout: post
title: Spring WebSockets for an Angular2 Stomp Backend
published: true
---

// TODO: Need better English

The Spring Framework has a very good guide on setting
up WebSockets on the backend.  It describes from start to
finish how to setup the tooling all the way to the sample
HTML and Javascript to test out the server side. The tutorial
is located at <https://spring.io/guides/gs/messaging-stomp-websocket/> 
and is a nice read.

One part where it falls short is sending out websocket messages
during processing as opposed to just when the method returns.
This, however, is simple do, one just needs to @Inject
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

// TODO: This needs to be rewritten to be better English
This is just a simple example that doesn't do anything useful.  Although
in some instances sending progress updates during long running tasks
is a good practice, ideally your Web API shouldn't be taking its sweet time.
Some other cases where it could be useful
are when running scheduled tasks through Spring's 
[Scheduled Tasks](https://spring.io/guides/gs/scheduling-tasks/)

Spring's WebSockets support for Stomp will be helpful when we hook
it up to the Angular2 client side in part 2 of this post.
