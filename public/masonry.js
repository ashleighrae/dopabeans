// external js: masonry.pkgd.js
// var $grid = $('.grid').masonry({
//   // disable initial layout
//   initLayout: false,
//   //...
// });

// var $grid = $('.grid').imagesLoaded( function() {
//   // init Masonry after all images have loaded
//   $grid.masonry({
//     // options...
//     initLayout: false,
//   });
// });


var $grid = $('.grid').masonry({
  // options...
  initLayout: false,
  // percentPosition: true,
  itemSelector: '.grid-item',
  columnWidth:  '.grid-sizer',
  gutter: 10
});
// layout Masonry after each image loads

window.addEventListener("DOMContentLoaded", () => {
  $grid.imagesLoaded().progress( function() {
    $grid.masonry();
  });
})


// bind event
// $grid.masonry( 'on', 'layoutComplete', function() {
//   console.log('layout is complete');
// });

// // $('.grid').masonry({
  
// // });


// // trigger initial layout
// $grid.masonry();


