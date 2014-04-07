var h = 0;
function help() {
 
  if (h == 0) {
    $("#help").addClass("select");

  $("#help").animate({'marginLeft' :'0px'},{duration: 'fast', easing: 'linear', complete : function() {

    $(".forum").fadeIn(2000);
}});	

     h = 1;
  } else {
    $("#help").removeClass("select");

    $(".forum").fadeOut(200, function() { 

$("#help").animate({'marginLeft' :'485px'},{duration: 'fast', easing: 'linear', complete : function() {
} });	
    });

    h = 0;
  }

}

var counter = -1;
var nextQuestion = function() {
  $(".feature").fadeOut(1000);
  if (h == 1) { help(); }
  $(".question ul li a.current").removeClass("current");

  $("div.question p").fadeOut(function() {
    $(this).text(questions[counter].question).fadeIn();

    $(".forum .discussion").html(questions[counter].discussion);
    $("body").append(questions[counter].image);
    Cufon.replace('.forum div');
  });

  $('div.question ul li:eq(0) a').fadeOut(function() {
    $(this).html("<b>A.</b> " + questions[counter].a).fadeIn();
    $(this).addClass("current");

    $(this).click(function() {
      $(".question ul li a.current").removeClass("current");
      $(this).addClass("current");
    });
  });

  $('div.question ul li:eq(1) a').fadeOut(function() {
    $(this).html("<b>B.</b> " + questions[counter].b).fadeIn();

    $(this).click(function() {
      $(".question ul li a.current").removeClass("current");
      $(this).addClass("current");
    });
  });

  $('div.question ul li:eq(2) a').fadeOut(function() {
    $(this).html("<b>C.</b> " + questions[counter].c).fadeIn();

    $(this).click(function() {
      $(".question ul li a.current").removeClass("current");
      $(this).addClass("current");
    });

  });

  $('div.question ul li:eq(3) a').fadeOut(function() {
    $(this).html("<b>D.</b> " + questions[counter].d).fadeIn();

    $(this).click(function() {
      $(".question ul li a.current").removeClass("current");
      $(this).addClass("current");
    });

  });

  counter++;

  if (counter <= 5) {
    var newNum = counter
    $("#history .count").text(newNum); 
  }
  if (counter == 5) {
    $("#history").removeClass("active");
    $("#english").addClass("active");
    Cufon.replace('.section a', {hover:true});
  }

  if (counter > 5 && counter <= 10) {
    var newNum = counter - 5
    $("#english .count").text(newNum); 
  }

  if (counter == 10) {
    $("#english").removeClass("active");
    $("#science").addClass("active");
    Cufon.replace('.section a', {hover:true});
  }

  if (counter > 10 && counter <= 15) {
    var newNum = counter - 10
    $("#science .count").text(newNum); 
  }


  if (counter == 15) {
    $("#science").removeClass("active");
    $("#math").addClass("active");
    Cufon.replace('.section a', {hover:true});
  }


  if (counter > 15 && counter <= 20) {
    var newNum = counter - 15
    $("#math .count").text(newNum); 
  }

  if (counter == 20) {
    linkLocation = this.href;
    $("body").fadeOut(1000, function() {
      var url = "./results.html";
      $(location).attr('href',url);
  });      

  }

}


