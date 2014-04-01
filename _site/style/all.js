// FancyZoom.js - v1.1 - http://www.fancyzoom.com
//
// Copyright (c) 2008 Cabel Sasser / Panic Inc
// All rights reserved.
// 
//     Requires: FancyZoomHTML.js
// Instructions: Include JS files in page, call setupZoom() in onLoad. That's it!
//               Any <a href> links to images will be updated to zoom inline.
//               Add rel="nozoom" to your <a href> to disable zooming for an image.
// 
// Redistribution and use of this effect in source form, with or without modification,
// are permitted provided that the following conditions are met:
// 
// * USE OF SOURCE ON COMMERCIAL (FOR-PROFIT) WEBSITE REQUIRES ONE-TIME LICENSE FEE PER DOMAIN.
//   Reasonably priced! Visit www.fancyzoom.com for licensing instructions. Thanks!
//
// * Non-commercial (personal) website use is permitted without license/payment!
//
// * Redistribution of source code must retain the above copyright notice,
//   this list of conditions and the following disclaimer.
//
// * Redistribution of source code and derived works cannot be sold without specific
//   written prior permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
// EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
// PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
// LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
// SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

var includeCaption = true; // Turn on the "caption" feature, and write out the caption HTML
var zoomTime       = 5;    // Milliseconds between frames of zoom animation
var zoomSteps      = 15;   // Number of zoom animation frames
var includeFade    = 1;    // Set to 1 to fade the image in / out as it zooms
var minBorder      = 90;   // Amount of padding between large, scaled down images, and the window edges
var shadowSettings = '0px 5px 25px rgba(0, 0, 0, '; // Blur, radius, color of shadow for compatible browsers

var zoomImagesURI   = '/images-global/zoom/'; // Location of the zoom and shadow images

// Init. Do not add anything below this line, unless it's something awesome.

var myWidth = 0, myHeight = 0, myScroll = 0; myScrollWidth = 0; myScrollHeight = 0;
var zoomOpen = false, preloadFrame = 1, preloadActive = false, preloadTime = 0, imgPreload = new Image();
var preloadAnimTimer = 0;

var zoomActive = new Array(); var zoomTimer  = new Array(); 
var zoomOrigW  = new Array(); var zoomOrigH  = new Array();
var zoomOrigX  = new Array(); var zoomOrigY  = new Array();

var zoomID         = "ZoomBox";
var theID          = "ZoomImage";
var zoomCaption    = "ZoomCaption";
var zoomCaptionDiv = "ZoomCapDiv";

if (navigator.userAgent.indexOf("MSIE") != -1) {
	var browserIsIE = true;
}

// Zoom: Setup The Page! Called in your <body>'s onLoad handler.

function setupZoom() {
	prepZooms();
	insertZoomHTML();
	zoomdiv = document.getElementById(zoomID);  
	zoomimg = document.getElementById(theID);
}

// Zoom: Inject Javascript functions into hrefs pointing to images, one by one!
// Skip any href that contains a rel="nozoom" tag.
// This is done at page load time via an onLoad() handler.

function prepZooms() {
	if (! document.getElementsByTagName) {
		return;
	}
	var links = document.getElementsByTagName("a");
	for (i = 0; i < links.length; i++) {
		if (links[i].getAttribute("href")) {
			if (links[i].getAttribute("href").search(/(.*)\.(jpg|jpeg|gif|png|bmp|tif|tiff)/gi) != -1) {
				if (links[i].getAttribute("rel") != "nozoom") {
					links[i].onclick = function (event) { return zoomClick(this, event); };
					links[i].onmouseover = function () { zoomPreload(this); };
				}
			}
		}
	}
}

// Zoom: Load an image into an image object. When done loading, function sets preloadActive to false,
// so other bits know that they can proceed with the zoom.
// Preloaded image is stored in imgPreload and swapped out in the zoom function.

function zoomPreload(from) {

	var theimage = from.getAttribute("href");

	// Only preload if we have to, i.e. the image isn't this image already

	if (imgPreload.src.indexOf(from.getAttribute("href").substr(from.getAttribute("href").lastIndexOf("/"))) == -1) {
		preloadActive = true;
		imgPreload = new Image();

		// Set a function to fire when the preload is complete, setting flags along the way.

		imgPreload.onload = function() {
			preloadActive = false;
		}

		// Load it!
		imgPreload.src = theimage;
	}
}

// Zoom: Start the preloading animation cycle.

function preloadAnimStart() {
	preloadTime = new Date();
	document.getElementById("ZoomSpin").style.left = (myWidth / 2) + 'px';
	document.getElementById("ZoomSpin").style.top = ((myHeight / 2) + myScroll) + 'px';
	document.getElementById("ZoomSpin").style.visibility = "visible";	
	preloadFrame = 1;
	document.getElementById("SpinImage").src = zoomImagesURI+'zoom-spin-'+preloadFrame+'.png';  
	preloadAnimTimer = setInterval("preloadAnim()", 100);
}

// Zoom: Display and ANIMATE the jibber-jabber widget. Once preloadActive is false, bail and zoom it up!

function preloadAnim(from) {
	if (preloadActive != false) {
		document.getElementById("SpinImage").src = zoomImagesURI+'zoom-spin-'+preloadFrame+'.png';
		preloadFrame++;
		if (preloadFrame > 12) preloadFrame = 1;
	} else {
		document.getElementById("ZoomSpin").style.visibility = "hidden";    
		clearInterval(preloadAnimTimer);
		preloadAnimTimer = 0;
		zoomIn(preloadFrom);
	}
}

// ZOOM CLICK: We got a click! Should we do the zoom? Or wait for the preload to complete?
// todo?: Double check that imgPreload src = clicked src

function zoomClick(from, evt) {

	var shift = getShift(evt);

	// Check for Command / Alt key. If pressed, pass them through -- don't zoom!
	if (! evt && window.event && (window.event.metaKey || window.event.altKey)) {
		return true;
	} else if (evt && (evt.metaKey|| evt.altKey)) {
		return true;
	}

	// Get browser dimensions
	getSize();

	// If preloading still, wait, and display the spinner.
	if (preloadActive == true) {
		// But only display the spinner if it's not already being displayed!
		if (preloadAnimTimer == 0) {
			preloadFrom = from;
			preloadAnimStart();	
		}
	} else {
		// Otherwise, we're loaded: do the zoom!
		zoomIn(from, shift);
	}
	
	return false;
	
}

// Zoom: Move an element in to endH endW, using zoomHost as a starting point.
// "from" is an object reference to the href that spawned the zoom.

