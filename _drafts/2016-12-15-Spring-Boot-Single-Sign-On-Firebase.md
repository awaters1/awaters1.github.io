---
layout: post
title: Spring Boot and Single Sign On with Firebase
published: true
---

Using single sign on is a simple way to manage user
identities without going through the hassle of 
maintaining a user database.  What better
way to take advantage of it than through Spring Boot
and Spring Security?  In this example we will take advantage
of Firebase Auth and use Angular 2 to develop the front end.

In this case the client side code is easy so we will start with
that first.  The bulk of client side is contained in two libraries
angularfire2 and firebase.  The latest version of angularfire2
is good enough, but make sure to use firebase 3.4.0 to 
avoid the TODO: error.  
