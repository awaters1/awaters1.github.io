---
layout: post
title: My Definition of Big Data
published: true
---

When I first started at my most recent job everyone
talked about Big Data, Big Data this, Big Data that,
do you have Big Data experience? I was dumb founded,
I never actually heard of Big Data so I was all ears.
Little did I know at that time they were just as clue less
but doing a better job than me of faking it 'till they made it.

It took a little while for me to become used to Big Data.
I took some classes on Coursera, which was great by the way,
they gave a good introduction.  I worked with large data sets
at work, or so I thought, I learned new technologies like
Apache Spark and MapReduce methodologies. I even worked with
some Facebook data that was ingested through AWS Lambda but none
of this held a candle to when I started looking
at Twitter's API.

With Twitter I thought I was going small, truly, how 
much data could they fit through their streaming API?
I was thinking something along the lines of 100 tweets/second,
boy was I wrong.  After first seeing some data come in with their
sample code I shut the stream off and began refactoring it.  
I created a thread pool executor to take messages off of the queue
and batch them into 25 tweets to be inserted into MongoDB.
I started with two jobs to run on the executor, when one finished
it would schedule another one.  It seemed like it would work out well
and be able to take messages off of the queue fast enough, and it did
work very well, perhaps too well.  The first time I executed the code
it appeared to be working well, no errors were printed until
I started to receive connection issues.  The error was
 ```Unexpected end of ZLIB input stream```.  This brought down
 a rabbit hole of debugging and figuring out the source of the error.
The conclusion I came to was Twitter was closing the connection on
their end, for what reason I did not know at the time.  In the mean time
I decided to check the MongoDB collection and behold there is all
that data, it clocked in at about 4 gigs of space with half a million
tweets.  I'm not sure how long it took it to get there, but it was definitely
way faster than 100 tweets/second.

As you could have guessed Twitter was closing the connection on their
end because I was reading the stream too slowly and
ended up hitting the number of re-connection attempts. 

So what is my definition of Big Data? Well to be honest it
is data that once you start working with it you
think to your self "damn that is a lot".  Too much for your
crappy Internet, too fast for your spinning rust and
too complex for you quad core CPU that you thought
could handle anything.