function zoomIn(from, shift) {

	zoomimg.src = from.getAttribute("href");

	// Determine the zoom settings from where we came from, the element in the <a>.
	// If there's no element in the <a>, or we can't get the width, make stuff up

	if (from.childNodes[0].width) {
		startW = from.childNodes[0].width;
		startH = from.childNodes[0].height;
		startPos = findElementPos(from.childNodes[0]);
	} else {
		startW = 50;
		startH = 12;
		startPos = findElementPos(from);
	}

	hostX = startPos[0];
	hostY = startPos[1];

	// Make up for a scrolled containing div.
	// TODO: This HAS to move into findElementPos.
	
	if (document.getElementById('scroller')) {
		hostX = hostX - document.getElementById('scroller').scrollLeft;
	}

	// Determine the target zoom settings from the preloaded image object

	endW = imgPreload.width;
	endH = imgPreload.height;

	// Start! But only if we're not zooming already!

	if (zoomActive[theID] != true) {

		// Clear everything out just in case something is already open

		if (document.getElementById("ShadowBox")) {
			document.getElementById("ShadowBox").style.visibility = "hidden";
		} else if (! browserIsIE) {
		
			// Wipe timer if shadow is fading in still
			if (fadeActive["ZoomImage"]) {
				clearInterval(fadeTimer["ZoomImage"]);
				fadeActive["ZoomImage"] = false;
				fadeTimer["ZoomImage"] = false;			
			}
			
			document.getElementById("ZoomImage").style.webkitBoxShadow = shadowSettings + '0.0)';			
		}
		
		document.getElementById("ZoomClose").style.visibility = "hidden";     

		// Setup the CAPTION, if existing. Hide it first, set the text.

		if (includeCaption) {
			document.getElementById(zoomCaptionDiv).style.visibility = "hidden";
			if (from.getAttribute('title') && includeCaption) {
				// Yes, there's a caption, set it up
				document.getElementById(zoomCaption).innerHTML = from.getAttribute('title');
			} else {
				document.getElementById(zoomCaption).innerHTML = "";
			}
		}

		// Store original position in an array for future zoomOut.

		zoomOrigW[theID] = startW;
		zoomOrigH[theID] = startH;
		zoomOrigX[theID] = hostX;
		zoomOrigY[theID] = hostY;

		// Now set the starting dimensions

		zoomimg.style.width = startW + 'px';
		zoomimg.style.height = startH + 'px';
		zoomdiv.style.left = hostX + 'px';
		zoomdiv.style.top = hostY + 'px';

		// Show the zooming image container, make it invisible

		if (includeFade == 1) {
			setOpacity(0, zoomID);
		}
		zoomdiv.style.visibility = "visible";

		// If it's too big to fit in the window, shrink the width and height to fit (with ratio).

		sizeRatio = endW / endH;
		if (endW > myWidth - minBorder) {
			endW = myWidth - minBorder;
			endH = endW / sizeRatio;
		}
		if (endH > myHeight - minBorder) {
			endH = myHeight - minBorder;
			endW = endH * sizeRatio;
		}

		zoomChangeX = ((myWidth / 2) - (endW / 2) - hostX);
		zoomChangeY = (((myHeight / 2) - (endH / 2) - hostY) + myScroll);
		zoomChangeW = (endW - startW);
		zoomChangeH = (endH - startH);
		
		// Shift key?
	
		if (shift) {
			tempSteps = zoomSteps * 7;
		} else {
			tempSteps = zoomSteps;
		}

		// Setup Zoom

		zoomCurrent = 0;

		// Setup Fade with Zoom, If Requested

		if (includeFade == 1) {
			fadeCurrent = 0;
			fadeAmount = (0 - 100) / tempSteps;
		} else {
			fadeAmount = 0;
		}

		// Do It!
		
		zoomTimer[theID] = setInterval("zoomElement('"+zoomID+"', '"+theID+"', "+zoomCurrent+", "+startW+", "+zoomChangeW+", "+startH+", "+zoomChangeH+", "+hostX+", "+zoomChangeX+", "+hostY+", "+zoomChangeY+", "+tempSteps+", "+includeFade+", "+fadeAmount+", 'zoomDoneIn(zoomID)')", zoomTime);		
		zoomActive[theID] = true; 
	}
}

// Zoom it back out.

function zoomOut(from, evt) {

	// Get shift key status.
	// IE events don't seem to get passed through the function, so grab it from the window.

	if (getShift(evt)) {
		tempSteps = zoomSteps * 7;
	} else {
		tempSteps = zoomSteps;
	}	

	// Check to see if something is happening/open
  
	if (zoomActive[theID] != true) {

		// First, get rid of the shadow if necessary.

		if (document.getElementById("ShadowBox")) {
			document.getElementById("ShadowBox").style.visibility = "hidden";
		} else if (! browserIsIE) {
		
			// Wipe timer if shadow is fading in still
			if (fadeActive["ZoomImage"]) {
				clearInterval(fadeTimer["ZoomImage"]);
				fadeActive["ZoomImage"] = false;
				fadeTimer["ZoomImage"] = false;			
			}
			
			document.getElementById("ZoomImage").style.webkitBoxShadow = shadowSettings + '0.0)';			
		}

		// ..and the close box...

		document.getElementById("ZoomClose").style.visibility = "hidden";

		// ...and the caption if necessary!

		if (includeCaption && document.getElementById(zoomCaption).innerHTML != "") {
			// fadeElementSetup(zoomCaptionDiv, 100, 0, 5, 1);
			document.getElementById(zoomCaptionDiv).style.visibility = "hidden";
		}

		// Now, figure out where we came from, to get back there

		startX = parseInt(zoomdiv.style.left);
		startY = parseInt(zoomdiv.style.top);
		startW = zoomimg.width;
		startH = zoomimg.height;
		zoomChangeX = zoomOrigX[theID] - startX;
		zoomChangeY = zoomOrigY[theID] - startY;
		zoomChangeW = zoomOrigW[theID] - startW;
		zoomChangeH = zoomOrigH[theID] - startH;

		// Setup Zoom

		zoomCurrent = 0;

		// Setup Fade with Zoom, If Requested

		if (includeFade == 1) {
			fadeCurrent = 0;
			fadeAmount = (100 - 0) / tempSteps;
		} else {
			fadeAmount = 0;
		}

		// Do It!

		zoomTimer[theID] = setInterval("zoomElement('"+zoomID+"', '"+theID+"', "+zoomCurrent+", "+startW+", "+zoomChangeW+", "+startH+", "+zoomChangeH+", "+startX+", "+zoomChangeX+", "+startY+", "+zoomChangeY+", "+tempSteps+", "+includeFade+", "+fadeAmount+", 'zoomDone(zoomID, theID)')", zoomTime);	
		zoomActive[theID] = true;
	}
}

// Finished Zooming In

function zoomDoneIn(zoomdiv, theID) {

	// Note that it's open
  
	zoomOpen = true;
	zoomdiv = document.getElementById(zoomdiv);

	// Position the table shadow behind the zoomed in image, and display it

	if (document.getElementById("ShadowBox")) {

		setOpacity(0, "ShadowBox");
		shadowdiv = document.getElementById("ShadowBox");

		shadowLeft = parseInt(zoomdiv.style.left) - 13;
		shadowTop = parseInt(zoomdiv.style.top) - 8;
		shadowWidth = zoomdiv.offsetWidth + 26;
		shadowHeight = zoomdiv.offsetHeight + 26; 
	
		shadowdiv.style.width = shadowWidth + 'px';
		shadowdiv.style.height = shadowHeight + 'px';
		shadowdiv.style.left = shadowLeft + 'px';
		shadowdiv.style.top = shadowTop + 'px';

		document.getElementById("ShadowBox").style.visibility = "visible";
		fadeElementSetup("ShadowBox", 0, 100, 5);
		
	} else if (! browserIsIE) {
		// Or, do a fade of the modern shadow
		fadeElementSetup("ZoomImage", 0, .8, 5, 0, "shadow");
	}
	
	// Position and display the CAPTION, if existing
  
	if (includeCaption && document.getElementById(zoomCaption).innerHTML != "") {
		// setOpacity(0, zoomCaptionDiv);
		zoomcapd = document.getElementById(zoomCaptionDiv);
		zoomcapd.style.top = parseInt(zoomdiv.style.top) + (zoomdiv.offsetHeight + 15) + 'px';
		zoomcapd.style.left = (myWidth / 2) - (zoomcapd.offsetWidth / 2) + 'px';
		zoomcapd.style.visibility = "visible";
		// fadeElementSetup(zoomCaptionDiv, 0, 100, 5);
	}   
	
	// Display Close Box (fade it if it's not IE)

	if (!browserIsIE) setOpacity(0, "ZoomClose");
	document.getElementById("ZoomClose").style.visibility = "visible";
	if (!browserIsIE) fadeElementSetup("ZoomClose", 0, 100, 5);

	// Get keypresses
	document.onkeypress = getKey;
	
}

// Finished Zooming Out

function zoomDone(zoomdiv, theID) {

	// No longer open
  
	zoomOpen = false;

	// Clear stuff out, clean up

	zoomOrigH[theID] = "";
	zoomOrigW[theID] = "";
	document.getElementById(zoomdiv).style.visibility = "hidden";
	zoomActive[theID] == false;

	// Stop getting keypresses

	document.onkeypress = null;

}

// Actually zoom the element

