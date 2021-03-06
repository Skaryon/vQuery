![AVA](logo.png)
# vQuery
> virtual DOM goodness for everyone

vQuery is an isomorphic library that aims to enable more developers to speed up their code base with virtual DOM diffing and DOM patching.

It implements a subset of the [jQuery](http://www.jquery.com/) API, but executes all manipulations on a virtual DOM and only updates the real DOM with a patch generated from the state of the virtual DOM whenever vQuery.update is called (either manually or at set intervals).

This can significantly reduce the number of real DOM manipulations needed to render a view to the browser, thus also eliminating unneeded repaints and reflows.

Furthermore, vQuery also works in the node.js environment. You can load HTML documents, manipulate them and retrieve the new output - or a patch (that you might send to the browser).

**WARNING: This library is very much still a work in progress and in no way ready for production use!**


## Example:

```javascript
$(function () { //wait for page to finish loading
    $('body') //select the body element
        .append("<div>Hello World!</div>"); //append a child div
    $.update(); //computes a DOM patch and applies it to the real DOM
}, {
    autoUpdate: false //disable auto patching of the DOM
});
```


## Motivation

I've been working with different virtual DOM implementations for my master's thesis and have been using various related javaScript frameworks in the past. I realized that for the most part, if people want to take advantage of virtual DOM diffing and patching, they would have to commit to using one of the various frameworks which supports those features - including all of it's opinionated concepts.
This is why I felt there's room for a library which enables vDOM powered DOM manipulation without the baggade of an entire framework. One that provides a familiar, proven API.


## API


### Options

You can supply vQuery with an options object as the second argument:


```javascript
$(function () {...}, 
    {
        autoUpdate: true, //Should the DOM automatically be patched in intervals (using window.requestAnimationFrame)? You can always call vQuery.update() to trigger a patch. Default: true
        updateInterval: 1 //The time between each auto-patch in milliseconds. Default: 1
    }
);
```

### Main vQuery method:

```javascript
$(function|string|object)...
```
Arguments:
* **function:** pass a function that will be executed once the DOM is ready
* **string:** This can either be a HTML string or a CSS selector. Returns either an instance of **virtualQuery** or an empty array;
* **object**: An instance of **virtualNode**. Returns an instance of **virtualQuery** 


## virtualQuery

**virtualQuery** objects are just like jQuery objects. They offer an API to manipulate a selection of virtual DOM nodes. 

All of the supported methods emulate the [jQuery API](http://api.jquery.com/).


### supported methods:

* append
* appendTo
* prepend
* prependTo
* remove
* addClass
* removeClass
* hasClass
* html
* attr
* css
* clone
* on
* off


### Supported CSS Selectors:

* tagname
* #id
* .class
* [attribute]
    * [attribute=value]
    * [attribute~=value]
    * [attribute*=value]
    * [attribute|=value]    
    * [attribute^=value]
    * [attribute$=value]
* nesting operators: >, +, ~
* pseudo classes:
    * :has
    * :not
    * :first-child
    * :last-child
    * :only-child
    * :nth-child
    * :nth-last-child


## Usage with node.js

Simply require the library and use it in your code the same way you would use it in the browser. The main difference is that since node.js has no DOM, there is no support for rendering patches. You can manipulate the virtual DOM and retrieve the changed document using **virtualQuery.html()**. You can load a document using **$.load(HTMLString)**.

**vQuery.update()** Will return the patch computed from diffing the old vs. the new virtual DOM after you made some changes.


# TODO

* Implement more API methods
* Improve selectorEngine
* Create proper unit tests
* Make the library able to handle external DOM changes (right now, if anything other than vQuery manipulates the real DOM, it might break DOM patching)
* Improve diff + patch


# Licence

**MIT License**

Copyright (c) 2016 Michael Klein

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
