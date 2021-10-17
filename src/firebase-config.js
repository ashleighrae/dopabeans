/**
 * To find your Firebase config object:
 * 
 * 1. Go to your [Project settings in the Firebase console](https://console.firebase.google.com/project/_/settings/general/)
 * 2. In the "Your apps" card, select the nickname of the app for which you need a config object.
 * 3. Select Config from the Firebase SDK snippet pane.
 * 4. Copy the config object snippet, then add it here.
 */
const config = {
    apiKey: 'AIzaSyAK6BS-eYLMsXlJK2t8-cQfjQF8rh_idDQ',
    authDomain: 'dopabeans-cb511.firebaseapp.com',
    projectId: 'dopabeans-cb511',
    storageBucket: 'dopabeans-cb511.appspot.com',
    messagingSenderId: '402132301454',
    appId: '1:402132301454:web:b5a2006a303f66f0bcfbdf',
    measurementId: 'G-498CLKKQYT',
};

export function getFirebaseConfig() {
  if (!config || !config.apiKey) {
    throw new Error('No Firebase configuration object provided.' + '\n' +
    'Add your web app\'s configuration object to firebase-config.js');
  } else {
    return config;
  }
}