function zoomElement(zoomdiv, theID, zoomCurrent, zoomStartW, zoomChangeW, zoomStartH, zoomChangeH, zoomStartX, zoomChangeX, zoomStartY, zoomChangeY, zoomSteps, includeFade, fadeAmount, execWhenDone) {

	// console.log("Zooming Step #"+zoomCurrent+ " of "+zoomSteps+" (zoom " + zoomStartW + "/" + zoomChangeW + ") (zoom " + zoomStartH + "/" + zoomChangeH + ")  (zoom " + zoomStartX + "/" + zoomChangeX + ")  (zoom " + zoomStartY + "/" + zoomChangeY + ") Fade: "+fadeAmount);
    
	// Test if we're done, or if we continue

	if (zoomCurrent == (zoomSteps + 1)) {
		zoomActive[theID] = false;
		clearInterval(zoomTimer[theID]);

		if (execWhenDone != "") {
			eval(execWhenDone);
		}
	} else {
	
		// Do the Fade!
	  
		if (includeFade == 1) {
			if (fadeAmount < 0) {
				setOpacity(Math.abs(zoomCurrent * fadeAmount), zoomdiv);
			} else {
				setOpacity(100 - (zoomCurrent * fadeAmount), zoomdiv);
			}
		}
	  
		// Calculate this step's difference, and move it!
		
		moveW = cubicInOut(zoomCurrent, zoomStartW, zoomChangeW, zoomSteps);
		moveH = cubicInOut(zoomCurrent, zoomStartH, zoomChangeH, zoomSteps);
		moveX = cubicInOut(zoomCurrent, zoomStartX, zoomChangeX, zoomSteps);
		moveY = cubicInOut(zoomCurrent, zoomStartY, zoomChangeY, zoomSteps);
	
		document.getElementById(zoomdiv).style.left = moveX + 'px';
		document.getElementById(zoomdiv).style.top = moveY + 'px';
		zoomimg.style.width = moveW + 'px';
		zoomimg.style.height = moveH + 'px';
	
		zoomCurrent++;
		
		clearInterval(zoomTimer[theID]);
		zoomTimer[theID] = setInterval("zoomElement('"+zoomdiv+"', '"+theID+"', "+zoomCurrent+", "+zoomStartW+", "+zoomChangeW+", "+zoomStartH+", "+zoomChangeH+", "+zoomStartX+", "+zoomChangeX+", "+zoomStartY+", "+zoomChangeY+", "+zoomSteps+", "+includeFade+", "+fadeAmount+", '"+execWhenDone+"')", zoomTime);
	}
}

// Zoom Utility: Get Key Press when image is open, and act accordingly

function getKey(evt) {
	if (! evt) {
		theKey = event.keyCode;
	} else {
		theKey = evt.keyCode;
	}

	if (theKey == 27) { // ESC
		zoomOut(this, evt);
	}
}

////////////////////////////
//
// FADE Functions
//

function fadeOut(elem) {
	if (elem.id) {
		fadeElementSetup(elem.id, 100, 0, 10);
	}
}

function fadeIn(elem) {
	if (elem.id) {
		fadeElementSetup(elem.id, 0, 100, 10);	
	}
}

// Fade: Initialize the fade function

var fadeActive = new Array();
var fadeQueue  = new Array();
var fadeTimer  = new Array();
var fadeClose  = new Array();
var fadeMode   = new Array();

function fadeElementSetup(theID, fdStart, fdEnd, fdSteps, fdClose, fdMode) {

	// alert("Fading: "+theID+" Steps: "+fdSteps+" Mode: "+fdMode);

	if (fadeActive[theID] == true) {
		// Already animating, queue up this command
		fadeQueue[theID] = new Array(theID, fdStart, fdEnd, fdSteps);
	} else {
		fadeSteps = fdSteps;
		fadeCurrent = 0;
		fadeAmount = (fdStart - fdEnd) / fadeSteps;
		fadeTimer[theID] = setInterval("fadeElement('"+theID+"', '"+fadeCurrent+"', '"+fadeAmount+"', '"+fadeSteps+"')", 15);
		fadeActive[theID] = true;
		fadeMode[theID] = fdMode;
		
		if (fdClose == 1) {
			fadeClose[theID] = true;
		} else {
			fadeClose[theID] = false;
		}
	}
}

// Fade: Do the fade. This function will call itself, modifying the parameters, so
// many instances can run concurrently. Can fade using opacity, or fade using a box-shadow.

function fadeElement(theID, fadeCurrent, fadeAmount, fadeSteps) {

	if (fadeCurrent == fadeSteps) {

		// We're done, so clear.

		clearInterval(fadeTimer[theID]);
		fadeActive[theID] = false;
		fadeTimer[theID] = false;

		// Should we close it once the fade is complete?

		if (fadeClose[theID] == true) {
			document.getElementById(theID).style.visibility = "hidden";
		}

		// Hang on.. did a command queue while we were working? If so, make it happen now

		if (fadeQueue[theID] && fadeQueue[theID] != false) {
			fadeElementSetup(fadeQueue[theID][0], fadeQueue[theID][1], fadeQueue[theID][2], fadeQueue[theID][3]);
			fadeQueue[theID] = false;
		}
	} else {

		fadeCurrent++;
		
		// Now actually do the fade adjustment.
		
		if (fadeMode[theID] == "shadow") {

			// Do a special fade on the webkit-box-shadow of the object
		
			if (fadeAmount < 0) {
				document.getElementById(theID).style.webkitBoxShadow = shadowSettings + (Math.abs(fadeCurrent * fadeAmount)) + ')';
			} else {
				document.getElementById(theID).style.webkitBoxShadow = shadowSettings + (100 - (fadeCurrent * fadeAmount)) + ')';
			}
			
		} else {
		
			// Set the opacity depending on if we're adding or subtracting (pos or neg)
			
			if (fadeAmount < 0) {
				setOpacity(Math.abs(fadeCurrent * fadeAmount), theID);
			} else {
				setOpacity(100 - (fadeCurrent * fadeAmount), theID);
			}
		}

		// Keep going, and send myself the updated variables
		clearInterval(fadeTimer[theID]);
		fadeTimer[theID] = setInterval("fadeElement('"+theID+"', '"+fadeCurrent+"', '"+fadeAmount+"', '"+fadeSteps+"')", 15);
	}
}

////////////////////////////
//
// UTILITY functions
//

// Utility: Set the opacity, compatible with a number of browsers. Value from 0 to 100.

function setOpacity(opacity, theID) {

	var object = document.getElementById(theID).style;

	// If it's 100, set it to 99 for Firefox.

	if (navigator.userAgent.indexOf("Firefox") != -1) {
		if (opacity == 100) { opacity = 99.9999; } // This is majorly awkward
	}

	// Multi-browser opacity setting

	object.filter = "alpha(opacity=" + opacity + ")"; // IE/Win
	object.opacity = (opacity / 100);                 // Safari 1.2, Firefox+Mozilla

}

// Utility: Math functions for animation calucations - From http://www.robertpenner.com/easing/
//
// t = time, b = begin, c = change, d = duration
// time = current frame, begin is fixed, change is basically finish - begin, duration is fixed (frames),

function linear(t, b, c, d)
{
	return c*t/d + b;
}

function sineInOut(t, b, c, d)
{
	return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
}

function cubicIn(t, b, c, d) {
	return c*(t/=d)*t*t + b;
}

function cubicOut(t, b, c, d) {
	return c*((t=t/d-1)*t*t + 1) + b;
}

function cubicInOut(t, b, c, d)
{
	if ((t/=d/2) < 1) return c/2*t*t*t + b;
	return c/2*((t-=2)*t*t + 2) + b;
}

function bounceOut(t, b, c, d)
{
	if ((t/=d) < (1/2.75)){
		return c*(7.5625*t*t) + b;
	} else if (t < (2/2.75)){
		return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
	} else if (t < (2.5/2.75)){
		return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
	} else {
		return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
	}
}


// Utility: Get the size of the window, and set myWidth and myHeight
// Credit to quirksmode.org

function getSize() {

	// Window Size

	if (self.innerHeight) { // Everyone but IE
		myWidth = window.innerWidth;
		myHeight = window.innerHeight;
		myScroll = window.pageYOffset;
	} else if (document.documentElement && document.documentElement.clientHeight) { // IE6 Strict
		myWidth = document.documentElement.clientWidth;
		myHeight = document.documentElement.clientHeight;
		myScroll = document.documentElement.scrollTop;
	} else if (document.body) { // Other IE, such as IE7
		myWidth = document.body.clientWidth;
		myHeight = document.body.clientHeight;
		myScroll = document.body.scrollTop;
	}

	// Page size w/offscreen areas

	if (window.innerHeight && window.scrollMaxY) {	
		myScrollWidth = document.body.scrollWidth;
		myScrollHeight = window.innerHeight + window.scrollMaxY;
	} else if (document.body.scrollHeight > document.body.offsetHeight) { // All but Explorer Mac
		myScrollWidth = document.body.scrollWidth;
		myScrollHeight = document.body.scrollHeight;
	} else { // Explorer Mac...would also work in Explorer 6 Strict, Mozilla and Safari
		myScrollWidth = document.body.offsetWidth;
		myScrollHeight = document.body.offsetHeight;
	}
}

