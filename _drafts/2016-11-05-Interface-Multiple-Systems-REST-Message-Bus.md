---
layout: post
title: Interfacing Multiple Systems with REST or a Message Bus 
published: true
---

When it comes down to interfacing multiple systems the
first choice is usually to intergrate them with a 
RESTful web API.  At first this makes sense, establish 
interaces on both sides and let everything talk to each other.
This, however, breaks down quickly when multiple
teams are creating those interfacing APIs.

Each team does things their own way, that can be anything to
method names all the way to the different HTTP verbs.
Do they name methods like/this or like_this, likewise with
parameter names do they prefer they_look_like_this or likeThis?
These are very minor issues and they can quickly be fixed
with a few days of pair programming with the different team
members.  Things get a lot more hairy when miscommunicated
requirements lead to implementations that do not integrate.

If two APIs communicate with each other directly they
need to have a strict contract to ensure both sides
do what they are suppose to.  This requires well thought
out requirements and multiple (sequence diagrams)[https://en.wikipedia.org/wiki/Sequence_diagram].
Initially the plan looks good on a whiteboard but when the 
fingers hit the keboard and the code hits the CPU things
start to turn ugly.  We find out that the multiple sides
involved in the communication cannot fulfill the contract
for various reasons and then it is back to the drawing board.
Before you know things are delayed or things are cut,
if you  lucky things get cut and the implementations 
become much simpler.

You have to think, is there a way around this strict
communication protocol that we are creating? Given that
this blog post is being written, well yes there is a way 
around it, welcome to the world of the message bus.
Message buses have been around for a while

// TODO: Talk about the message bus


