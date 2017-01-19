---
layout: post
title: Spring Boot and Single Sign On with Firebase Part 2
published: true
---

This post continues the work from part 1 of 
[Spring Boot and Single On with Firebase]({% post_url 2016-12-15-Spring-Boot-Single-Sign-On-Firebase %}).
As seen before the client side is fairly simple with most of the work
being done by angular2fire.  The server side, with Spring Boot, 
involves a few more steps to integrate it properly with
Spring Security.

In order to use this solution you first need to setup
your Firebase account.  This procedure is fairly straight forward
and just requires choosing the right settings.  


The bulk of client side is contained in two libraries
angularfire2 and firebase.  The latest version of angularfire2
is good enough, but make sure to use firebase 3.4.0 to 
avoid the TODO: error.  Just import the ```AngularFire``` component
and have it injected into the constructor, from there you
can use the method ```this.af.auth.login()``` to start the login flow.
The code below demonstrates some common functionality of angularfire2.

{% highlight typescript %}
import { Component } from '@angular/core';
import { AngularFire } from 'angularfire2';

@Component()
export class ToolbarComponent { 
  private auth: any;
  constructor(public af: AngularFire) {
    // When the auth state changes we can get a copy
    this.af.auth.subscribe(auth => {
      this.auth = auth;
    });
  }

  getToken() {
    // Obtain JWT access token
    this.auth.auth.getToken().then((token: string) => {
      console.log(token);
    })
  }

  login() {
    // Start login flow
    this.af.auth.login();
  }

  logout() {
    this.af.auth.logout();
  }
}
{% endhighlight %}