// Utility: Get Shift Key Status
// IE events don't seem to get passed through the function, so grab it from the window.

function getShift(evt) {
	var shift = false;
	if (! evt && window.event) {
		shift = window.event.shiftKey;
	} else if (evt) {
		shift = evt.shiftKey;
		if (shift) evt.stopPropagation(); // Prevents Firefox from doing shifty things
	}
	return shift;
}

// Utility: Find the Y position of an element on a page. Return Y and X as an array

function findElementPos(elemFind)
{
	var elemX = 0;
	var elemY = 0;
	do {
		elemX += elemFind.offsetLeft;
		elemY += elemFind.offsetTop;
	} while ( elemFind = elemFind.offsetParent )

	return Array(elemX, elemY);
}
// FancyZoomHTML.js - v1.0
// Used to draw necessary HTML elements for FancyZoom
//
// Copyright (c) 2008 Cabel Sasser / Panic Inc
// All rights reserved.

function insertZoomHTML() {

	// All of this junk creates the three <div>'s used to hold the closebox, image, and zoom shadow.
	
	var inBody = document.getElementsByTagName("body").item(0);
	
	// WAIT SPINNER
	
	var inSpinbox = document.createElement("div");
	inSpinbox.setAttribute('id', 'ZoomSpin');
	inSpinbox.style.position = 'absolute';
	inSpinbox.style.left = '10px';
	inSpinbox.style.top = '10px';
	inSpinbox.style.visibility = 'hidden';
	inSpinbox.style.zIndex = '525';
	inBody.insertBefore(inSpinbox, inBody.firstChild);
	
	var inSpinImage = document.createElement("img");
	inSpinImage.setAttribute('id', 'SpinImage');
	inSpinImage.setAttribute('src', zoomImagesURI+'zoom-spin-1.png');
	inSpinbox.appendChild(inSpinImage);
	
	// ZOOM IMAGE
	//
	// <div id="ZoomBox">
	//   <a href="javascript:zoomOut();"><img src="/images/spacer.gif" id="ZoomImage" border="0"></a> <!-- THE IMAGE -->
	//   <div id="ZoomClose">
	//     <a href="javascript:zoomOut();"><img src="/images/closebox.png" width="30" height="30" border="0"></a>
	//   </div>
	// </div>
	
	var inZoombox = document.createElement("div");
	inZoombox.setAttribute('id', 'ZoomBox');
	
	inZoombox.style.position = 'absolute'; 
	inZoombox.style.left = '10px';
	inZoombox.style.top = '10px';
	inZoombox.style.visibility = 'hidden';
	inZoombox.style.zIndex = '499';
	
	inBody.insertBefore(inZoombox, inSpinbox.nextSibling);
	
	var inImage1 = document.createElement("img");
	inImage1.onclick = function (event) { zoomOut(this, event); return false; };	
	inImage1.setAttribute('src',zoomImagesURI+'spacer.gif');
	inImage1.setAttribute('id','ZoomImage');
	inImage1.setAttribute('border', '0');
	// inImage1.setAttribute('onMouseOver', 'zoomMouseOver();')
	// inImage1.setAttribute('onMouseOut', 'zoomMouseOut();')
	
	// This must be set first, so we can later test it using webkitBoxShadow.
	inImage1.setAttribute('style', '-webkit-box-shadow: '+shadowSettings+'0.0)');
	inImage1.style.display = 'block';
	inImage1.style.width = '10px';
	inImage1.style.height = '10px';
	inImage1.style.cursor = 'pointer'; // -webkit-zoom-out?
	inZoombox.appendChild(inImage1);

	var inClosebox = document.createElement("div");
	inClosebox.setAttribute('id', 'ZoomClose');
	inClosebox.style.position = 'absolute';
	
	// In MSIE, we need to put the close box inside the image.
	// It's 2008 and I'm having to do a browser detect? Sigh.
	if (browserIsIE) {
		inClosebox.style.left = '-1px';
		inClosebox.style.top = '0px';	
	} else {
		inClosebox.style.left = '-15px';
		inClosebox.style.top = '-15px';
	}
	
	inClosebox.style.visibility = 'hidden';
	inZoombox.appendChild(inClosebox);
		
	var inImage2 = document.createElement("img");
	inImage2.onclick = function (event) { zoomOut(this, event); return false; };	
	inImage2.setAttribute('src',zoomImagesURI+'closebox.png');		
	inImage2.setAttribute('width','30');
	inImage2.setAttribute('height','30');
	inImage2.setAttribute('border','0');
	inImage2.style.cursor = 'pointer';		
	inClosebox.appendChild(inImage2);
	
	// SHADOW
	// Only draw the table-based shadow if the programatic webkitBoxShadow fails!
	// Also, don't draw it if we're IE -- it wouldn't look quite right anyway.
	
	if (! document.getElementById('ZoomImage').style.webkitBoxShadow && ! browserIsIE) {

		// SHADOW BASE
		
		var inFixedBox = document.createElement("div");
		inFixedBox.setAttribute('id', 'ShadowBox');
		inFixedBox.style.position = 'absolute'; 
		inFixedBox.style.left = '50px';
		inFixedBox.style.top = '50px';
		inFixedBox.style.width = '100px';
		inFixedBox.style.height = '100px';
		inFixedBox.style.visibility = 'hidden';
		inFixedBox.style.zIndex = '498';
		inBody.insertBefore(inFixedBox, inZoombox.nextSibling);	
	
		// SHADOW
		// Now, the shadow table. Skip if not compatible, or irrevelant with -box-shadow.
		
		// <div id="ShadowBox"><table border="0" width="100%" height="100%" cellpadding="0" cellspacing="0"> X
		//   <tr height="25">
		//   <td width="27"><img src="/images/zoom-shadow1.png" width="27" height="25"></td>
		//   <td background="/images/zoom-shadow2.png">&nbsp;</td>
		//   <td width="27"><img src="/images/zoom-shadow3.png" width="27" height="25"></td>
		//   </tr>
		
		var inShadowTable = document.createElement("table");
		inShadowTable.setAttribute('border', '0');
		inShadowTable.setAttribute('width', '100%');
		inShadowTable.setAttribute('height', '100%');
		inShadowTable.setAttribute('cellpadding', '0');
		inShadowTable.setAttribute('cellspacing', '0');
		inFixedBox.appendChild(inShadowTable);

		var inShadowTbody = document.createElement("tbody");	// Needed for IE (for HTML4).
		inShadowTable.appendChild(inShadowTbody);
		
		var inRow1 = document.createElement("tr");
		inRow1.style.height = '25px';
		inShadowTbody.appendChild(inRow1);
		
		var inCol1 = document.createElement("td");
		inCol1.style.width = '27px';
		inRow1.appendChild(inCol1);  
		var inShadowImg1 = document.createElement("img");
		inShadowImg1.setAttribute('src', zoomImagesURI+'zoom-shadow1.png');
		inShadowImg1.setAttribute('width', '27');
		inShadowImg1.setAttribute('height', '25');
		inShadowImg1.style.display = 'block';
		inCol1.appendChild(inShadowImg1);
		
		var inCol2 = document.createElement("td");
		inCol2.setAttribute('background', zoomImagesURI+'zoom-shadow2.png');
		inRow1.appendChild(inCol2);
		// inCol2.innerHTML = '<img src=';
		var inSpacer1 = document.createElement("img");
		inSpacer1.setAttribute('src',zoomImagesURI+'spacer.gif');
		inSpacer1.setAttribute('height', '1');
		inSpacer1.setAttribute('width', '1');
		inSpacer1.style.display = 'block';
		inCol2.appendChild(inSpacer1);
		
		var inCol3 = document.createElement("td");
		inCol3.style.width = '27px';
		inRow1.appendChild(inCol3);  
		var inShadowImg3 = document.createElement("img");
		inShadowImg3.setAttribute('src', zoomImagesURI+'zoom-shadow3.png');
		inShadowImg3.setAttribute('width', '27');
		inShadowImg3.setAttribute('height', '25');
		inShadowImg3.style.display = 'block';
		inCol3.appendChild(inShadowImg3);
		
		//   <tr>
		//   <td background="/images/zoom-shadow4.png">&nbsp;</td>
		//   <td bgcolor="#ffffff">&nbsp;</td>
		//   <td background="/images/zoom-shadow5.png">&nbsp;</td>
		//   </tr>
		
		inRow2 = document.createElement("tr");
		inShadowTbody.appendChild(inRow2);
		
		var inCol4 = document.createElement("td");
		inCol4.setAttribute('background', zoomImagesURI+'zoom-shadow4.png');
		inRow2.appendChild(inCol4);
		// inCol4.innerHTML = '&nbsp;';
		var inSpacer2 = document.createElement("img");
		inSpacer2.setAttribute('src',zoomImagesURI+'spacer.gif');
		inSpacer2.setAttribute('height', '1');
		inSpacer2.setAttribute('width', '1');
		inSpacer2.style.display = 'block';
		inCol4.appendChild(inSpacer2);
		
		var inCol5 = document.createElement("td");
		inCol5.setAttribute('bgcolor', '#ffffff');
		inRow2.appendChild(inCol5);
		// inCol5.innerHTML = '&nbsp;';
		var inSpacer3 = document.createElement("img");
		inSpacer3.setAttribute('src',zoomImagesURI+'spacer.gif');
		inSpacer3.setAttribute('height', '1');
		inSpacer3.setAttribute('width', '1');
		inSpacer3.style.display = 'block';
		inCol5.appendChild(inSpacer3);
		
		var inCol6 = document.createElement("td");
		inCol6.setAttribute('background', zoomImagesURI+'zoom-shadow5.png');
		inRow2.appendChild(inCol6);
		// inCol6.innerHTML = '&nbsp;';
		var inSpacer4 = document.createElement("img");
		inSpacer4.setAttribute('src',zoomImagesURI+'spacer.gif');
		inSpacer4.setAttribute('height', '1');
		inSpacer4.setAttribute('width', '1');
		inSpacer4.style.display = 'block';
		inCol6.appendChild(inSpacer4);
		
		//   <tr height="26">
		//   <td width="27"><img src="/images/zoom-shadow6.png" width="27" height="26"</td>
		//   <td background="/images/zoom-shadow7.png">&nbsp;</td>
		//   <td width="27"><img src="/images/zoom-shadow8.png" width="27" height="26"></td>
		//   </tr>  
		// </table>
		
		var inRow3 = document.createElement("tr");
		inRow3.style.height = '26px';
		inShadowTbody.appendChild(inRow3);
		
		var inCol7 = document.createElement("td");
		inCol7.style.width = '27px';
		inRow3.appendChild(inCol7);
		var inShadowImg7 = document.createElement("img");
		inShadowImg7.setAttribute('src', zoomImagesURI+'zoom-shadow6.png');
		inShadowImg7.setAttribute('width', '27');
		inShadowImg7.setAttribute('height', '26');
		inShadowImg7.style.display = 'block';
		inCol7.appendChild(inShadowImg7);
		
		var inCol8 = document.createElement("td");
		inCol8.setAttribute('background', zoomImagesURI+'zoom-shadow7.png');
		inRow3.appendChild(inCol8);  
		// inCol8.innerHTML = '&nbsp;';
		var inSpacer5 = document.createElement("img");
		inSpacer5.setAttribute('src',zoomImagesURI+'spacer.gif');
		inSpacer5.setAttribute('height', '1');
		inSpacer5.setAttribute('width', '1');
		inSpacer5.style.display = 'block';
		inCol8.appendChild(inSpacer5);
		
		var inCol9 = document.createElement("td");
		inCol9.style.width = '27px';
		inRow3.appendChild(inCol9);  
		var inShadowImg9 = document.createElement("img");
		inShadowImg9.setAttribute('src', zoomImagesURI+'zoom-shadow8.png');
		inShadowImg9.setAttribute('width', '27');
		inShadowImg9.setAttribute('height', '26');
		inShadowImg9.style.display = 'block';
		inCol9.appendChild(inShadowImg9);
	}

	if (includeCaption) {
	
		// CAPTION
		//
		// <div id="ZoomCapDiv" style="margin-left: 13px; margin-right: 13px;">
		// <table border="1" cellpadding="0" cellspacing="0">
		// <tr height="26">
		// <td><img src="zoom-caption-l.png" width="13" height="26"></td>
		// <td rowspan="3" background="zoom-caption-fill.png"><div id="ZoomCaption"></div></td>
		// <td><img src="zoom-caption-r.png" width="13" height="26"></td>
		// </tr>
		// </table>
		// </div>
		
		var inCapDiv = document.createElement("div");
		inCapDiv.setAttribute('id', 'ZoomCapDiv');
		inCapDiv.style.position = 'absolute'; 		
		inCapDiv.style.visibility = 'hidden';
		inCapDiv.style.marginLeft = 'auto';
		inCapDiv.style.marginRight = 'auto';
		inCapDiv.style.zIndex = '501';

		inBody.insertBefore(inCapDiv, inZoombox.nextSibling);
		
		var inCapTable = document.createElement("table");
		inCapTable.setAttribute('border', '0');
		inCapTable.setAttribute('cellPadding', '0');	// Wow. These honestly need to
		inCapTable.setAttribute('cellSpacing', '0');	// be intercapped to work in IE. WTF?
		inCapDiv.appendChild(inCapTable);
		
		var inTbody = document.createElement("tbody");	// Needed for IE (for HTML4).
		inCapTable.appendChild(inTbody);
		
		var inCapRow1 = document.createElement("tr");
		inTbody.appendChild(inCapRow1);
		
		var inCapCol1 = document.createElement("td");
		inCapCol1.setAttribute('align', 'right');
		inCapRow1.appendChild(inCapCol1);
		var inCapImg1 = document.createElement("img");
		inCapImg1.setAttribute('src', zoomImagesURI+'zoom-caption-l.png');
		inCapImg1.setAttribute('width', '13');
		inCapImg1.setAttribute('height', '26');
		inCapImg1.style.display = 'block';
		inCapCol1.appendChild(inCapImg1);
		
		var inCapCol2 = document.createElement("td");
		inCapCol2.setAttribute('background', zoomImagesURI+'zoom-caption-fill.png');
		inCapCol2.setAttribute('id', 'ZoomCaption');
		inCapCol2.setAttribute('valign', 'middle');
		inCapCol2.style.fontSize = '14px';
		inCapCol2.style.fontFamily = 'Helvetica';
		inCapCol2.style.fontWeight = 'bold';
		inCapCol2.style.color = '#ffffff';
		inCapCol2.style.textShadow = '0px 2px 4px #000000';
		inCapCol2.style.whiteSpace = 'nowrap';
		inCapRow1.appendChild(inCapCol2);
		
		var inCapCol3 = document.createElement("td");
		inCapRow1.appendChild(inCapCol3);
		var inCapImg2 = document.createElement("img");
		inCapImg2.setAttribute('src', zoomImagesURI+'zoom-caption-r.png');
		inCapImg2.setAttribute('width', '13');
		inCapImg2.setAttribute('height', '26');
		inCapImg2.style.display = 'block';
		inCapCol3.appendChild(inCapImg2);
	}
}
/*
SHJS - Syntax Highlighting in JavaScript
Copyright (C) 2007, 2008 gnombat@users.sourceforge.net
License: http://shjs.sourceforge.net/doc/gplv3.html
*/

