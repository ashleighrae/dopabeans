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

const toKebabCase = str =>
    str &&
    str
        .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
        .map(x => x.toLowerCase())
        .join('-');

// Add spaces to to home page
async function getSpacesHomepage(datab) {
    const spaceCol = collection(datab, 'spaces');
    const spaceSnapshot = await getDocs(spaceCol);
    const spaceList = spaceSnapshot.docs.map(doc => doc.data());

    spaceList.forEach(element => {
        // Add div to category section
        const categoryDiv = document.createElement("div");
        categoryDiv.classList.add("category");

        // Add image
        if (element.image) {
            var img = document.createElement('img');
            img.src = element.image;
            categoryDiv.appendChild(img);
        }

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
            });
        }
    });
}

// Populate space page
async function populateSpacePage(datab, space, docType, link, localLink) {
    document.getElementById('pageHeader').innerHTML = space.title;

    if (docType) {
        for (let i = 0; i < docType.length; i++) {

            // Get collection details
            const docRef = doc(datab, "collections", toKebabCase(docType[i]));
            const docSnap = await getDoc(docRef);
            const collection = docSnap.data();

            if (collection) {

                // Add div to category section
                const categoryDiv = document.createElement("div");
                categoryDiv.classList.add("category");

                // Add image
                if (collection.image) {
                    var img = document.createElement('img');
                    img.src = collection.image;
                    categoryDiv.appendChild(img);
                }

                // Add link
                const pageLink = document.createElement("a");
                pageLink.href = link;
                categoryDiv.appendChild(pageLink);

                // Add header
                if (collection.title) {
                    const header = document.createElement("h3");
                    const title = document.createTextNode(collection.title);
                    header.appendChild(title);
                    const headerDiv = document.createElement("div");
                    headerDiv.appendChild(header);
                    pageLink.appendChild(headerDiv);
                }

                // Add collection objects to grid space
                var div = document.getElementsByClassName('categoryGrid')[0];
                div.prepend(categoryDiv);

                // Set current collection
                if (pageLink) addEventListener("click", (e) => {
                    localStorage.setItem(localLink, JSON.stringify(collection));
                });
            }
        }
    }
}

// Populate collection page
async function populateCollectionPage(datab, space, docType, link, localLink) {
    document.getElementById('pageHeader').innerHTML = space.title;

    for (let i = 0; i < docType.length; i++) {

        // Get resource details
        const docRef = doc(datab, "resources", toKebabCase(docType[i]));
        const docSnap = await getDoc(docRef);
        const resource = docSnap.data();

        if (resource) {
            console.log(resource);

            // Add div to category section
            const categoryDiv = document.createElement("div");
            categoryDiv.classList.add("grid-item");

            // Add image
            if (resource.image) {
                var img = document.createElement('img');
                img.src = resource.image;
                categoryDiv.appendChild(img);
            }

            // Add link
            if (resource.link) {
                const linkObject = document.createElement("a");
                linkObject.href = resource.link;
                categoryDiv.appendChild(linkObject);
            }

            // Add container div
            const containerDiv = document.createElement("div");
            containerDiv.classList.add("container");

            // Add header and link
            const pageLink = document.createElement("a");
            pageLink.href = link;
            if (resource.title) {
                const header = document.createElement("h3");
                const title = document.createTextNode(resource.title);
                header.appendChild(title);
                pageLink.appendChild(header);
                containerDiv.appendChild(pageLink);
            }

            // Add description
            if (resource.description) {
                const para = document.createElement("p");
                const desc = document.createTextNode(resource.description);
                para.appendChild(desc);
                containerDiv.appendChild(para);
            }

            categoryDiv.appendChild(containerDiv);

            // Add collection objects to grid space
            var div = document.getElementsByClassName('grid')[0];
            div.prepend(categoryDiv);

            // Set current collection
            if (pageLink) addEventListener("click", (e) => {
                localStorage.setItem(localLink, JSON.stringify(resource));
            });
        }
    }
}

// Populate resource page
async function populateResourcePage(datab) {
    const resourceObj = JSON.parse(localStorage.getItem('currentResource'));

    if (resourceObj) {
        const docRef = doc(datab, "resources", toKebabCase(resourceObj.title));
        const docSnap = await getDoc(docRef);
        const resource = docSnap.data();

        if (resource.title)
            document.getElementsByClassName('resourceHeading')[0].innerHTML =
                resource.title;
        if (resource.link)
            document.getElementsByClassName('resourceLink')[0].href =
                resource.link;
        if (resource.image)
            document.getElementsByClassName('resourceImageElement')[0].src =
                resource.image;
        if (resource.description)
            document.getElementsByClassName('resourceDescriptionPara')[0].innerHTML =
                resource.description;
    }
}

// Custom Scripts
document.addEventListener("DOMContentLoaded", () => {
    // Add spaces to home page
    if (window.location.href.includes("index") || window.location.href.includes("spaces.html")) getSpacesHomepage(db);

    // Populate space page
    if (window.location.href.includes("space.html"))
        populateSpacePage(
            db,
            JSON.parse(localStorage.getItem('currentSpace')),
            JSON.parse(localStorage.getItem('currentSpace')).collections,
            "/collection/collection.html", "currentCollection");

    // Populate collection page
    if (window.location.href.includes("collection.html"))
        populateCollectionPage(
            db,
            JSON.parse(localStorage.getItem('currentCollection')),
            JSON.parse(localStorage.getItem('currentCollection')).resources,
            "../resource.html", "currentResource");

    if (window.location.href.includes("resource.html")) populateResourcePage(db);
})
