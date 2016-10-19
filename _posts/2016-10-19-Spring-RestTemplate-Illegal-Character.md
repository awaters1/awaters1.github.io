---
layout: post
title: Spring RestTemplate Illegal Character - JsonParseException
published: true
---

[Spring's](https://spring.io/) [RestTemplate](http://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/client/RestTemplate.html)
 utility class is great, in a few lines
you can turn a HTTP resource into a Java object
through [Jackson](http://wiki.fasterxml.com/JacksonHome).
{% highlight java %}
class MyData {
    String data;
    int count;
}
RestTemplate restTemplate = new RestTemplate();
MyData myData = restTemplate
    .getForObject("http://www.example.com/mydata", MyData.class);
System.out.println(myData.data);
{% endhighlight %}

With one caveat, you don't really know how it works so 
when you get exceptions it can be a little hard to debug.  One such exception
is the JsonParseException caused by the url <https://analytics.usa.gov/data/live/top-cities-realtime.json>.

```
Caused by: com.fasterxml.jackson.core.JsonParseException: Illegal character ((CTRL-CHAR, code 31)): only regular white space (\r, \n, \t) is allowed between tokens
```

Loading that URL in the browser doesn't reproduce anything strange making it hard 
to diagnose.  While it is hard to diagnose it is really simple to fix.  RestTemplate
can be configured to accept different request factories.  By default it uses
```SimpleClientHttpRequestFactory```, which in simple terms means it doesn't 
support gzip encoding.  In order to get around this you only need to specify
another request factory that can support gzip encoding.  Luckily enough the Spring Framework
comes with a plug and play request factory,
[HttpComponentsClientHttpRequestFactory](http://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/http/client/HttpComponentsClientHttpRequestFactory.html), 
based on the ever popular [Apache HttpComponents](https://hc.apache.org/) library.  Switching to this different 
request factory is very simple.

{% highlight java %}
restTemplate.setRequestFactory(new HttpComponentsClientHttpRequestFactory());
{% endhighlight %}

The URL quoted above should not have returned gzip data because the request headers
did not contain Accept-Encoding: 'gzip', but not every implementation follows the rules.
Fortunately for us the Spring Framework has created a very configurable ```RestTemplate``` that allowed
us to plug in a more capable request factory that allowed us to retrieve and parse JSON
data with minimal lines of code.
