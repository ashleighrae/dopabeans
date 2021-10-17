import { ref, getStorage, uploadBytesResumable, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.1.2/firebase-storage.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.1.2/firebase-app.js';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'https://www.gstatic.com/firebasejs/9.1.2/firebase-auth.js';
import { getDatabase, onValue } from 'https://www.gstatic.com/firebasejs/9.1.2/firebase-database.js';
import { collection, addDoc, getFirestore, setDoc, getDocs, doc, query, orderBy, limit, arrayUnion, onSnapshot, updateDoc, serverTimestamp, getDoc } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-analytics.js";

import { getMessaging, getToken, onMessage } from 'https://www.gstatic.com/firebasejs/9.1.2/firebase-messaging.js';
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
    catch (error) {
        console.error('Error writing new message to Firebase Database', error);
    }
}

// Loads chat messages history and listens for upcoming ones.
function loadMessages() {
    // Create the query to load the last 12 messages and listen for new ones.
    const recentMessagesQuery = query(collection(getFirestore(), 'messages'), orderBy('timestamp', 'desc'), limit(12));

    // Start listening to the query.
    onSnapshot(recentMessagesQuery, function (snapshot) {
        snapshot.docChanges().forEach(function (change) {
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
        await updateDoc(messageRef, {
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
    } catch (error) {
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
        saveMessage(messageInputElement.value).then(function () {
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
        if (userNameElement) {
            // Hide user's profile and sign-out button.
            userNameElement.setAttribute('hidden', 'true');
            userPicElement.setAttribute('hidden', 'true');
            signOutButtonElement.setAttribute('hidden', 'true');

            // Show sign-in button.
            signInButtonElement.removeAttribute('hidden');
        }
    }
}

// Returns true if user is signed-in. Otherwise false and displays a message.
function checkSignedInWithMessage() {
    // Return true if the user is signed in Firebase
    if (isUserSignedIn()) {
        return true;
    }

    // var signInSnackbarElement = document.getElementById('must-signin-snackbar');

    // Add the "show" class to DIV
    signInSnackbarElement.className = "show";

    // After 3 seconds, remove the show class from DIV
    setTimeout(function () { signInSnackbarElement.className = signInSnackbarElement.className.replace("show", ""); }, 3000);

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

// Delete a Message from the UI.
function deleteMessage(id) {
    var div = document.getElementById(id);
    // If an element for that message exists we delete it.
    if (div) {
        div.parentNode.removeChild(div);
    }
}

function createAndInsertMessage(id, timestamp) {
    const container = document.createElement('div');
    container.innerHTML = MESSAGE_TEMPLATE;
    const div = container.firstChild;
    div.setAttribute('id', id);

    // If timestamp is null, assume we've gotten a brand new message.
    // https://stackoverflow.com/a/47781432/4816918
    timestamp = timestamp ? timestamp.toMillis() : Date.now();
    div.setAttribute('timestamp', timestamp);

    if (messageListElement != null) {
        // figure out where to insert new message
        const existingMessages = messageListElement.children;
        if (existingMessages.length === 0) {
            messageListElement.appendChild(div);
        } else {
            let messageListNode = existingMessages[0];

            while (messageListNode) {
                const messageListNodeTime = messageListNode.getAttribute('timestamp');

                if (!messageListNodeTime) {
                    throw new Error(
                        `Child ${messageListNode.id} has no 'timestamp' attribute`
                    );
                }

                if (messageListNodeTime > timestamp) {
                    break;
                }

                messageListNode = messageListNode.nextSibling;
            }

            messageListElement.insertBefore(div, messageListNode);
        }
    }
    return div;
}

// Displays a Message in the UI.
function displayMessage(id, timestamp, name, text, picUrl, imageUrl) {
    var div = document.getElementById(id) || createAndInsertMessage(id, timestamp);

    // profile picture
    if (picUrl) {
        div.querySelector('.pic').style.backgroundImage = 'url(' + addSizeToGoogleProfilePic(picUrl) + ')';
    }

    div.querySelector('.name').textContent = name;
    var messageElement = div.querySelector('.message');

    if (messageListElement != null) {
        if (text) { // If the message is text.
            messageElement.textContent = text;
            // Replace all line breaks by <br>.
            messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');
        } else if (imageUrl) { // If the message is an image.
            var image = document.createElement('img');
            image.addEventListener('load', function () {
                messageListElement.scrollTop = messageListElement.scrollHeight;
            });
            image.src = imageUrl + '&' + new Date().getTime();
            messageElement.innerHTML = '';
            messageElement.appendChild(image);
        }
        // Show the card fading-in and scroll to view the new message.
        setTimeout(function () { div.classList.add('visible') }, 1);
        messageListElement.scrollTop = messageListElement.scrollHeight;
        messageInputElement.focus();
    }
}

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
if (messageFormElement != null) {
    messageFormElement.addEventListener('submit', onMessageFormSubmit);
}
if (signOutButtonElement != null) {
    signOutButtonElement.addEventListener('click', signOutUser);
}
if (signInButtonElement != null) {
    signInButtonElement.addEventListener('click', signIn);
}

// Toggle for the button.
if (messageInputElement != null) {
    messageInputElement.addEventListener('keyup', toggleButton);
    messageInputElement.addEventListener('change', toggleButton);
}

// Events for image upload.
if (mediaCaptureElement && imageButtonElement != null) {
    imageButtonElement.addEventListener('click', function (e) {
        e.preventDefault();
        mediaCaptureElement.click();
    });
    mediaCaptureElement.addEventListener('change', onMediaFileSelected);
}

getPerformance();
initFirebaseAuth();
loadMessages();

// Custom Scripts

document.addEventListener("DOMContentLoaded", () => {
    var spaceModal = document.getElementById("create-space-modal");
    var collectionModal = document.getElementById("create-collection-modal");
    var resourceModal = document.getElementById("create-resource-modal");

    var addSpaceBtn = document.getElementById("create-space-modal-button");
    var addCollectionBtn = document.getElementById("create-collection-modal-button");
    var addResourceBtn = document.getElementById("create-resource-modal-button");

    var submitAddSpaceBtn = document.getElementById("form-submit-add-space");
    var submitAddCollectionBtn = document.getElementById("form-submit-add-collection");
    var submitAddResourceBtn = document.getElementById("form-submit-add-resource");


    var closeButton = document.getElementsByClassName("close")[0];
    var boardButton = document.getElementById("create-board-button");
    var existingBoardButton = document.getElementById("existing-board-button");
    var createBoardDiv = document.getElementsByClassName("create-board")[0];
    var currentBoard = document.getElementById("board-options");
    var boardFile = document.getElementById("boardFile");
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
    } else if (addCollectionBtn) {
        addCollectionBtn.addEventListener("click", (e) => {
            collectionModal.style.display = "block";
        });
    } else if (addResourceBtn) {
        addResourceBtn.addEventListener("click", (e) => {
            resourceModal.style.display = "block";
        })
    }

    // async function populateSpacesSelect() {
    //     const spaceCol = collection(db, 'spaces');
    //     const spaceSnapshot = await getDocs(spaceCol);
    //     const spaceList = spaceSnapshot.docs.map(doc => doc.data());

    //     let max = spaceList.length;
    //     let select = document.getElementById("space-select");

    //     for (var i = 0; i <= max; i++) {
    //         var opt = document.createElement('option');
    //         opt.value = spaceList[i].title;
    //         opt.innerHTML = spaceList[i].title;
    //         select.appendChild(opt);
    //     }
    // }

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
            let title = document.querySelector('#create-space-modal #title').value;
            var image;
            if (document.getElementById('image-link')) {
                image = document.getElementById('image-link').value;
            }
            let id = toKebabCase(title);
            let description = document.getElementById('desc').value;

            if (!image) {
                image = 'https://i.some-random-api.ml/onUSIniyyq.png';
            }

            //Save Form Data To Firebase
            setDoc(doc(db, "spaces", id), {
                title: title,
                image: image,
                description: description,
                collections: []
            }).then(() => {
                console.log("Data saved");

                // Refresh page to show all spaces
                location.reload();
            }).catch((error) => {
                console.log(error);
            });

            //alert
            alert("Your new space was added successfully!");
            spaceModal.style.display = "none";
        })
    }

    if (submitAddCollectionBtn) {
        submitAddCollectionBtn.addEventListener("click", (e) => {

            //Get Form Values
            let title = document.querySelector('#title').value;

            let currentSpace = JSON.parse(localStorage.getItem("currentSpace"));
            let spaceTitle = currentSpace.title;
            let spaceId = toKebabCase(spaceTitle);

            let collectionId = toKebabCase(title);

            let image = document.getElementById('link').value;
            // let id = toKebabCase(title);
            let description = document.getElementById('desc').value;

            if (!image) {
                image = 'https://i.some-random-api.ml/onUSIniyyq.png';
            }


            // Add the new collection to the collections db 
            setDoc(doc(db, "collections", collectionId), {
                title: title,
                image: image,
                description: description,
                resources: []
            })

            // Update current space
            async function updateCurrentSpace(spaceId) {
                const docRef = doc(db, "spaces", spaceId);
                const docSnap = await getDoc(docRef);
                const spaceData = docSnap.data();
                localStorage.setItem("currentSpace", JSON.stringify(spaceData));
                location.reload();
            }

            // Add the collection to a space
            async function saveCollectionData() {
                await updateDoc(doc(db, "spaces", spaceId), {
                    collections: arrayUnion(title)
                }).then(() => {
                    console.log("Data saved");

                    // Update current space
                    updateCurrentSpace(spaceId);
                }).catch((error) => {
                    console.log(error);
                });
            }

            saveCollectionData();

            //alert
            alert("Your new collection was added successfully!");
            collectionModal.style.display = "none";
        })
    }

    if (submitAddResourceBtn) {
        submitAddResourceBtn.addEventListener("click", (e) => {

            console.log("OJIJNIJIJ")


            //Get Form Values
            let title = document.querySelector('#title').value;

            let currentCollection = JSON.parse(localStorage.getItem("currentCollection"));
            let collectionTitle = currentCollection.title;
            let collectionId = toKebabCase(collectionTitle);

            let resourceId = toKebabCase(title);

            let image = document.getElementById('image-link').value;
            // let id = toKebabCase(title);
            let description = document.getElementById('desc').value;
            let link = document.querySelector("#link").value;

            if (!image) {
                image = 'https://i.some-random-api.ml/onUSIniyyq.png';
            }


            // Add the new collection to the collections db 
            setDoc(doc(db, "resources", resourceId), {
                title: title,
                image: image,
                link: link,
                description: description
            })

            // Update current collection
            async function updateCollection(collectionId) {
                const docRef = doc(db, "collections", collectionId);
                const docSnap = await getDoc(docRef);
                const collectionData = docSnap.data();
                localStorage.setItem("currentCollection", JSON.stringify(collectionData));
                location.reload();
            }

            // Add the collection to a space
            async function saveCollectionData() {
                await updateDoc(doc(db, "collections", collectionId), {
                    resources: arrayUnion(title)
                }).then(() => {
                    console.log("Data saved");

                    // Update current space
                    updateCollection(collectionId);
                }).catch((error) => {
                    console.log(error);
                });
            }

            updateCollection();

            saveCollectionData();

            //alert
            alert("Your new resource was added successfully!");
            resourceModal.style.display = "none";
        })
    }


    if (closeButton) {
        closeButton.addEventListener("click", (e) => {
            if (spaceModal) {
                spaceModal.style.display = "none";
            } else if (collectionModal) {
                collectionModal.style.display = "none";
            } else if (resourceModal) {
                resourceModal.style.display = "none";
            }
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
});
