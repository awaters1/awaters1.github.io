---
layout: post
title: Spring Boot and Single Sign On with Firebase Part 2
published: true
---

This post continues the work from part 1 of 
[Spring Boot and Single On with Firebase]({% post_url 2017-01-26-Spring-Boot-Single-Sign-On-Firebase %}).
As seen before the client side is fairly simple with most of the work
being done by angular2fire.  The server side, with Spring Boot, 
involves a few more steps to integrate it properly with
Spring Security.

In our example the Firebase JWT token is passed in through the
X-Firebase-Auth header and assumes any url under the path /auth requires authentication. 
In order to handle that in Spring
Security we will use a ```ServletFilter``` that is invoked
before control passes to Spring Security.  The filter can be seen below,
for more details on its operation see https://www.toptal.com/java/rest-security-with-jwt-spring-security-and-java

{% highlight java %}
public class FirebaseAuthenticationTokenFilter extends AbstractAuthenticationProcessingFilter {

	private final static String TOKEN_HEADER = "X-Firebase-Auth";

	public FirebaseAuthenticationTokenFilter() {
		super("/auth/**");
	}
	
	@Override
	public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) {
		final String authToken = request.getHeader(TOKEN_HEADER);
		if (Strings.isNullOrEmpty(authToken)) {
			throw new RuntimeException("Invaild auth token");
		}

		return getAuthenticationManager().authenticate(new FirebaseAuthenticationToken(authToken));
	}
	
  /**
     * Make sure the rest of the filterchain is satisfied
     *
    */
    @Override
    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain, Authentication authResult)
            throws IOException, ServletException {
        super.successfulAuthentication(request, response, chain, authResult);

        // As this authentication is in HTTP header, after success we need to continue the request normally
        // and return the response as if the resource was not secured at all
        chain.doFilter(request, response);
    }
}
{% endhighlight %}

The filter should be before any Spring Security filter, so something like

{% highlight java %}
httpSecurity.addFilterBefore(authenticationTokenFilterBean(), UsernamePasswordAuthenticationFilter.class);
{% endhighlight %}

The last step is to use an authentication provider to supply the ```UserDetails```

{% highlight java %}
@Component
public class FirebaseAuthenticationProvider extends AbstractUserDetailsAuthenticationProvider {

    @Autowired
    private FirebaseAuth firebaseAuth;

    @Override
    public boolean supports(Class<?> authentication) {
        return (FirebaseAuthenticationToken.class.isAssignableFrom(authentication));
    }

    @Override
    protected void additionalAuthenticationChecks(UserDetails userDetails, UsernamePasswordAuthenticationToken authentication) throws AuthenticationException {
    }

    @Override
    protected UserDetails retrieveUser(String username, UsernamePasswordAuthenticationToken authentication) throws AuthenticationException {
        final FirebaseAuthenticationToken authenticationToken = (FirebaseAuthenticationToken) authentication;
        final CompletableFuture<FirebaseToken> future = new CompletableFuture<>();
        firebaseAuth.verifyIdToken(authenticationToken.getToken()).addOnSuccessListener(future::complete);
		try {
			final FirebaseToken token = future.get();
			return new FirebaseUserDetails(token.getEmail(), token.getUid());
		} catch (InterruptedException | ExecutionException e) {
			throw new SessionAuthenticationException(e.getMessage());
		}
    }
}
{% endhighlight %}