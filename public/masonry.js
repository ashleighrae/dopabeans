// external js: masonry.pkgd.js
var $grid = $('.grid').masonry({
  // disable initial layout
  initLayout: false,
  //...
});
// bind event
$grid.masonry( 'on', 'layoutComplete', function() {
  console.log('Layout is complete.');
});
// trigger initial layout
$grid.masonry();


$('.grid').masonry({
    itemSelector: '.grid-item',
    columnWidth:  '.grid-sizer',
    gutter: 10
  });