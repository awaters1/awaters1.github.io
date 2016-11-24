---
layout: post
title: Angular 2 Stomp and WebSockets
published: true
---

In part 1 of this series I described [Spring WebSockets]({% post_url 2016-11-15-Spring-WebSockets-Angular2-Stomp %}),
here is part 2 which describes the client for the WebSocket, written in Angular 2.
This takes advantage of several open source libraries, namely [SockJS](https://github.com/sockjs/sockjs-client)
and [stomp-websocket](https://github.com/ThoughtWire/stomp-websocket)
from [ThoughtWire](https://www.thoughtwire.com/).

The goal of the client side implementation will be to create a WebSocket
connection to the server and allow for subscribing to pre-defined topics
through RxJS Observables.
All of this will be implemented within an Angular2 service that is designed
to be injected any component's constructor.

I'll start with the code first and then describe how it works
{% highlight typescript %}
websocketObservable: Observable<any>;
topicObservable: Observable<TwitterStatus>;

constructor(private http: Http) {
  this.websocketObservable = Observable.create(websocketSubscriber => {
    console.log("Connecting to websockets");
    let socket = new SockJS("http://myhost/my-websocket");
    let stompClient = Stomp.over(socket);
    stompClient.debug = (message: string) => {
    
    };
    stompClient.connect({}, (frame: Frame) => {
      console.log("Connected to websocket");
      this.topicObservable = Observable.create(responseSubscriber => {
        let subscription = stompClient.subscribe('/topic/myTopic', (message: Frame) => {
          responseSubscriber.next(JSON.parse(message.body));
        });
        return () => {
          subscription.unsubscribe();
        };
       }).share();

      websocketSubscriber.next({});
    });


    return () => {
    console.log("Disconnecting websocket");
      stompClient.disconnect();
    }
  }).share();
}
{% endhighlight %}
TODO: Describe the code above

That service will be responsible for managing the WebSocket, the next
step will be to actually use it within a component, an example of that is below.
{% highlight typescript %}
constructor(private websocketService: WebsocketService) {
  this.websocketService.websocketObservable.subscribe((result) => {
    mySubscription = this.websocketService.topicObservable.subscribe((myWebSocketResponse) => {
      console.log('Received new websocket data');
      console.log(myWebSocketResponse);
    })
  });
}
{% endhighlight %}

This should help you figure out how to get a Stomp WebSockjet backend communicating
with an Angular2 front end.  The beauty of this is that the messages come through 
an RxJS Observable.  One thing to note is that if you plan on using this in production
you should also take care of unsubscribing from the topicObservable and
also come up with a better mechanism to handle creating the initial WebSocket connection.

