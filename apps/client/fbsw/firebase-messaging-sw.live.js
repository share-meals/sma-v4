importScripts(
  "https://www.gstatic.com/firebasejs/9.7.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.7.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
    apiKey: "AIzaSyB5Q3zqOqAbmrYoygQvVVewJzfogDRr8bw",
    authDomain: "share-meals-9477b.firebaseapp.com",
    projectId: "share-meals-9477b",
    storageBucket: "share-meals-9477b.appspot.com",
    messagingSenderId: "220363733900",
    appId: "1:220363733900:web:88175ed75fe861b9c074a9",
    measurementId: "G-V0W7H7TEYV",
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