if (! this.sh_languages) {
  this.sh_languages = {};
}
var sh_requests = {};

function sh_isEmailAddress(url) {
  if (/^mailto:/.test(url)) {
    return false;
  }
  return url.indexOf('@') !== -1;
}

function sh_setHref(tags, numTags, inputString) {
  var url = inputString.substring(tags[numTags - 2].pos, tags[numTags - 1].pos);
  if (url.length >= 2 && url.charAt(0) === '<' && url.charAt(url.length - 1) === '>') {
    url = url.substr(1, url.length - 2);
  }
  if (sh_isEmailAddress(url)) {
    url = 'mailto:' + url;
  }
  tags[numTags - 2].node.href = url;
}

/*
Konqueror has a bug where the regular expression /$/g will not match at the end
of a line more than once:

  var regex = /$/g;
  var match;

  var line = '1234567890';
  regex.lastIndex = 10;
  match = regex.exec(line);

  var line2 = 'abcde';
  regex.lastIndex = 5;
  match = regex.exec(line2);  // fails
*/
function sh_konquerorExec(s) {
  var result = [''];
  result.index = s.length;
  result.input = s;
  return result;
}

/**
Highlights all elements containing source code in a text string.  The return
value is an array of objects, each representing an HTML start or end tag.  Each
object has a property named pos, which is an integer representing the text
offset of the tag. Every start tag also has a property named node, which is the
DOM element started by the tag. End tags do not have this property.
@param  inputString  a text string
@param  language  a language definition object
@return  an array of tag objects
*/
function sh_highlightString(inputString, language) {
  if (/Konqueror/.test(navigator.userAgent)) {
    if (! language.konquered) {
      for (var s = 0; s < language.length; s++) {
        for (var p = 0; p < language[s].length; p++) {
          var r = language[s][p][0];
          if (r.source === '$') {
            r.exec = sh_konquerorExec;
          }
        }
      }
      language.konquered = true;
    }
  }

  var a = document.createElement('a');
  var span = document.createElement('span');

  // the result
  var tags = [];
  var numTags = 0;

  // each element is a pattern object from language
  var patternStack = [];

  // the current position within inputString
  var pos = 0;

  // the name of the current style, or null if there is no current style
  var currentStyle = null;

  var output = function(s, style) {
    var length = s.length;
    // this is more than just an optimization - we don't want to output empty <span></span> elements
    if (length === 0) {
      return;
    }
    if (! style) {
      var stackLength = patternStack.length;
      if (stackLength !== 0) {
        var pattern = patternStack[stackLength - 1];
        // check whether this is a state or an environment
        if (! pattern[3]) {
          // it's not a state - it's an environment; use the style for this environment
          style = pattern[1];
        }
      }
    }
    if (currentStyle !== style) {
      if (currentStyle) {
        tags[numTags++] = {pos: pos};
        if (currentStyle === 'sh_url') {
          sh_setHref(tags, numTags, inputString);
        }
      }
      if (style) {
        var clone;
        if (style === 'sh_url') {
          clone = a.cloneNode(false);
        }
        else {
          clone = span.cloneNode(false);
        }
        clone.className = style;
        tags[numTags++] = {node: clone, pos: pos};
      }
    }
    pos += length;
    currentStyle = style;
  };

  var endOfLinePattern = /\r\n|\r|\n/g;
  endOfLinePattern.lastIndex = 0;
  var inputStringLength = inputString.length;
  while (pos < inputStringLength) {
    var start = pos;
    var end;
    var startOfNextLine;
    var endOfLineMatch = endOfLinePattern.exec(inputString);
    if (endOfLineMatch === null) {
      end = inputStringLength;
      startOfNextLine = inputStringLength;
    }
    else {
      end = endOfLineMatch.index;
      startOfNextLine = endOfLinePattern.lastIndex;
    }

    var line = inputString.substring(start, end);

    var matchCache = [];
    for (;;) {
      var posWithinLine = pos - start;

      var stateIndex;
      var stackLength = patternStack.length;
      if (stackLength === 0) {
        stateIndex = 0;
      }
      else {
        // get the next state
        stateIndex = patternStack[stackLength - 1][2];
      }

      var state = language[stateIndex];
      var numPatterns = state.length;
      var mc = matchCache[stateIndex];
      if (! mc) {
        mc = matchCache[stateIndex] = [];
      }
      var bestMatch = null;
      var bestPatternIndex = -1;
      for (var i = 0; i < numPatterns; i++) {
        var match;
        if (i < mc.length && (mc[i] === null || posWithinLine <= mc[i].index)) {
          match = mc[i];
        }
        else {
          var regex = state[i][0];
          regex.lastIndex = posWithinLine;
          match = regex.exec(line);
          mc[i] = match;
        }
        if (match !== null && (bestMatch === null || match.index < bestMatch.index)) {
          bestMatch = match;
          bestPatternIndex = i;
          if (match.index === posWithinLine) {
            break;
          }
        }
      }

      if (bestMatch === null) {
        output(line.substring(posWithinLine), null);
        break;
      }
      else {
        // got a match
        if (bestMatch.index > posWithinLine) {
          output(line.substring(posWithinLine, bestMatch.index), null);
        }

        var pattern = state[bestPatternIndex];

        var newStyle = pattern[1];
        var matchedString;
        if (newStyle instanceof Array) {
          for (var subexpression = 0; subexpression < newStyle.length; subexpression++) {
            matchedString = bestMatch[subexpression + 1];
            output(matchedString, newStyle[subexpression]);
          }
        }
        else {
          matchedString = bestMatch[0];
          output(matchedString, newStyle);
        }

        switch (pattern[2]) {
        case -1:
          // do nothing
          break;
        case -2:
          // exit
          patternStack.pop();
          break;
        case -3:
          // exitall
          patternStack.length = 0;
          break;
        default:
          // this was the start of a delimited pattern or a state/environment
          patternStack.push(pattern);
          break;
        }
      }
    }

    // end of the line
    if (currentStyle) {
      tags[numTags++] = {pos: pos};
      if (currentStyle === 'sh_url') {
        sh_setHref(tags, numTags, inputString);
      }
      currentStyle = null;
    }
    pos = startOfNextLine;
  }

  return tags;
}

