const admin = require('firebase-admin');
const readline = require('readline');
const fs = require('fs');

// Initialize Firebase Admin SDK
const serviceAccount = require('../serviceAccountKey.live.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function getUserByEmail(email) {
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log('User record:', userRecord);
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
}

rl.question('Please enter the user email address: ', (email) => {
  getUserByEmail(email);
  rl.close();
});
