importScripts(
  "https://www.gstatic.com/firebasejs/9.7.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.7.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
    apiKey: "AIzaSyCBMZ6k72_-y4YbiM4cIFysqIISvK-Yv9E",
    authDomain: "share-meals-dev.firebaseapp.com",
    projectId: "share-meals-dev",
    storageBucket: "share-meals-dev.appspot.com",
    messagingSenderId: "147057525950",
    appId: "1:147057525950:web:7fff40b5a5aea8a9ad0aef",
    measurementId: "G-XVSD123QJD",
});
const messaging = firebase.messaging();

/*
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = 'Background Message Title';
  const notificationOptions = {
    body: 'Background Message body.',
    icon: '/firebase-logo.png'
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);
});
*/
