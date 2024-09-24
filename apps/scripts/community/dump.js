const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.live.json');
const fs = require('fs');

// Initialize Firestore using the service account key file
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Get a Firestore instance
const db = admin.firestore();

// Define the path for the JSON file
const jsonFilePath = './communities.json';

// Reference to the communities collection
const collectionRef = db.collection('communities');

// Array to hold fetched documents
let communitiesData = [];

// Fetch documents from the collection
collectionRef.get()
  .then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      // Push each document's data to the array
	communitiesData.push({...doc.data(), id: doc.id});
    });

    // Write the array of documents to a JSON file
    fs.writeFile(jsonFilePath, JSON.stringify(communitiesData, null, 2), (err) => {
      if (err) {
        console.error('Error writing JSON file:', err);
      } else {
        console.log('JSON file saved successfully.');
      }
    });
  })
  .catch((error) => {
    console.error('Error fetching documents:', error);
  });
