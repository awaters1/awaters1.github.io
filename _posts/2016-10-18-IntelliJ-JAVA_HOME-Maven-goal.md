---
layout: post
title: JAVA_HOME where art thou?
published: true
---

Today while running a [Maven](https://maven.apache.org/) goal during the pre-build 
phase of my project I received the error

> Failed to execute goal org.apache.maven.plugins:maven-javadoc-plugin:2.9.1:javadoc Unable to find javadoc command: 
> The environment variable JAVA_HOME is not correctly set

This was with [IntelliJ IDEA](https://www.jetbrains.com/idea/) CE 2016.2.5 running on Mac OSX 10.11.6 El Capitan.

My first solution involved just setting the JAVA_HOME property 
in the launch configuration page within Environment variables. 
This, however, does not take affect when executing the Maven goals that
are part of the pre-build launch. 
To configure the environment variables for those one needs to delve fairly 
deep into IntelliJ's settings.  The exact path is __Build, Execution, Deployment__, 
then __Build Tools__, next __Maven__, and last but not least __Runner__. 
Here you will be greeted with another Environment Variables field, 
this one being the correct one to set JAVA_HOME.
![IntilliJ JAVA_HOME Maven Environment Variable](/images/java_home_intellij_javadoc_mac_osx.png)

Following those steps should get you up and running, if you need help
finding out what to set as JAVA_HOME should be execute the command
```/usr/libexec/java_home``` within a terminal session.
