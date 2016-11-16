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
connection to the server and allow for subscribing to pre-defined topics.
All of this will be implemented within an Angular2 service that is designed
to be injected to the any component's constructor.  
