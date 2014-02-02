---
layout: project_entry
title: Userbound
description: Multi-user web browser concept. Users chat with other animated users on the same page. Clicking a link makes your character jump up into the link.
---
### Concept and Team
<div class='ub-character'><img alt="The Character" src="/images/userbound-character.png"/></div>
In the Spring of 2010, I thought up an interesting concept for a web browser. What if there was a web browser where everyone using that web browser was represented as a character on the page being viewed. Further, when characters clicked on links, the characters would actually jump up into the links.

My brother, [Holden](https://github.com/hs89), and I made the first prototype at the 2011 NYC Disrupt Hackthon and continued to work on the concept for several months after that. Holden worked to build a back-end API, while I built the front-end web-application. We also recruited an old friend, Michael Ryterband, to help us create the character for the project.

### User Interface
Imagine you are traveling through the Internet as an animated character. Your character can  move around the screen using the arrow keys.  If someone else arrives on the same page as you, you can see and chat with their character.  Clicking a link causes your character to jump up and into the link.  The portal system allows you and others to create un-solicited two way links between sites.

<a href="/images/userbound-shot-a.png"><img alt="Userbound Interface" src="/images/userbound-shot-a-thumb.jpg" /></a>

<a href="/images/userbound-shot-b.png"><img alt="Link Jump in the Userbound Interface" src="/images/userbound-shot-b-thumb.jpg" /></a>

<a href="/images/userbound-shot-c.png"><img alt="Chatting with Another User in the Userbound Interface" src="/images/userbound-shot-c-thumb.jpg" /></a>



### Technical Details
We used a JS stack.  Holden used Node.JS for the server with Redis as the back-end.  Socket.IO was used for communication between the server and client.  For the front-end application, I used Require.JS, Raphael.JS, Socket.IO, and JQuery. Require.JS allowed me to separate different functionality / pieces of the application into modules. I used Raphel.JS to animate the characters' movement.

I needed a way to allow natural transitioning between page to page for 'site jumps'. From the start I knew that cross-domain issues would be a problem. I was trying to build a browser inside a browser. An iframe was a start, but I needed a way to detect activity *within* the iframe as well (i.e. to determine when a user clicked a link) to show user-jumps between other clients.  Being built as a web-app, my solution to cross-domain issues was [YQL](http://developer.yahoo.com/yql/). YQL is a service provided by Yahoo which lets you query hosts with SQL-like syntax. I made an Open Data Table to pass through whatever content YQL fetched - giving me the HTML to inject back into the iframe. Complications ensued. What about stylesheets, javascript, and site resources. I crafted up some regex to handle edge-cases.  YQL ultimately turned out to be a less-than-ideal solution. I made the mistake of building a browser within a browser. As effect, the only way to get around cross-domain issues was a proxy server. 

### Future of Userbound?
My brother and I put in a lot of free time building the concept out. It was a great learning experience figuring out the technical implementation. I wound up learning a great deal about Javascript, modularity (working with Require.JS), Geometry (SVG spec and Raphael.JS), and overall how to manage a larger-sized codebase.  We managed the whole thing on SVN and had over 300 commits pushed total in the end.  There are a million and a half thing I would have done differently in making it if I knew then what I know now. So goes the learning process. 

We thought about launching a Userbound Beta, however decided against it.. as the way the front-end was done, it would not scale. Alas, YQL as a proxy method was buggy and it was ultimately a mistake to build a browser within a browser.  I did however use the name Userbound for this site itself.. in memory of Userbound.
