import { ref, getStorage, uploadBytesResumable, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.1.2/firebase-storage.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.1.2/firebase-app.js';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'https://www.gstatic.com/firebasejs/9.1.2/firebase-auth.js';
import { getDatabase, onValue } from 'https://www.gstatic.com/firebasejs/9.1.2/firebase-database.js';
import { collection, addDoc, getFirestore, setDoc, getDocs, doc, query, orderBy, limit, onSnapshot, updateDoc, serverTimestamp, getDoc } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-firestore.js";
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

// Add spaces to to home page
async function getSpacesHomepage(datab) {
    const spaceCol = collection(datab, 'spaces');
    const spaceSnapshot = await getDocs(spaceCol);
    const spaceList = spaceSnapshot.docs.map(doc => doc.data());
    console.log("Spaces: ", spaceList);

    spaceList.forEach(element => {
        // Add div to category section
        const categoryDiv = document.createElement("div");
        categoryDiv.classList.add("category");

        // Add image
        var img = document.createElement('img');
        img.src = element.image;
        categoryDiv.appendChild(img);

        // Add link
        const spacePageLink = document.createElement("a");
        spacePageLink.href = "/spaces/space.html";
        categoryDiv.appendChild(spacePageLink);

        // Add header
        const header = document.createElement("h3");
        const title = document.createTextNode(element.title);
        header.appendChild(title);
        const headerDiv = document.createElement("div");
        headerDiv.appendChild(header);
        spacePageLink.appendChild(headerDiv);

        // Add space objects to grid space
        var spaceDiv = document.getElementsByClassName('categoryGridSpace')[0];
        spaceDiv.prepend(categoryDiv);

        // Set current space
        if (spacePageLink) {
            spacePageLink.addEventListener("click", (e) => {
                localStorage.setItem('currentSpace', JSON.stringify(element)); //set

                /* Log current space */
                console.log("Current space on click: ", localStorage.getItem('currentSpace'));
            });
        }
    });
}

// Populate collection page
async function populateSpacePage(datab) {
    const space = JSON.parse(localStorage.getItem('currentSpace'));

    for (let i = 0; i < space.collections.length; i++) {

        // Get collection details
        const docRef = doc(datab, "collections", space.collections[i]);
        const docSnap = await getDoc(docRef);
        const collection = docSnap.data();

        // Add div to category section
        const categoryDiv = document.createElement("div");
        categoryDiv.classList.add("category");

        // Add image
        var img = document.createElement('img');
        img.src = collection.image;
        categoryDiv.appendChild(img);

        // Add link
        const pageLink = document.createElement("a");
        pageLink.href = "/collections/collection.html";
        categoryDiv.appendChild(pageLink);

        // Add header
        const header = document.createElement("h3");
        const title = document.createTextNode(collection.title);
        header.appendChild(title);
        const headerDiv = document.createElement("div");
        headerDiv.appendChild(header);
        pageLink.appendChild(headerDiv);

        // Add collection objects to grid space
        var div = document.getElementsByClassName('categoryGrid')[0];
        div.prepend(categoryDiv);

        // Set current collection
        if (pageLink) addEventListener("click", (e) => {
            localStorage.setItem('currentCollection', JSON.stringify(collection)); //set

            /* Log current collection */
            console.log("Current collection: ", localStorage.getItem('currentCollection'));
        });
    }
}

// Custom Scripts
document.addEventListener("DOMContentLoaded", () => {
    // Add spaces to home page
    if (window.location.href.includes("index") || window.location.href.includes("spaces.html")) getSpacesHomepage(db);

    // Populate space page
    if (window.location.href.includes("space.html")) populateSpacePage(db);
})
