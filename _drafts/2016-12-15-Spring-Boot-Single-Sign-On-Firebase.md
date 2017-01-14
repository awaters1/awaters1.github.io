---
layout: post
title: Spring Boot and Single Sign On with Firebase
published: true
---

Using single sign on is a simple way to manage user
identities without going through the hassle of 
maintaining a user database.  What better
way to take advantage of it than through Spring Boot
and Spring Security?  In part 1 of this series we will take advantage
of Firebase Auth and use Angular 2 to develop the front end.

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
