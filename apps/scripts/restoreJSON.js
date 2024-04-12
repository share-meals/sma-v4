const {
    initializeFirebaseApp,
    restore
} = require('firestore-export-import');
const prompt = require('prompt-sync')({ sigint: true });

const environment = prompt('Environment: ');
const jsonPath = prompt('JSON Path: ');

const serviceAccount = require(`./serviceAccountKey.${environment}.json`);
const firestore = initializeFirebaseApp(serviceAccount);

restore(firestore, jsonPath);
