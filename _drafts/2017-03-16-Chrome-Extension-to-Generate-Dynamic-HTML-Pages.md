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

