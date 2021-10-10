document.addEventListener("DOMContentLoaded", () => {

  /* Add href link to input */
  document.getElementById('copy-link').value = window.location.href;

  /* Copy link to clipboard */
  var button = document.getElementById("copy-link")

  button.addEventListener("click", (e) => {
    /* Copy the text inside the text field */
    navigator.clipboard.writeText(window.location.href);

    /* Alert the copied text */
    alert("Copied the text: " + window.location.href);
  })

    /* Test different extension views */
    var checkLoginButton = document.getElementById("test")

    checkLoginButton.addEventListener("click", (e) => {
      if (document.getElementById("home").style.display === "none") {
        document.getElementById("home").style.display = "block";
        document.getElementById("login").style.display = "none";
      } else {
        document.getElementById("home").style.display = "none";
        document.getElementById("login").style.display = "block";
      }
    })

})