// Hamburger
function toggle() {
  var x = document.getElementById("burglinks");
  if (x.style.display === "block") {
      x.style.display = "none";
  } else {
      x.style.display = "block";
  }

  }

// Random user from https://randomapi.com/
function getUserInfo(data) {
  var person = data.results[0];
  var name = person.name.first;
  var photo = person.picture.medium;
  console.log(name, photo);
  
  // var user = document.getElementById("rando");
  $("#rando").append(
    $('<img id="profilePicture" src="' + photo + '">'));
  $("#rando").append($('<h3>').text(name).append('<i class="fas fa-chevron-down"></i>'));
} 

  $.ajax({
    url: 'https://randomuser.me/api/?inc=name,picture',
    dataType: 'json',
    success: function(data) {
      console.log(data);
      getUserInfo(data);
    }
  });