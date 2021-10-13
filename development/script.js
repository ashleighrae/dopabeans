// external js: masonry.pkgd.js

$('.grid').masonry({
  itemSelector: '.grid-item',
  columnWidth:  '.grid-sizer',
  gutter: 10
});

$(function () {
  $(document).scroll(function(){
    var $nav = $("#mainNavbarMenu");
    $nav.toggleClass("navscroll", $(this).scrollTop() > $nav.height());
  });
});


$(window).resize(function() {
    console.log(window.innerWidth);
    if (window.innerWidth >= 830) {
        var x = document.getElementById("burglinks");
        x.style.display = "flex";
    }

});

$(window).resize(function() {
    console.log(window.innerWidth);
    if (window.innerWidth < 830) {
        var x = document.getElementById("burglinks");
        x.style.display = "none";
    }

});

// Hamburger
function toggle() {
  var x = document.getElementById("burglinks");
  if (x.style.display === "block") {
      x.style.display = "none";
  } else {
      x.style.display = "block";
  }

  }
