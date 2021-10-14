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
    success: function (data) {
        console.log(data);
        getUserInfo(data);
    }
});

// Custom Scripts

document.addEventListener("DOMContentLoaded", () => {
    var modal = document.getElementById("create-resource-modal");
    var btn = document.getElementById("create-resource-modal-button");
    var span = document.getElementsByClassName("close")[0];
    var boardButton = document.getElementById("create-board-button");
    var existingBoardButton = document.getElementById("existing-board-button");
    var createBoardDiv = document.getElementsByClassName("create-board")[0];
    var currentBoard = document.getElementById("board-options");
    var boardFile = document.getElementById("boardFile");
    var createResource = document.getElementsByClassName("form-submit-add-resource")[0];
    var selectedFile;

    /* Create resource pop-up */
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

    existingBoardButton.addEventListener("click", (e) => {
        currentBoard.style.display = "block";
        createBoardDiv.style.display = "none";
    });

    /* Upload file to database */

    boardFile.addEventListener("change", (e) => {
        selectedFile = e.target.files[0];
    })

    /* Add file to storage on firebase */
    function addBoardImage() {
        // if (selectedFile) {
        //     var filename = selectedFile.name;
        //     var storageRef = firebase.storage().ref('/board_images' * filename);
        //     var uploadTask = storageRef.put(selectedFile);

        //     // Register three observers:
        //     // 1. 'state_changed' observer, called any time the state changes
        //     // 2. Error observer, called on failure
        //     // 3. Completion observer, called on successful completion
        //     uploadTask.on('state_changed',
        //         (snapshot) => {
        //             // Observe state change events such as progress, pause, and resume
        //             // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        //             var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        //             console.log('Upload is ' + progress + '% done');
        //             switch (snapshot.state) {
        //                 case firebase.storage.TaskState.PAUSED: // or 'paused'
        //                     console.log('Upload is paused');
        //                     break;
        //                 case firebase.storage.TaskState.RUNNING: // or 'running'
        //                     console.log('Upload is running');
        //                     break;
        //             }
        //         },
        //         (error) => {
        //             // Handle unsuccessful uploads
        //         },
        //         () => {
        //             // Handle successful uploads on complete
        //             // For instance, get the download URL: https://firebasestorage.googleapis.com/...
        //             uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
        //                 var postKey = firebase.database().ref('Board_images/').push().key;
        //                 var updates = {};
        //                 var postData = {
        //                     url: downloadURL
        //                 }
        //                 updates['/Board_images/' + postKey] = postData;
        //                 console.log('File available at', downloadURL);
        //                 firebase.database().ref().update(updates);
        //             });
        //         }
        //     );

        //     selectedFile = null;
        // }

        if (selectedFile) {
            const storage = getStorage();
            var storageRef = ref(storage, '/board_images' * selectedFile.name);

            // Upload the file and metadata
            const uploadTask = uploadBytesResumable(storageRef, selectedFile);
        }
    }

    createResource.addEventListener("click", (e) => {
        addBoardImage();
        console.log("here");
    });

})