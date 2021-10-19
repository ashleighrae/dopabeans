import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.1.2/firebase-app.js';
import { collection, getFirestore, getDocs, doc, getDoc, orderBy, limit, query } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-analytics.js";

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

async function populateResources(resource, link, localLink) {
    if (resource) {
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
        if (resource.link && !resource.image && !resource.description) {
            const linkDiv = document.createElement("div");
            linkDiv.classList.add("link-only");
            linkDiv.classList.add("container");
            const linkObject = document.createElement("a");
            linkObject.classList.add("flexyflex");
            linkObject.target = "_blank";
            linkObject.href = resource.link;
            const icon = document.createElement("i");
            icon.classList.add("fas");
            icon.classList.add("fa-link");
            icon.classList.add("linkIcon");
            linkObject.appendChild(icon);
            const headingLink = document.createElement("h3");
            const headingText = document.createTextNode(resource.title);
            headingLink.appendChild(headingText);
            linkObject.append(headingLink);
            linkDiv.appendChild(linkObject);
            categoryDiv.appendChild(linkDiv);
        } else {
            // Add container div
            const containerDiv = document.createElement("div");
            containerDiv.classList.add("container");

            // Add header and link
            const pageLink = document.createElement("a");
            pageLink.href = link;
            if (resource.title && !resource.image && !resource.link) {
                const headerDiv = document.createElement("div");
                headerDiv.classList.add("text-only");
                headerDiv.classList.add("container");
                const header = document.createElement("h3");
                const title = document.createTextNode(resource.title);
                header.appendChild(title);
                headerDiv.appendChild(header);
                categoryDiv.appendChild(headerDiv);
            } else if (resource.title) {
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

            // Set current collection
            if (pageLink)
                pageLink.addEventListener("click", (e) => {
                    localStorage.setItem(localLink, JSON.stringify(resource));
                });
        }

        // Add collection objects to grid space
        var $grid = $('.grid').masonry({
            // options...
            initLayout: false,
            // percentPosition: true,
            itemSelector: '.grid-item',
            columnWidth: '.grid-sizer',
            gutter: 10
        });

        $grid.masonry()
            .append(categoryDiv)
            .masonry('appended', categoryDiv)
            // layout
            .masonry();

        //div.prepend(categoryDiv);
    }
}

// Add spaces to to home page
async function getSpacesHomepage(datab) {
    const spaceCol = collection(datab, 'spaces');
    const spaceSnapshot = await getDocs(spaceCol);
    const spaceList = spaceSnapshot.docs.map(doc => doc.data());

    if (spaceList)
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
                    localStorage.setItem('currentSpace', JSON.stringify(element));
                });
            }
        });
}

// Populate space page
async function populateSpacePage(datab, space, docType, link, localLink) {
    document.getElementById('pageHeader').innerHTML = space.title;

    if (space.description !== "" && space.description) {
        document.getElementsByClassName('category-description-para')[0].innerHTML = space.description;
    } else {
        document.getElementsByClassName('category-description')[0].style.display = "none";
    }

    if (docType)
        docType.forEach(async element => {
            // Get collection details
            const docRef = doc(datab, "collections", toKebabCase(element));
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

                populateCollectionPage(
                    datab,
                    collection,
                    collection.resources,
                    "../resource.html",
                    "currentResource",
                    false);

                // Set current collection
                if (pageLink) pageLink.addEventListener("click", (e) => {
                    localStorage.setItem(localLink, JSON.stringify(collection));
                });
            }
        });
}

// Populate collection page
async function populateCollectionPage(datab, space, docType, link, localLink, headerNeeded) {
    if (headerNeeded) document.getElementById('pageHeader').innerHTML = space.title;

    if (space.description !== "" && space.description) {
        document.getElementsByClassName('category-description-para')[0].innerHTML = space.description;
    } else {
        document.getElementsByClassName('category-description')[0].style.display = "none";
    }

    if (docType)
        docType.forEach(async element => {
            // Get resource details
            const docRef = doc(datab, "resources", toKebabCase(element));
            const docSnap = await getDoc(docRef);
            const resource = docSnap.data();

            populateResources(resource, link, localLink);
        });
}

// Populate resources on index page
async function populateResourceIndexPage(datab, link) {
    const resourcesCol = collection(datab, 'resources');
    const queriedCol = query(resourcesCol, orderBy("timestamp"), limit(15));
    const resourcesSnapshot = await getDocs(queriedCol);
    const resourcesList = resourcesSnapshot.docs.map(doc => doc.data());

    if (resourcesList) {
        resourcesList.forEach(resource => {

            populateResources(resource, link, "currentResource");
        });
    }
}

// Populate resource page
async function populateResourcePage(datab) {
    const resourceObj = JSON.parse(localStorage.getItem('currentResource'));

    if (resourceObj) {
        const docRef = doc(datab, "resources", toKebabCase(resourceObj.title));
        const docSnap = await getDoc(docRef);
        const resource = docSnap.data();

        if (resource.title) {
            document.getElementsByClassName('resourceHeading')[0].innerHTML =
                resource.title
        } else {
            document.getElementsByClassName('resourceHeading')[0].style.display = "none";
        }
        if (resource.link) {
            document.getElementsByClassName('resourceLink')[0].href =
                resource.link;
        } else {
            document.getElementsByClassName('resourceLink')[0].style.display = "none";
        }
        if (resource.image) {
            document.getElementsByClassName('resourceImageElement')[0].src =
                resource.image;
        } else {
            document.getElementsByClassName('resourceImageDiv')[0].style.display = "none";
        }
        if (resource.description) {
            document.getElementsByClassName('resourceDescriptionPara')[0].innerHTML =
                resource.description;
        } else {
            document.getElementsByClassName('resourceDescription')[0].style.display = "none";
        }
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
            "../resource.html", "currentResource", true);

    // Populate resource page
    if (window.location.href.includes("resource.html"))
        populateResourcePage(db);

    // Add current resources to index page.
    if (window.location.href.includes("index.html"))
        populateResourceIndexPage(db, "../resource.html");
})
