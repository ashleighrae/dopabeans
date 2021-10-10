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

})