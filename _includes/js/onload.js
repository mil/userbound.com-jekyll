$(function($) {
  $(".fade-in").animate({'opacity': '1'}, 800);

  // Page Next
  $(".pager .next").on("click", function() {
    if ($(".pager .next").hasClass("hidden")) { return; }
    var current_item = $(".thumbnaildescription.active");
    var next_item = $(current_item).next();

    $(".thumbnaildescription.active").animate({'opacity' : '0'}, 500, function() {
      $(next_item).addClass('active');
      $(current_item).removeClass('active');

      $(next_item).animate({'opacity' : '1'}, 500, function() {
      });
    });
    $(".pager button.previous.hidden").removeClass("hidden");
    if (!$(next_item).next().is("section")) {
      $(".pager button.next").addClass("hidden");
    }

  });

  // Page Previous
  $(".pager .previous").on("click", function() {
    if ($(".pager .previous").hasClass("hidden")) { return; }
    var current_item = $(".thumbnaildescription.active");
    var next_item = $(current_item).prev();

    $(".thumbnaildescription.active").animate({'opacity' : '0'}, 500, function() {
      $(current_item).removeClass('active');
      $(next_item).addClass('active');

      $(next_item).animate({'opacity' : '1'}, 500, function() {
      });
    });
    $(".pager button.next.hidden").removeClass("hidden");
    if ($(next_item).prev().length == 0) {
      $(".pager button.previous").addClass("hidden");
    }
  });

  $("nav.subnav a").on("click", function(e) {
    var target_section = ".shortlist#" + $(e.target).text().replace(" ", "-");

    $(".subnav a.active").removeClass("active");
    $(e.target).addClass("active");


    $(".shortlist.active").animate({'opacity' : '0'}, 500, function() {
      $(".shortlist.active").removeClass('active');
      $(target_section).addClass('active');

      $(target_section).animate({'opacity' : '1'}, 500, function() {
      });
    });
  });
});
