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
to be injected into any component's constructor.

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
Within the constructor the first thing we do is create an Observable
that will be used for the inital connection to the WebSocket.  The Observable
is responsible for creating the inital SockJS connection and the Stomp client.
Once the connection callback is executed the Observable for the topic is
initialized.  The Observable for the topic is responsible for subscribing
to the topic and pushing JSON objects to the Observable.  The nice part of this
is that it is simple to unsubscribe from the topic and disconnect from the WebSocket
by unsubscribing from the underlying Observables.  There are some short falls
in this solution though, it doesn't handle reconnects and it won't work with multiple subscriptions
to websocketObservable because ```next``` is only called upon first connect.

The next step will be to actually use it within a component, an example of that is below.
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
Here we just subscribe to the WebSocket Observable and then once we get
a result, which is just an empty Object we then subscribe to the topic Observable.
As new messages come in through the WebSocket for that topic a message is
printed on the console.

This should help you figure out how to get a Stomp WebSockjet backend communicating
with an Angular2 front end.  The beauty of this is that the messages come through 
an RxJS Observable.  One thing to note is that if you plan on using this in production
you should also take care of unsubscribing from the topicObservable and
also come up with a better mechanism to handle creating the initial WebSocket connection.