var questions = [
{
question : "Which of the following was the source for a colonial New England covenant community?",
             a : "The Mayflower Compact",
             b : "The Magna Carta",
             c : "The Bill of Rights",
             d : "The Declaration of Independence",
           discussion: ""

},
{
question : "One result of the first Great Awakening was —",
           a : "a renewed interest in religion",
           b : "the revival of the Salem witch hunts",
           c : "a move to limit religious freedom",
           d : "the founding of free Bible colleges",
           discussion: ""

},
{
question : "During the debate over the ratification of the Constitution of the United States, Federalists and Anti-Federalists disagreed most often over —",
           a : "provisions for admitting new states to the union",
           b : "distribution of power between the President and the Supreme Court",
           c : "use of an electoral college system to choose the President",
           d : "division of powers between the national government and the states",
           discussion : "<div><span>Student:</span> Wouldn't it be option B because of the court case of Madison vs. Marbury</div><div><span>Teacher:</span> This was a different political disagreement concerning the branches of government. When it came to federalist and anti-federalists, the debate on state rights versus national power applied to all facets of government.</div>"
},

{
question : "Conflict between American Indians (First Americans) and European settlers most often resulted from the different ways each culture viewed —",
           a : "religious practices",
           b : "political systems",
           c : "land ownership",
           d : "family relationships",
           discussion : ""
},

{
question : "Slavery was introduced to the British colonies to provide labor for —",
           a : "plantations",
           b : "factories",
           c : "shipbuilding",
           d : "lumbering",
           discussion: ""
},



{question : "The author organized paragraphs 2 through 6 by —",
        a : "relating the causes of strokes and how they affect people",
        b : "stating an opinion about the therapy and offering details in support",
        c : "describing Joe's recovery from beginning to end",
        d : "identifying problems Joe faced and making suggestions",
           discussion: ""

      },
      {
        question : "What does the word listless mean in paragraph 3",
        a : "angry and stubborn",
        b : "older and more mature",
        c : "lacking energy and concern",
        d : "cautious and shy",
        discussion: "<div><span>Student A:</span> Yo, I have no idea what listless is. This test seems really unfair. I have no idea what words they're gonna ask me, how am I supposed to get the definitions of every possible word?</div><div><span>Student B:</span> You don't have to know all the definitions. The test wants you to look at the context of the sentence. So, in this case, you know listless means lacking energy because Joy is losing interest in his toys and not playing like a normal child. It's the definition that makes the most sense. Just use context clues to get definitions on the real SOL.</div>"

      },
      {
        question : "In paragraph 3, the word demoralized means —",
        a : "carefully studied",
        b : "taken away hope",
        c : "greatly awakened",
        d : "grown much worse",
           discussion: ""

      },

{
        question : "Why did Joe’s mother first bring him to Dolphins Plus?",
        a : "She knew that dolphins were Joe's favorite animal",
        b : "Joe wanted a chance to swim with the center's dolphins",
        c : "She had heard of a new type of therapy using dolphins",
        d : "Joe had enjoyed swimming with other animals at the center",
           discussion: ""

      },

{
        question : "Deena Hoagland smiled when Fonzie splashed Joe with water because —",
        a : "she was amused by the dolphins' play",
        b : "the water was colder than she expected",
        c : "she knew it would make Joe happy",
        d : "Joe's reaction was a sign of hope",
           discussion: ""

      },








{
question : "Why does a comet's tail point away from the Sun?",
           a : "The solar wind blows the tail away from the Sun",
           b : "It is being pulled by a nearby black hole",
           c : "The Moon's light only shines on part of the comet",
           d : "The comet's tail is following the path of Jupiter",
           discussion: "",
           image: "<img class='feature' src='images/solar.png' />"

},
{
question : "Cloudy nights can be warmer than clear nights because clouds trap heat —",
           a : "generated from tropical winds",
           b : "produced by the friction of air particles",
           c : "released from Earth’s interior",
           d : "absorbed by Earth during daylight hours",
           discussion: ""

},
{
question : "In the Gold Rush of 1849, Prospecters found a yellow mineral that appeared to be gold but was harder and more brittle than gold. What is this mineral that came to be called fool's gold.",
           a : "Calcite",
           b : "Copper",
           c : "Sulfur",
           d : "Pyrite",
           discussion: ""

},

{
question : "Which provides the best evidence for the theory that faults and volcanoes are results of tectonic plate interactions?",
           a : "Faults on tectonic plates are in constant motion, but volcanoes may not erupt for many years.",
           b : "Faults and volcanoes existed long before there were tectonic plates.",
           c : "Tectonic plates that have many faults do not usually have volcanoes.",
           d : "Faults and volcanoes are often found at tectonic plate boundaries.",
           discussion: "<div><span>Student:</span> Hey, I was absent on the volcano lecture. I know nothing about them???</div><div><span>Teacher:</span> Here is a <a href='#'>link to the online text</a> that covers the volcano lecture. You can post again if you still have questions. I've flagged this for notifications.</div>"

},
{
question : "Which of these is likely to occur after moist air is cooled below its dew point?",
           a : "Water condensens.",
           b : "Evaporation increases",
           c : "Ice crystals melt",
           d : "Winds are generated",
           discussion: ""

},
   {
        question : "Which is equivalent to this expression? (6-3)^4?",
        a : "1,280",
        b : "81",
        c : "12",
        d : "7",
           discussion: ""

      },
      {
        question : "Which set contains 34/89",
        a : "{Rational numbers}",
        b : "{Natural numbers}",
        c : "{Irrational numbers}",
        d : "{Integers}",
           discussion: ""

      },
      {
        question : "Which number is not equivalent to the other three?",
        a : "0.8x1&sup2; &#185;",
        b : "8x10&sup2; &#185;",
        c : "80x10&sup1; &#185;",
        d : "800x1&sup1; &#185;",
           discussion: ""

      },

{
        question : "Which number has the least value??",
        a : "7.63x10^4 &#185;",
        b : "3.55x10^6 &#185;",
        c : "9.98x10^3 &#185;",
        d : "1.05x10^5 &#185;",
           discussion: ""

      },

{
        question : "Which of the following has a different value than the others?",
        a : "6/8 &#189; ",
        b : "&frac34; &#189; ",
        c : "50%",
        d : "0.75",
           discussion: ""

      }
];

