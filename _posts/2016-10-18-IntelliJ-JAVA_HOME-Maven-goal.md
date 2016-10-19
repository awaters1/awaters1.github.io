---
layout: post
title: JAVA_HOME where art thou?
published: false
---

Today while running a maven target during the pre-build 
phase of my project I received the error x

This was on intelij 16.2 ce and mac osx macbook pro.  

My first solution involved just setting the Java home property 
in the launch configuration page within Environment Variables. 
 This, however, does not affect the the Maven Goals that are executed. 
  To configure the environment variables for those one needs to fairly 
  deep into Intellijs settings.  The exact path is Build, Execution, Deployment, 
  then Build Tools, next Maven, and last but not least Runner.  
  Here you will be greeted with another Environment Variables field, 
  this one being the correct one to set java home.

Following those steps should get you up and running, if you need help
 finding out what to set as java home look at these resources
