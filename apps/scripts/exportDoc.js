const {
    initializeFirebaseApp,
    backupFromDoc
} = require('firestore-export-import');
const prompt = require("prompt-sync")({ sigint: true });

const environment = prompt('Environment: ');
const collectionName = prompt('Collection Name: ');
const docId = prompt('Doc ID: ');

const serviceAccount = require(`./serviceAccountKey.${environment}.json`);
const firestore = initializeFirebaseApp(serviceAccount);

backupFromDoc(firestore, collectionName, docId).then((response) => {
    console.log(JSON.stringify(response));
});
