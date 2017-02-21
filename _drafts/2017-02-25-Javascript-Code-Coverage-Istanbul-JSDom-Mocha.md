---
layout: post
title: Javascript Code Coverage with Istanbul + JSDom + Mocha
published: true
---

In this post I'll describe a method of generating code coverage with [Istanbul](https://github.com/gotwarlost/istanbul)
 while using [JSDom](https://github.com/tmpvar/jsdom) and [Mocha](https://mochajs.org/). Normally
 these three work well together, but that is when you use ```require``` to import your javascript code.
 If you take adavantage of JSDom's ability to load Javascript files from the filesystem you will be
 left in the dark with respect to coverage information.

 Normally loading Javascript using JSDom goes something like this:
{% highlight javascript %}
jsdom.env({
    // generated background page
    html: '<html></html>',
    // js source
    src: [
        fs.readFileSync('lib/myLib.js', 'utf-8'),
    ],
    created: function (errors, wnd) {
    },
    done: function (errors, wnd) {
        if (errors) {
            console.log(errors);
            done(true);
        } else {
            window = wnd;
            done();
        }
    }
});
{% endhighlight %}
Since ```myLib.js``` isn't loaded through ```require``` it won't be instrumented 
automatically with Istanbul.  However, that doesn't mean that it cannot be instrumented some other way.
The key will be to instrument the code before passing it off to JSDom, then to perform some
variable magic to expose the coverage information in ```global``` to be picked up by Istanbul when
the test is complete.

The first thing to do is to generate instrumented code, this is simple with Istanbul`s API.
{% highlight javascript %}
var istanbul = require('istanbul');

function instrument(file) {
    var js = fs.readFileSync(file, 'utf-8');

    var instrumenter = new istanbul.Instrumenter({
        coverageVariable: coverageVar,
    });
    var filename = fs.realpathSync(file);
    var generatedCode = instrumenter.instrumentSync(js, filename);
    return generatedCode;
}
{% endhighlight %}
The relevant parts of the JSDom setup now become: 
{% highlight javascript %}
jsdom.env({
    src: [
        instrument('lib/myLib.js')
    ]
});
{% endhighlight %}
So instead of loading the file directly into JSDom, we just instrument it first, then pass it 
into JSDom for testing.

One piece I didn't elaborate on here was where ```coverageVariable``` comes from.  The way Istanbul works
is that it keeps coverage information in a global variable.  As instrumented code is executed this global variable
is updated and when the test is complete Istanbul generates its report from this variable.  The issue
that we have when we instrument our code is we don't get access to this variable from Istanbul's API.
However, there is a way around this, we can sniff the variable from the global scope with something like
the following
{% highlight javascript %}
var coverageVar = (
    function() {
        var coverageVar;
        for(var key of Object.keys(global)) {
            if (/\$\$cov_\d+\$\$/.test(key)) {
                coverageVar = key;
            }
        }
        console.log('Coverage var:', coverageVar);
        return coverageVar;
    }
)();
{% endhighlight %}
The one downfall of this is that it is brittle, depending on what Istanbul decides to use name
their coverage variable, at this moment they use the following ``` var coverageVar = '$$cov_' + new Date().getTime() + '$$'```.

Now that our code is properly instrumented we have one remaining step, we have to manage the coverage variable
within JSDom.  We do this by just setting the coverage variable in the new ```window``` that JSDom creates.
{% highlight javascript %}
jsdom.env({
    created: function (errors, wnd) {
        // pass the coverage variable into the new window
        wnd[coverageVar] = global[coverageVar];
    },
});
{% endhighlight %}

With those steps completed we can now properly generate code coverage information with
Istanbul + JSDom + Mocha.  One could also write a hook for ```readFileSync``` within Istanbul
that would perform similar work that the hook for ```require``` does.

