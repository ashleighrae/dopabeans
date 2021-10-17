import { ref, getStorage, uploadBytesResumable, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.1.2/firebase-storage.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.1.2/firebase-app.js';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'https://www.gstatic.com/firebasejs/9.1.2/firebase-auth.js';
import { getDatabase, onValue } from 'https://www.gstatic.com/firebasejs/9.1.2/firebase-database.js';
import { collection, addDoc, getFirestore, setDoc, getDocs, doc, query, orderBy, limit, onSnapshot, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-analytics.js";

import { getMessaging, getToken, onMessage} from 'https://www.gstatic.com/firebasejs/9.1.2/firebase-messaging.js'; 
import { getPerformance } from 'https://www.gstatic.com/firebasejs/9.1.2/firebase-performance.js';

const firebaseConfig = {
    apiKey: "AIzaSyAK6BS-eYLMsXlJK2t8-cQfjQF8rh_idDQ",
    authDomain: "dopabeans-cb511.firebaseapp.com",
    databaseURL: "https://dopabeans-cb511-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "dopabeans-cb511",
    storageBucket: "dopabeans-cb511.appspot.com",
    messagingSenderId: "402132301454",
    appId: "1:402132301454:web:b5a2006a303f66f0bcfbdf",
    measurementId: "G-498CLKKQYT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore();
const person = collection(db, "person");

// Hamburger
function toggle() {
    var x = document.getElementById("burglinks");
    if (x.style.display === "block") {
        x.style.display = "none";
    } else {
        x.style.display = "block";
    }

}

 // Signs-in Chat.
 async function signIn() {
    // Sign in Firebase using popup auth and Google as the identity provider.
    var provider = new GoogleAuthProvider();
    await signInWithPopup(getAuth(), provider);
  }
  
  // Signs-out of Chat.
  function signOutUser() {
    // Sign out of Firebase.
    signOut(getAuth());
  }
  
  // Initialize firebase auth
  function initFirebaseAuth() {
    // Listen to auth state changes.
    onAuthStateChanged(getAuth(), authStateObserver);
  }
  
  // Returns the signed-in user's profile Pic URL.
  function getProfilePicUrl() {
    return getAuth().currentUser.photoURL || '/images/profile_placeholder.png';
  }
  
  // Returns the signed-in user's display name.
  function getUserName() {
    return getAuth().currentUser.displayName;
  }
  
  // Returns true if a user is signed-in.
  function isUserSignedIn() {
    return !!getAuth().currentUser;
  }
  
  // Saves a new message to Cloud Firestore.
  async function saveMessage(messageText) {
    // Add a new message entry to the Firebase database.
    try {
      await addDoc(collection(getFirestore(), 'messages'), {
        name: getUserName(),
        text: messageText,
        profilePicUrl: getProfilePicUrl(),
        timestamp: serverTimestamp()
      });
    }
    catch(error) {
      console.error('Error writing new message to Firebase Database', error);
    }
  }
  
  // Loads chat messages history and listens for upcoming ones.
  function loadMessages() {
    // Create the query to load the last 12 messages and listen for new ones.
    const recentMessagesQuery = query(collection(getFirestore(), 'messages'), orderBy('timestamp', 'desc'), limit(12));
    
    // Start listening to the query.
    onSnapshot(recentMessagesQuery, function(snapshot) {
      snapshot.docChanges().forEach(function(change) {
        if (change.type === 'removed') {
          deleteMessage(change.doc.id);
        } else {
          var message = change.doc.data();
          displayMessage(change.doc.id, message.timestamp, message.name,
                        message.text, message.profilePicUrl, message.imageUrl);
        }
      });
    });
  }
  
  // Saves a new message containing an image in Firebase.
  // This first saves the image in Firebase storage.
  async function saveImageMessage(file) {
    try {
      // 1 - We add a message with a loading icon that will get updated with the shared image.
      const messageRef = await addDoc(collection(getFirestore(), 'messages'), {
        name: getUserName(),
        imageUrl: LOADING_IMAGE_URL,
        profilePicUrl: getProfilePicUrl(),
        timestamp: serverTimestamp()
      });
  
      // 2 - Upload the image to Cloud Storage.
      const filePath = `${getAuth().currentUser.uid}/${messageRef.id}/${file.name}`;
      const newImageRef = ref(getStorage(), filePath);
      const fileSnapshot = await uploadBytesResumable(newImageRef, file);
      
      // 3 - Generate a public URL for the file.
      const publicImageUrl = await getDownloadURL(newImageRef);
  
      // 4 - Update the chat message placeholder with the image’s URL.
      await updateDoc(messageRef,{
        imageUrl: publicImageUrl,
        storageUri: fileSnapshot.metadata.fullPath
      });
    } catch (error) {
      console.error('There was an error uploading a file to Cloud Storage:', error);
    }
  }
  
  // Saves the messaging device token to Cloud Firestore.
  async function saveMessagingDeviceToken() {
    try {
      const currentToken = await getToken(getMessaging());
      if (currentToken) {
        console.log('Got FCM device token:', currentToken);
        // Saving the Device Token to Cloud Firestore.
        const tokenRef = doc(getFirestore(), 'fcmTokens', currentToken);
        await setDoc(tokenRef, { uid: getAuth().currentUser.uid });
 
        // This will fire when a message is received while the app is in the foreground.
        // When the app is in the background, firebase-messaging-sw.js will receive the message instead.
        onMessage(getMessaging(), (message) => {
          console.log(
            'New foreground notification from Firebase Messaging!',
            message.notification
          );
        });
      } else {
        // Need to request permissions to show notifications.
        requestNotificationsPermissions();
      }
    } catch(error) {
      console.error('Unable to get messaging token.', error);
    };
  }
  
  // Requests permissions to show notifications.
  async function requestNotificationsPermissions() {
    console.log('Requesting notifications permission...');
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      // Notification permission granted.
      await saveMessagingDeviceToken();
    } else {
      console.log('Unable to get permission to notify.');
    }
  }
  
  // Triggered when a file is selected via the media picker.
  function onMediaFileSelected(event) {
    event.preventDefault();
    var file = event.target.files[0];
  
    // Clear the selection in the file picker input.
    imageFormElement.reset();
  
    // Check if the file is an image.
    if (!file.type.match('image.*')) {
      var data = {
        message: 'You can only share images',
        timeout: 2000
      };
      signInSnackbarElement.MaterialSnackbar.showSnackbar(data);
      return;
    }
    // Check if the user is signed-in
    if (checkSignedInWithMessage()) {
      saveImageMessage(file);
    }
  }
  
  // Triggered when the send new message form is submitted.
  function onMessageFormSubmit(e) {
    e.preventDefault();
    // Check that the user entered a message and is signed in.
    if (messageInputElement.value && checkSignedInWithMessage()) {
      saveMessage(messageInputElement.value).then(function() {
        // Clear message text field and re-enable the SEND button.
        resetMaterialTextfield(messageInputElement);
        toggleButton();
      });
    }
  }
  
  // Triggers when the auth state change for instance when the user signs-in or signs-out.
  function authStateObserver(user) {
    if (user) { // User is signed in!
      // Get the signed-in user's profile pic and name.
      var profilePicUrl = getProfilePicUrl();
      var userName = getUserName();
  
      // Set the user's profile pic and name.
      userPicElement.style.backgroundImage = 'url(' + addSizeToGoogleProfilePic(profilePicUrl) + ')';
      userNameElement.textContent = userName;
  
      // Show user's profile and sign-out button.
      userNameElement.removeAttribute('hidden');
      userPicElement.removeAttribute('hidden');
      signOutButtonElement.removeAttribute('hidden');
  
      // Hide sign-in button.
      signInButtonElement.setAttribute('hidden', 'true');
  
      // We save the Firebase Messaging Device token and enable notifications.
      saveMessagingDeviceToken();
    } else { // User is signed out!
      // Hide user's profile and sign-out button.
      userNameElement.setAttribute('hidden', 'true');
      userPicElement.setAttribute('hidden', 'true');
      signOutButtonElement.setAttribute('hidden', 'true');
  
      // Show sign-in button.
      signInButtonElement.removeAttribute('hidden');
    }
  }
  
  // Returns true if user is signed-in. Otherwise false and displays a message.
  function checkSignedInWithMessage() {
    // Return true if the user is signed in Firebase
    if (isUserSignedIn()) {
      return true;
    }
  
    // Display a message to the user using a Toast.
    var data = {
      message: 'You must sign-in first',
      timeout: 2000
    };
    signInSnackbarElement.MaterialSnackbar.showSnackbar(data);
    return false;
  }
  
  // Resets the given MaterialTextField.
  function resetMaterialTextfield(element) {
    element.value = '';
    element.parentNode.MaterialTextfield.boundUpdateClassesHandler();
  }
  
  // Template for messages.
  var MESSAGE_TEMPLATE =
      '<div class="message-container">' +
        '<div class="spacing"><div class="pic"></div></div>' +
        '<div class="message"></div>' +
        '<div class="name"></div>' +
      '</div>';
  
  // Adds a size to Google Profile pics URLs.
  function addSizeToGoogleProfilePic(url) {
    if (url.indexOf('googleusercontent.com') !== -1 && url.indexOf('?') === -1) {
      return url + '?sz=150';
    }
    return url;
  }
  
  // A loading image URL.
  var LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif?a';
  
//   // Delete a Message from the UI.
//   function deleteMessage(id) {
//     var div = document.getElementById(id);
//     // If an element for that message exists we delete it.
//     if (div) {
//       div.parentNode.removeChild(div);
//     }
//   }
  
//   function createAndInsertMessage(id, timestamp) {
//     const container = document.createElement('div');
//     container.innerHTML = MESSAGE_TEMPLATE;
//     const div = container.firstChild;
//     div.setAttribute('id', id);
  
//     // If timestamp is null, assume we've gotten a brand new message.
//     // https://stackoverflow.com/a/47781432/4816918
//     timestamp = timestamp ? timestamp.toMillis() : Date.now();
//     div.setAttribute('timestamp', timestamp);
  
//     // figure out where to insert new message
//     const existingMessages = messageListElement.children;
//     if (existingMessages.length === 0) {
//       messageListElement.appendChild(div);
//     } else {
//       let messageListNode = existingMessages[0];
  
//       while (messageListNode) {
//         const messageListNodeTime = messageListNode.getAttribute('timestamp');
  
//         if (!messageListNodeTime) {
//           throw new Error(
//             `Child ${messageListNode.id} has no 'timestamp' attribute`
//           );
//         }
  
//         if (messageListNodeTime > timestamp) {
//           break;
//         }
  
//         messageListNode = messageListNode.nextSibling;
//       }
  
//       messageListElement.insertBefore(div, messageListNode);
//     }
  
//     return div;
//   }
  
//   // Displays a Message in the UI.
//   function displayMessage(id, timestamp, name, text, picUrl, imageUrl) {
//     var div = document.getElementById(id) || createAndInsertMessage(id, timestamp);
  
//     // profile picture
//     if (picUrl) {
//       div.querySelector('.pic').style.backgroundImage = 'url(' + addSizeToGoogleProfilePic(picUrl) + ')';
//     }
  
//     div.querySelector('.name').textContent = name;
//     var messageElement = div.querySelector('.message');
  
//     if (text) { // If the message is text.
//       messageElement.textContent = text;
//       // Replace all line breaks by <br>.
//       messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');
//     } else if (imageUrl) { // If the message is an image.
//       var image = document.createElement('img');
//       image.addEventListener('load', function() {
//         messageListElement.scrollTop = messageListElement.scrollHeight;
//       });
//       image.src = imageUrl + '&' + new Date().getTime();
//       messageElement.innerHTML = '';
//       messageElement.appendChild(image);
//     }
//     // Show the card fading-in and scroll to view the new message.
//     setTimeout(function() {div.classList.add('visible')}, 1);
//     messageListElement.scrollTop = messageListElement.scrollHeight;
//     messageInputElement.focus();
//   }
  
  // Enables or disables the submit button depending on the values of the input
  // fields.
  function toggleButton() {
    if (messageInputElement.value) {
      submitButtonElement.removeAttribute('disabled');
    } else {
      submitButtonElement.setAttribute('disabled', 'true');
    }
  }
  
  // Shortcuts to DOM Elements.
  var messageListElement = document.getElementById('messages');
  var messageFormElement = document.getElementById('message-form');
  var messageInputElement = document.getElementById('message');
  var submitButtonElement = document.getElementById('submit');
  var imageButtonElement = document.getElementById('submitImage');
  var imageFormElement = document.getElementById('image-form');
  var mediaCaptureElement = document.getElementById('mediaCapture');
  var userPicElement = document.getElementById('user-pic');
  var userNameElement = document.getElementById('user-name');
  var signInButtonElement = document.getElementById('sign-in');
  var signOutButtonElement = document.getElementById('sign-out');
  var signInSnackbarElement = document.getElementById('must-signin-snackbar');
  
  // Saves message on form submit.
//   messageFormElement.addEventListener('submit', onMessageFormSubmit);
  signOutButtonElement.addEventListener('click', signOutUser);
  signInButtonElement.addEventListener('click', signIn);
  
  // Toggle for the button.
//   messageInputElement.addEventListener('keyup', toggleButton);
//   messageInputElement.addEventListener('change', toggleButton);
  
  // Events for image upload.
//   imageButtonElement.addEventListener('click', function(e) {
//     e.preventDefault();
//     mediaCaptureElement.click();
//   });
//   mediaCaptureElement.addEventListener('change', onMediaFileSelected);
 
 getPerformance();
 initFirebaseAuth();
//  loadMessages();
  






// $("#rando").append(
//     $('<img id="profilePicture" src="' + photo + '">'));
// $("#rando").append($('<h3>').text(name).append('<i class="fas fa-chevron-down"></i>'));


// Add spaces to to home page
async function getSpacesHomepage(datab) {
    const spaceCol = collection(datab, 'spaces');
    const spaceSnapshot = await getDocs(spaceCol);
    const spaceList = spaceSnapshot.docs.map(doc => doc.data());
    console.log("Spaces: ", spaceList);

    spaceList.forEach(element => {
        const categoryDiv = document.createElement("div");
        categoryDiv.classList.add("category");

        // Add image
        var img = document.createElement('img');
        img.src = element.image;
        categoryDiv.appendChild(img);

        // Add link
        const spacePageLink = document.createElement("a");
        spacePageLink.href = "/spaces/space-template.html";
        categoryDiv.appendChild(spacePageLink);

        // Add header
        const header = document.createElement("h3");
        const title = document.createTextNode(element.title);
        header.appendChild(title);
        const headerDiv = document.createElement("div");
        headerDiv.appendChild(header);
        spacePageLink.appendChild(headerDiv);

        var spaceDiv = document.getElementsByClassName('categoryGridSpace')[0];
        spaceDiv.prepend(categoryDiv);

        // Set current space
        if (spacePageLink) addEventListener("click", (e) => {
            localStorage.setItem('currentSpace', element); //set

            /* Log current space */
            console.log("Current space: ", localStorage.getItem('currentSpace'));
        });
    });
}


// Custom Scripts

document.addEventListener("DOMContentLoaded", () => {
    var spaceModal = document.getElementById("create-space-modal");

    var addSpaceBtn = document.getElementById("create-space-modal-button");
    var addCollectionBtn = document.getElementById("create-collection-modal-button");
    var addResourceBtn = document.getElementById("create-resource-modal-button");

    var submitAddSpaceBtn = document.getElementById("form-submit-add-space");
    var submitAddCollectionBtn = document.getElementById("form-submit-add-space");
    var submitAddResourceBtn = document.getElementById("form-submit-add-space");


    var span = document.getElementsByClassName("close")[0];
    var boardButton = document.getElementById("create-board-button");
    var existingBoardButton = document.getElementById("existing-board-button");
    var createBoardDiv = document.getElementsByClassName("create-board")[0];
    var currentBoard = document.getElementById("board-options");
    var boardFile = document.getElementById("boardFile");
    var createResource = document.getElementsByClassName("form-submit-add-resource")[0];
    var selectedFile;

    /* Log current space */
    console.log("Current space: ", localStorage.getItem('currentSpace'));
    console.log("Current collection: ", localStorage.getItem('currentCollection'));
    console.log("Current resource: ", localStorage.getItem('currentResource'));

    /* Create resource pop-up */
    if (addSpaceBtn) {
        addSpaceBtn.addEventListener("click", (e) => {
            spaceModal.style.display = "block";
        });
    }

    const toKebabCase = str =>
        str &&
        str
            .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
            .map(x => x.toLowerCase())
            .join('-');

    if (submitAddSpaceBtn) {
        submitAddSpaceBtn.addEventListener("click", (e) => {

            // console.log(e.data);

            // e.preventDefault();

            //Get Form Values
            let title = document.querySelector('#create-spaces-modal #title').value;

            let image = document.getElementById('image-link').value;
            let id = toKebabCase(title);
            let description = document.getElementById('desc').value;

            //Save Form Data To Firebase
            setDoc(doc(db, "spaces", id), {
                title: title,
                image: image,
                description: description
            }).then(() => {
                console.log("Data saved")
            }).catch((error) => {
                console.log(error)
            });

            //alert
            alert("Your Form Has Been Submitted Successfully")
        })
    }

    if (span) {
        span.addEventListener("click", (e) => {
            spaceModal.style.display = "none";
        });
    }

    window.addEventListener("click", (e) => {
        if (e.target == addSpaceBtn) {
            addSpaceBtn.style.display = "none";
        }
    });


    if (boardButton) {
        /* Create Board */
        boardButton.addEventListener("click", (e) => {
            currentBoard.style.display = "none";
            createBoardDiv.style.display = "block";
        });
    }

    if (existingBoardButton) {
        existingBoardButton.addEventListener("click", (e) => {
            currentBoard.style.display = "block";
            createBoardDiv.style.display = "none";
        });
    }


    /* Upload file to database */
    if (boardFile) {
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
    }

    // Add spaces to home page
    if (window.location.href.includes("index") || window.location.href.includes("spaces.html")) getSpacesHomepage(db);

    if (createResource) {

        createResource.addEventListener("click", (e) => {
            //addBoardImage();
        });
    }

})
