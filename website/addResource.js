document.addEventListener("DOMContentLoaded", () => {
    /* Create resource pop-up */
    var modal = document.getElementById("create-resource-modal");
    var btn = document.getElementById("create-resource-modal-button");
    var span = document.getElementsByClassName("close")[0];
    var boardButton = document.getElementById("create-board-button");
    var createBoardDiv = document.getElementsByClassName("create-board")[0];
    var currentBoard = document.getElementById("board-options");

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

    /* Create Board */
    boardButton.addEventListener("click", (e) => {
        currentBoard.style.display = "none";
        createBoardDiv.style.display = "block";
    });
})