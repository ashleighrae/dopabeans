# Dopabeans
This github project has been produced as a response to Assessment C: Design Prototype Brief in the course DECO3500 - Social &amp; Mobile Computing at the University of Queensland.

From the beginning of this project, our team set out to explore how we could make communication and creation of friendships easier for adults with ASD. As a result, our design team developed what we think to be a viable solution by going through an iterative design and prototyping process to understand and build a product based on the needs of our users.

## Project Overview & Structure
This repository consists of the source code for the prototype showcased at the trade show  and a wiki document where all documentation can be read.

### Link to Source Code
https://github.com/ashleighrae/dopabeans

### Links to Wiki, Repository Contents & Tradeshow Material Documentation
All wiki links, repository content and tradeshow materials can be accessed via the wiki link below:
https://github.com/ashleighrae/dopabeans/wiki/Dopabeans-Wiki-Page

## Cozmos Deployment 
To serve the project on your local computer follow these steps:

Required: 
- Node.js installed on your device,
- Git Bash or any built-in terminal shell that supports Unix-based command line features, and
- a code editor or IDE.

The following steps will detail how you can host the application on your local computer and view it in your browser (chrome preferred), including the setup for the chrome extension.

### Cloning the Repository
1. Open **Git Bash** (or similar application).
2. Change the current working directory to the location where you want the cloned directory.
3. Add the following code to the command line:
```bash
git clone https://github.com/ashleighrae/dopabeans.git
```
4. Press **Enter** to create your local clone.

### Installing the Chrome Extension
1. Go to chrome://extensions/ and check the box for **Developer mode** in the top right corner of your chrome browser window.
2. Select the **Load unpacked extension** button and select the **public** folder inside of the main project folder to install the extension.

### Serving the Project Locally
1. Open up this project in a code editor or IDE.
2. Open up the terminal and run the following command:
```bash
npm install
```
3. Install the CLI by running the following npm command:
```bash
npm -g install firebase-tools
```
4. Authorize the Firebase CLI by running the following command:
```bash
firebase login
```
5. Associate your app with the dopabeans Firebase project by running the following command:
```bash
firebase use --add
```
6. Select the dopabeans project (you must first have permissions to acess the firebase project) and chose any alias

7. When the installation is complete, run this command in the dopabeans project folder:
```bash
npm run start
```
8. In another terminal tab start the server:
```bash
firebase serve --only hosting
```
