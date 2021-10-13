document.addEventListener("DOMContentLoaded", () => {

  /* Variables */
  var linkAddress = document.getElementById('copy-link');

  /* Copy current chrome tab href */
  chrome.tabs.query(
    {
      currentWindow: true,
      active: true
    },
    function (foundTabs) {
      if (foundTabs.length > 0) {
        var url = foundTabs[0].url;

        linkAddress.value = url;

        /* Copy link to clipboard */
        var button = document.getElementById("copy-link-button");

        button.addEventListener("click", (e) => {
          /* Copy the text inside the text field */
          navigator.clipboard.writeText(url);

          /* Show 'link copied' message */
          linkAddress.value = "Link Copied!";

          setTimeout(function () {
            linkAddress.value = url
          }, 2000);
        })

      } else {
        document.getElementsByClassName("current-url").style.display = "none";
      }
    }
  );

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

  /* Open seperate window for login */
  var loginButton = document.getElementById("open-login")
  loginButton.addEventListener("click", (e) => {
    window.open("index.html", '_blank').focus();
  })

  /* Open a seperate window for creating board (open website)  */
  var createBoardButton = document.getElementById("open-website")
  createBoardButton.addEventListener("click", (e) => {
    window.open("index.html", '_blank').focus();
  })


})