////////////////////////////////////////////////////////////////////////////////
// DOM-dependent functions

function sh_getClasses(element) {
  var result = [];
  var htmlClass = element.className;
  if (htmlClass && htmlClass.length > 0) {
    var htmlClasses = htmlClass.split(' ');
    for (var i = 0; i < htmlClasses.length; i++) {
      if (htmlClasses[i].length > 0) {
        result.push(htmlClasses[i]);
      }
    }
  }
  return result;
}

function sh_addClass(element, name) {
  var htmlClasses = sh_getClasses(element);
  for (var i = 0; i < htmlClasses.length; i++) {
    if (name.toLowerCase() === htmlClasses[i].toLowerCase()) {
      return;
    }
  }
  htmlClasses.push(name);
  element.className = htmlClasses.join(' ');
}

/**
Extracts the tags from an HTML DOM NodeList.
@param  nodeList  a DOM NodeList
@param  result  an object with text, tags and pos properties
*/
function sh_extractTagsFromNodeList(nodeList, result) {
  var length = nodeList.length;
  for (var i = 0; i < length; i++) {
    var node = nodeList.item(i);
    switch (node.nodeType) {
    case 1:
      if (node.nodeName.toLowerCase() === 'br') {
        var terminator;
        if (/MSIE/.test(navigator.userAgent)) {
          terminator = '\r';
        }
        else {
          terminator = '\n';
        }
        result.text.push(terminator);
        result.pos++;
      }
      else {
        result.tags.push({node: node.cloneNode(false), pos: result.pos});
        sh_extractTagsFromNodeList(node.childNodes, result);
        result.tags.push({pos: result.pos});
      }
      break;
    case 3:
    case 4:
      result.text.push(node.data);
      result.pos += node.length;
      break;
    }
  }
}

/**
Extracts the tags from the text of an HTML element. The extracted tags will be
returned as an array of tag objects. See sh_highlightString for the format of
the tag objects.
@param  element  a DOM element
@param  tags  an empty array; the extracted tag objects will be returned in it
@return  the text of the element
@see  sh_highlightString
*/
function sh_extractTags(element, tags) {
  var result = {};
  result.text = [];
  result.tags = tags;
  result.pos = 0;
  sh_extractTagsFromNodeList(element.childNodes, result);
  return result.text.join('');
}

/**
Merges the original tags from an element with the tags produced by highlighting.
@param  originalTags  an array containing the original tags
@param  highlightTags  an array containing the highlighting tags - these must not overlap
@result  an array containing the merged tags
*/
function sh_mergeTags(originalTags, highlightTags) {
  var numOriginalTags = originalTags.length;
  if (numOriginalTags === 0) {
    return highlightTags;
  }

  var numHighlightTags = highlightTags.length;
  if (numHighlightTags === 0) {
    return originalTags;
  }

  var result = [];
  var originalIndex = 0;
  var highlightIndex = 0;

  while (originalIndex < numOriginalTags && highlightIndex < numHighlightTags) {
    var originalTag = originalTags[originalIndex];
    var highlightTag = highlightTags[highlightIndex];

    if (originalTag.pos <= highlightTag.pos) {
      result.push(originalTag);
      originalIndex++;
    }
    else {
      result.push(highlightTag);
      if (highlightTags[highlightIndex + 1].pos <= originalTag.pos) {
        highlightIndex++;
        result.push(highlightTags[highlightIndex]);
        highlightIndex++;
      }
      else {
        // new end tag
        result.push({pos: originalTag.pos});

        // new start tag
        highlightTags[highlightIndex] = {node: highlightTag.node.cloneNode(false), pos: originalTag.pos};
      }
    }
  }

  while (originalIndex < numOriginalTags) {
    result.push(originalTags[originalIndex]);
    originalIndex++;
  }

  while (highlightIndex < numHighlightTags) {
    result.push(highlightTags[highlightIndex]);
    highlightIndex++;
  }

  return result;
}

