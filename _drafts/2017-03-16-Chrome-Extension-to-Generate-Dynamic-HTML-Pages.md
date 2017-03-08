---
layout: post
title: Chrome Extension to Generate Dynamic HTML Pages
published: true
---

Creating a Chrome extension can be overwhelming, but they do not have
to be!  In this post we will explore creating an extension that will
generate a dynamic HTML page based on data contained within 
the site we are currently on.  This can be useful to create a printer
friendly version of a site that otherwise isn't.

Before we get into the details of the Chrome extension let me introduce
you to the site we will be working with, [Peeron](http://peeron.com). The
site contains instruction scans of many older LEGO sets, along with their
inventory.  This is very helpful if you have old sets with missing instructions.
Here is an example page of instructions [6090-1 Royal Knight's Castle](http://peeron.com/cgi-bin/invcgis/scans/6090-1/?ct=1)
and the inventory page is at [inventory page](http://peeron.com/inv/sets/6090-1).
One of things that I wanted to do was print out the instructions so that they are
easier to read, in order to do this I would have to open up each page and print 
it individually. Another thing I wanted to do was mark which pieces were missing in 
each set and generate a report to print out.

The first issue we will tackle will be generating a print out of the instructions, it will
contain a cover page with the set information and the instructions themselves.
To get started add a page action to the manifest.json file, we will also us the declarativeContent
permission to control when the page action is enabled.
{% highlight json %}
  "page_action": {
    "default_title": "Generate Page Report"
  }
  "permissions": [
    "storage",
    "declarativeContent"
  ],
{% endhighlight %}
Within the event page we will put the following code
{% highlight javascript %}
chrome.runtime.onInstalled.addListener(function() {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([{
        conditions: [
            new chrome.declarativeContent.PageStateMatcher({
                pageUrl: { 
                    urlMatches: 'http://peeron.com/scans/.*' 
                },
            }),
            new chrome.declarativeContent.PageStateMatcher({
                pageUrl: { 
                    urlMatches: 'http://peeron.com/inv/sets/.*' 
                },
            }),
        ],
        actions: [new chrome.declarativeContent.ShowPageAction() ]
        }]);
    });
  });

 chrome.pageAction.onClicked.addListener(function(tab) {
      console.log('Clicked page action in tab', tab);
    chrome.tabs.sendMessage(tab.id, {url: tab.url}, function() {

    });
  });
{% endhighlight %}
This code will ensure that the page action is enabled when the 
url matches an instruction page for a set or the page for the set itself, 
which we will use later. The last part fires off an event to the tab that
was active when the page action was clicked.  This now takes us to our
content script.

Within the content script we will be extracting the data from the page
that will be eventually passed to our generated HTML. To get started
we first have to handle the event from the event page
{% highlight javascript %}
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (/http:\/\/peeron.com\/scans\/.*/.test(request.url)) {
        generatePageForScans();
    } else if (/http:\/\/peeron.com\/inv\/sets\/.*/.test(request.url)) {
        generatePageForInventory();
    }
});
{% endhighlight %}
In this post we will be focussing on ```generatePageForScans``` is responsible
for parsing the HTML of the active tab and determining the location of all of the
images that make up the set instructions.  It generates a data structure to store
the data and then passes it back to the event page.
{% highlight javascript %}
function generatePageForScans() {
    console.log('Generating page scan page');
    let baseUrl = 'http://belay.peeron.com/scans/'
    let linkRegex = /.*\/scans\/(\d+\-\d+)\/(\d+).*/;

    let allLinks = $("a:contains('Page')");
    let allImages = [];
    allLinks.each(function() {
        let link = $(this);
        let match = linkRegex.exec(link.attr('href'));
        if (match) {
            let setId = match[1];
            let page = match[2];
            let imageUrl = baseUrl + setId + '/' + page;
            allImages.push(imageUrl);
        }
    });
    let title = $("h2").text();
    chrome.runtime.sendMessage({ 
        action : 'pageForScans',
        data: {
            title: title,
            allImages: allImages,
            url: location.href,
            setInfo: $("p.setinfo").text(),
        }
    }, function(response) {

    });
}
{% endhighlight %}
Within the event page we handle this event and tell Chrome to
create a new tab using ```scan-layout.html``` as our template
and we store the data from the content script in local storage.
Take note that we append a random id to the URL in the hash fragment.
{% highlight javascript %}
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action == 'pageForScans') {
            let id = getRandomId();
            chrome.tabs.create({
                url: chrome.extension.getURL('lib/scan-layout.html') + '#' + id
            }, function(tab) {
                let data = {};
                data[id] = { 
                    data: request.data,
                    tabId: tab.id
                };
                chrome.storage.local.set(data, function() {
                    sendResponse({});
                });
            });
        }  else if (request.action == 'layoutPage') {
            console.log(request);
            chrome.storage.local.get(request.id, function(items) {
                let item = items[request.id];
                let tabId = item.tabId;
                let data = item.data;
                console.log('Storage Item: %o', item);
                sendResponse(data);
                chrome.storage.local.remove(request.id);
            });
        }
    })
{% endhighlight %}
```scan-layout.html``` is our template that is responsible for 
taking the data and rendering it how we want.  To get the data
into our local context there is some magic we have to do though.
Once the html page is loaded we load a JavaScript file
that sends a message to our event page with the id from the hash fragment.
The event page uses the id to look up the data in the storage and sends it back
in the callback.  We then use that data to render our page.
{% highlight javascript %}
(function() {
  chrome.runtime.sendMessage({action: "layoutPage", id: location.hash.substr(1)}, function(response) {
    let data = response;
    $('#title').text(data.title);
    $('#url').text(data.url);
    $('#setInfo').text(data.setInfo);
    for(let image of data.allImages) {
        var img = $('<img />', {
            src: image
        });
        $('#imagesContainer').append(img);
    }
  });
})();
{% endhighlight %}

With the message passing between the content script, event page and 
template we can create dynamic data and render it, thereby creating
a dynamically generated HTML page.  We will also take advantage of
this infrastructure in Part 2 where we will add dynamic elements 
to peeron.com to keep track of our missing inventory pieces.
