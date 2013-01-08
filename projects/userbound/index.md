---
layout: project_entry
title: Userbound
description: A multi-user web browser concept in which each user is a character. You can chat with other users on the same page as you. Clicking on a link makes your character jump up and into the link.
---
### The Concept and Team
<div style="float: right; padding: 20px"><img src="/images/userbound-character.png"/></div>
In Spring of 2010 I thought up an intresting concept for a web browser. What if there was a web browser where everyone using that web browser was represented as a character on the page being viewed. Further, when you clicked on a link your character would actually jump up and into the link.

So I called up my brother, [Holden](https://github.com/hs89), and told him about my idea. He was also intrested in the idea so we decided we'd persue it together. We made the first prototype at the 2011 NYC Disrupt Hackthon and continued to work on it for many months after that. All throughout, Holden worked to build a back-end API, while I built the front-end web-application. Also at some point we brought in an old friend, Michael Ryterband, to help us create the character for the project.

<hr class="dotted" />

### The User Interface
Below are some screenshot of the user interface for Userbound. Basically you are an animated character within the Internet! The best way to get a feel for it is to try it yourself.

Once logged in, you are thrown onto the Internet as a character. You can move around using you arrow keys.  If you click on a link you're character actually jumps up and into the link. Also if someone else comes to the same page as you you can chat with them. If they click on a link you can see them jump into it and visa versa.

*The basic user interface:*
<a href="/images/userbound-shot-a.png"><img src="/images/userbound-shot-a-thumb.jpg" /></a>

*Jumping into a link:*
<a href="/images/userbound-shot-b.png"><img src="/images/userbound-shot-b-thumb.jpg" /></a>

*Chatting with another user:*
<a href="/images/userbound-shot-c.png"><img src="/images/userbound-shot-c-thumb.jpg" /></a>

There is also a minimal friends system so that you can chat with friends on different pages and teleport to friends' locations. Additionally we have a portal system (can be seen in first screenshot) which allows you to create two way links between sites within Userbound.

<hr class="dotted" />

### Technical Details
On the back-end Holden did used Node.JS. Socket.IO was used for communication with the client and Redis was used for our database.  

For the web application I used Require.JS, Raphael.JS, Socket.IO, and JQuery. Require.JS allowed me to seperate different functionality / pieces of the application into modules. Raphel.JS was used for the characters animation and movement. And of course JQuery was used for user-interaction.

The way I actually got the content into the page to allow for transitioning from page to page (sitejumps) was intresting. From the start I knew that Cross-Domain Security would be a problem. Basically what I needed was a way to inject some Javascript into the loaded iFrame in order to determine when a user clicked a link (so that other clients could see the character jump in).

My solution to the Cross-Domain issue was [YQL](http://develop.yahoo.com/yql). YQL is a service provided by Yahoo which lets you query the Internet with SQL-like syntax. I made an Open Data Table to just pass through whatever content YQL fetched - thus giving me the HTML to inject back into the iFrame. However, complications ensued. What about stylesheets, javascript, and site resouces. I wipped up some regex to handle this. It didn't work 100% of the time but it was pretty damn good.

YQL as a solution was less than ideal but it was functional. Further the only other way to get around the Cross-Domain issue would be a proxy server, but essentially that was what YQL was already doing for us. So why bother?

<hr class="dotted" />

### The Future of Userbound?
My brother and I spent over half a year working on Userbound in free time. It was an incredibly intresting idea and we both learned a ton implementing it. I wound up learning a great deal about Javascript, modularity (working with Require.JS), Geometry (SVG spec and Raphael.JS), and overall how to manage a large scale project.  We managed the whole thing on SVN and had over 300 commits total by the end.  There are a million a a half thing I would have done differently in making it if I knew then what I know now. But then again, is that not the learning process? 

We thought about maybe launching a Userbound Beta, however we decided against it as the way it was set up would not scale. Also it was buggy with quite a few sites due to the YQL piping method I used.

I did wind up using the name Userbound for this site itself in memory of Userbound.
