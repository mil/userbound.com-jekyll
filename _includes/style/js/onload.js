$(function($) {
  $(".fade-in").animate({'opacity': '1'}, 800);

  // Page Next
  $(".pager .next").on("click", function() {
    var current_item = $(".thumbnaildescription.active");
    var next_item = $(current_item).next();

    $(".thumbnaildescription.active").animate({'opacity' : '0'}, 500, function() {
      $(current_item).removeClass('active');
      $(next_item).addClass('active');

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

  $("nav.subnav").on("click", function(e) {
    var target_section = "#" + $(e.target).text().replace(" ", "-");
    console.log(target_section);

  });
});
