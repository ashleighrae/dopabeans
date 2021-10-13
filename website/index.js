document.addEventListener("DOMContentLoaded", () => {
    /* Create resource pop-up */
    var modal = document.getElementById("create-resource-modal");

    var btn = document.getElementById("create-resource-modal-button");

    var span = document.getElementsByClassName("close")[0];

    btn.addEventListener("click", (e) => {
        modal.style.display = "block";
    });

    span.addEventListener("click", (e) => {

        modal.style.display = "none";
    });

    window.addEventListener("click", (e) => {
        if (e.target == modal) {
            modal.style.display = "none";
        }
    });

})