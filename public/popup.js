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

  /* Open a seperate window for creating board (open website)  */
  var createBoardButton = document.getElementById("open-website")
  createBoardButton.addEventListener("click", (e) => {
    window.open("http://localhost:5000/index.html", '_blank').focus();
  })


})