/**
Inserts tags into text.
@param  tags  an array of tag objects
@param  text  a string representing the text
@return  a DOM DocumentFragment representing the resulting HTML
*/
function sh_insertTags(tags, text) {
  var doc = document;

  var result = document.createDocumentFragment();
  var tagIndex = 0;
  var numTags = tags.length;
  var textPos = 0;
  var textLength = text.length;
  var currentNode = result;

  // output one tag or text node every iteration
  while (textPos < textLength || tagIndex < numTags) {
    var tag;
    var tagPos;
    if (tagIndex < numTags) {
      tag = tags[tagIndex];
      tagPos = tag.pos;
    }
    else {
      tagPos = textLength;
    }

    if (tagPos <= textPos) {
      // output the tag
      if (tag.node) {
        // start tag
        var newNode = tag.node;
        currentNode.appendChild(newNode);
        currentNode = newNode;
      }
      else {
        // end tag
        currentNode = currentNode.parentNode;
      }
      tagIndex++;
    }
    else {
      // output text
      currentNode.appendChild(doc.createTextNode(text.substring(textPos, tagPos)));
      textPos = tagPos;
    }
  }

  return result;
}

/**
Highlights an element containing source code.  Upon completion of this function,
the element will have been placed in the "sh_sourceCode" class.
@param  element  a DOM <pre> element containing the source code to be highlighted
@param  language  a language definition object
*/
function sh_highlightElement(element, language) {
  sh_addClass(element, 'sh_sourceCode');
  var originalTags = [];
  var inputString = sh_extractTags(element, originalTags);
  var highlightTags = sh_highlightString(inputString, language);
  var tags = sh_mergeTags(originalTags, highlightTags);
  var documentFragment = sh_insertTags(tags, inputString);
  while (element.hasChildNodes()) {
    element.removeChild(element.firstChild);
  }
  element.appendChild(documentFragment);
}

function sh_getXMLHttpRequest() {
  if (window.ActiveXObject) {
    return new ActiveXObject('Msxml2.XMLHTTP');
  }
  else if (window.XMLHttpRequest) {
    return new XMLHttpRequest();
  }
  throw 'No XMLHttpRequest implementation available';
}

function sh_load(language, element, prefix, suffix) {
  if (language in sh_requests) {
    sh_requests[language].push(element);
    return;
  }
  sh_requests[language] = [element];
  var request = sh_getXMLHttpRequest();
  var url = prefix + 'sh_' + language + suffix;
  request.open('GET', url, true);
  request.onreadystatechange = function () {
    if (request.readyState === 4) {
      try {
        if (! request.status || request.status === 200) {
          eval(request.responseText);
          var elements = sh_requests[language];
          for (var i = 0; i < elements.length; i++) {
            sh_highlightElement(elements[i], sh_languages[language]);
          }
        }
        else {
          throw 'HTTP error: status ' + request.status;
        }
      }
      finally {
        request = null;
      }
    }
  };
  request.send(null);
}

/**
Highlights all elements containing source code on the current page. Elements
containing source code must be "pre" elements with a "class" attribute of
"sh_LANGUAGE", where LANGUAGE is a valid language identifier; e.g., "sh_java"
identifies the element as containing "java" language source code.
*/
function sh_highlightDocument(prefix, suffix) {
  var nodeList = document.getElementsByTagName('pre');
  for (var i = 0; i < nodeList.length; i++) {
    var element = nodeList.item(i);
    var htmlClasses = sh_getClasses(element);
    for (var j = 0; j < htmlClasses.length; j++) {
      var htmlClass = htmlClasses[j].toLowerCase();
      if (htmlClass === 'sh_sourcecode') {
        continue;
      }
      if (htmlClass.substr(0, 3) === 'sh_') {
        var language = htmlClass.substring(3);
        if (language in sh_languages) {
          sh_highlightElement(element, sh_languages[language]);
        }
        else if (typeof(prefix) === 'string' && typeof(suffix) === 'string') {
          sh_load(language, element, prefix, suffix);
        }
        else {
          throw 'Found <pre> element with class="' + htmlClass + '", but no such language exists';
        }
        break;
      }
    }
  }
}

if (! this.sh_languages) {
  this.sh_languages = {};
}
sh_languages['ruby'] = [
  [
    [
      /\b(?:require)\b/g,
      'sh_preproc',
      -1
    ],
    [
      /\b[+-]?(?:(?:0x[A-Fa-f0-9]+)|(?:(?:[\d]*\.)?[\d]+(?:[eE][+-]?[\d]+)?))u?(?:(?:int(?:8|16|32|64))|L)?\b/g,
      'sh_number',
      -1
    ],
    [
      /"/g,
      'sh_string',
      1
    ],
    [
      /'/g,
      'sh_string',
      2
    ],
    [
      /</g,
      'sh_string',
      3
    ],
    [
      /\/[^\n]*\//g,
      'sh_regexp',
      -1
    ],
    [
      /(%r)(\{(?:\\\}|#\{[A-Za-z0-9]+\}|[^}])*\})/g,
      ['sh_symbol', 'sh_regexp'],
      -1
    ],
    [
      /\b(?:alias|begin|BEGIN|break|case|defined|do|else|elsif|end|END|ensure|for|if|in|include|loop|next|raise|redo|rescue|retry|return|super|then|undef|unless|until|when|while|yield|false|nil|self|true|__FILE__|__LINE__|and|not|or|def|class|module|catch|fail|load|throw)\b/g,
      'sh_keyword',
      -1
    ],
    [
      /(?:^\=begin)/g,
      'sh_comment',
      4
    ],
    [
      /(?:\$[#]?|@@|@)(?:[A-Za-z0-9_]+|'|\"|\/)/g,
      'sh_type',
      -1
    ],
    [
      /[A-Za-z0-9]+(?:\?|!)/g,
      'sh_normal',
      -1
    ],
    [
      /~|!|%|\^|\*|\(|\)|-|\+|=|\[|\]|\\|:|;|,|\.|\/|\?|&|<|>|\|/g,
      'sh_symbol',
      -1
    ],
    [
      /(#)(\{)/g,
      ['sh_symbol', 'sh_cbracket'],
      -1
    ],
    [
      /#/g,
      'sh_comment',
      5
    ],
    [
      /\{|\}/g,
      'sh_cbracket',
      -1
    ]
  ],
  [
    [
      /$/g,
      null,
      -2
    ],
    [
      /\\(?:\\|")/g,
      null,
      -1
    ],
    [
      /"/g,
      'sh_string',
      -2
    ]
  ],
  [
    [
      /$/g,
      null,
      -2
    ],
    [
      /\\(?:\\|')/g,
      null,
      -1
    ],
    [
      /'/g,
      'sh_string',
      -2
    ]
  ],
  [
    [
      /$/g,
      null,
      -2
    ],
    [
      />/g,
      'sh_string',
      -2
    ]
  ],
  [
    [
      /^(?:\=end)/g,
      'sh_comment',
      -2
    ]
  ],
  [
    [
      /$/g,
      null,
      -2
    ]
  ]
];

if (! this.sh_languages) {
  this.sh_languages = {};
}
sh_languages['c'] = [
  [
    [
      /\/\/\//g,
      'sh_comment',
      1
    ],
    [
      /\/\//g,
      'sh_comment',
      7
    ],
    [
      /\/\*\*/g,
      'sh_comment',
      8
    ],
    [
      /\/\*/g,
      'sh_comment',
      9
    ],
    [
      /(\bstruct)([ \t]+)([A-Za-z0-9_]+)/g,
      ['sh_keyword', 'sh_normal', 'sh_classname'],
      -1
    ],
    [
      /^[ \t]*#(?:[ \t]*include)/g,
      'sh_preproc',
      10,
      1
    ],
    [
      /^[ \t]*#(?:[ \t]*[A-Za-z0-9_]*)/g,
      'sh_preproc',
      -1
    ],
    [
      /\b[+-]?(?:(?:0x[A-Fa-f0-9]+)|(?:(?:[\d]*\.)?[\d]+(?:[eE][+-]?[\d]+)?))u?(?:(?:int(?:8|16|32|64))|L)?\b/g,
      'sh_number',
      -1
    ],
    [
      /"/g,
      'sh_string',
      13
    ],
    [
      /'/g,
      'sh_string',
      14
    ],
    [
      /\b(?:__asm|__cdecl|__declspec|__export|__far16|__fastcall|__fortran|__import|__pascal|__rtti|__stdcall|_asm|_cdecl|__except|_export|_far16|_fastcall|__finally|_fortran|_import|_pascal|_stdcall|__thread|__try|asm|auto|break|case|catch|cdecl|const|continue|default|do|else|enum|extern|for|goto|if|pascal|register|return|sizeof|static|struct|switch|typedef|union|volatile|while)\b/g,
      'sh_keyword',
      -1
    ],
    [
      /\b(?:bool|char|double|float|int|long|short|signed|unsigned|void|wchar_t)\b/g,
      'sh_type',
      -1
    ],
    [
      /~|!|%|\^|\*|\(|\)|-|\+|=|\[|\]|\\|:|;|,|\.|\/|\?|&|<|>|\|/g,
      'sh_symbol',
      -1
    ],
    [
      /\{|\}/g,
      'sh_cbracket',
      -1
    ],
    [
      /(?:[A-Za-z]|_)[A-Za-z0-9_]*(?=[ \t]*\()/g,
      'sh_function',
      -1
    ],
    [
      /([A-Za-z](?:[^`~!@#$%&*()_=+{}|;:",<.>\/?'\\[\]\^\-\s]|[_])*)((?:<.*>)?)(\s+(?=[*&]*[A-Za-z][^`~!@#$%&*()_=+{}|;:",<.>\/?'\\[\]\^\-\s]*\s*[`~!@#$%&*()_=+{}|;:",<.>\/?'\\[\]\^\-\[\]]+))/g,
      ['sh_usertype', 'sh_usertype', 'sh_normal'],
      -1
    ]
  ],
  [
    [
      /$/g,
      null,
      -2
    ],
    [
      /(?:<?)[A-Za-z0-9_\.\/\-_~]+@[A-Za-z0-9_\.\/\-_~]+(?:>?)|(?:<?)[A-Za-z0-9_]+:\/\/[A-Za-z0-9_\.\/\-_~]+(?:>?)/g,
      'sh_url',
      -1
    ],
    [
      /<\?xml/g,
      'sh_preproc',
      2,
      1
    ],
    [
      /<!DOCTYPE/g,
      'sh_preproc',
      4,
      1
    ],
    [
      /<!--/g,
      'sh_comment',
      5
    ],
    [
      /<(?:\/)?[A-Za-z](?:[A-Za-z0-9_:.-]*)(?:\/)?>/g,
      'sh_keyword',
      -1
    ],
    [
      /<(?:\/)?[A-Za-z](?:[A-Za-z0-9_:.-]*)/g,
      'sh_keyword',
      6,
      1
    ],
    [
      /&(?:[A-Za-z0-9]+);/g,
      'sh_preproc',
      -1
    ],
    [
      /<(?:\/)?[A-Za-z][A-Za-z0-9]*(?:\/)?>/g,
      'sh_keyword',
      -1
    ],
    [
      /<(?:\/)?[A-Za-z][A-Za-z0-9]*/g,
      'sh_keyword',
      6,
      1
    ],
    [
      /@[A-Za-z]+/g,
      'sh_type',
      -1
    ],
    [
      /(?:TODO|FIXME|BUG)(?:[:]?)/g,
      'sh_todo',
      -1
    ]
  ],
  [
    [
      /\?>/g,
      'sh_preproc',
      -2
    ],
    [
      /([^=" \t>]+)([ \t]*)(=?)/g,
      ['sh_type', 'sh_normal', 'sh_symbol'],
      -1
    ],
    [
      /"/g,
      'sh_string',
      3
    ]
  ],
  [
    [
      /\\(?:\\|")/g,
      null,
      -1
    ],
    [
      /"/g,
      'sh_string',
      -2
    ]
  ],
  [
    [
      />/g,
      'sh_preproc',
      -2
    ],
    [
      /([^=" \t>]+)([ \t]*)(=?)/g,
      ['sh_type', 'sh_normal', 'sh_symbol'],
      -1
    ],
    [
      /"/g,
      'sh_string',
      3
    ]
  ],
  [
    [
      /-->/g,
      'sh_comment',
      -2
    ],
    [
      /<!--/g,
      'sh_comment',
      5
    ]
  ],
  [
    [
      /(?:\/)?>/g,
      'sh_keyword',
      -2
    ],
    [
      /([^=" \t>]+)([ \t]*)(=?)/g,
      ['sh_type', 'sh_normal', 'sh_symbol'],
      -1
    ],
    [
      /"/g,
      'sh_string',
      3
    ]
  ],
  [
    [
      /$/g,
      null,
      -2
    ]
  ],
  [
    [
      /\*\//g,
      'sh_comment',
      -2
    ],
    [
      /(?:<?)[A-Za-z0-9_\.\/\-_~]+@[A-Za-z0-9_\.\/\-_~]+(?:>?)|(?:<?)[A-Za-z0-9_]+:\/\/[A-Za-z0-9_\.\/\-_~]+(?:>?)/g,
      'sh_url',
      -1
    ],
    [
      /<\?xml/g,
      'sh_preproc',
      2,
      1
    ],
    [
      /<!DOCTYPE/g,
      'sh_preproc',
      4,
      1
    ],
    [
      /<!--/g,
      'sh_comment',
      5
    ],
    [
      /<(?:\/)?[A-Za-z](?:[A-Za-z0-9_:.-]*)(?:\/)?>/g,
      'sh_keyword',
      -1
    ],
    [
      /<(?:\/)?[A-Za-z](?:[A-Za-z0-9_:.-]*)/g,
      'sh_keyword',
      6,
      1
    ],
    [
      /&(?:[A-Za-z0-9]+);/g,
      'sh_preproc',
      -1
    ],
    [
      /<(?:\/)?[A-Za-z][A-Za-z0-9]*(?:\/)?>/g,
      'sh_keyword',
      -1
    ],
    [
      /<(?:\/)?[A-Za-z][A-Za-z0-9]*/g,
      'sh_keyword',
      6,
      1
    ],
    [
      /@[A-Za-z]+/g,
      'sh_type',
      -1
    ],
    [
      /(?:TODO|FIXME|BUG)(?:[:]?)/g,
      'sh_todo',
      -1
    ]
  ],
  [
    [
      /\*\//g,
      'sh_comment',
      -2
    ],
    [
      /(?:<?)[A-Za-z0-9_\.\/\-_~]+@[A-Za-z0-9_\.\/\-_~]+(?:>?)|(?:<?)[A-Za-z0-9_]+:\/\/[A-Za-z0-9_\.\/\-_~]+(?:>?)/g,
      'sh_url',
      -1
    ],
    [
      /(?:TODO|FIXME|BUG)(?:[:]?)/g,
      'sh_todo',
      -1
    ]
  ],
  [
    [
      /$/g,
      null,
      -2
    ],
    [
      /</g,
      'sh_string',
      11
    ],
    [
      /"/g,
      'sh_string',
      12
    ],
    [
      /\/\/\//g,
      'sh_comment',
      1
    ],
    [
      /\/\//g,
      'sh_comment',
      7
    ],
    [
      /\/\*\*/g,
      'sh_comment',
      8
    ],
    [
      /\/\*/g,
      'sh_comment',
      9
    ]
  ],
  [
    [
      /$/g,
      null,
      -2
    ],
    [
      />/g,
      'sh_string',
      -2
    ]
  ],
  [
    [
      /$/g,
      null,
      -2
    ],
    [
      /\\(?:\\|")/g,
      null,
      -1
    ],
    [
      /"/g,
      'sh_string',
      -2
    ]
  ],
  [
    [
      /"/g,
      'sh_string',
      -2
    ],
    [
      /\\./g,
      'sh_specialchar',
      -1
    ]
  ],
  [
    [
      /'/g,
      'sh_string',
      -2
    ],
    [
      /\\./g,
      'sh_specialchar',
      -1
    ]
  ]
];

