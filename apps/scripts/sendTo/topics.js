const admin = require('firebase-admin');
const {getMessaging} = require('firebase-admin/messaging');
const fs = require('fs');
const yaml = require('js-yaml');
const input = yaml.load(fs.readFileSync('./input-topics.yaml'));
const environment = input.ENVIRONMENT;
const serviceAccount = require(`../serviceAccountKey.${environment}.json`);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
getMessaging().send({
    notification: {
	title: input.TITLE,
	body: input.BODY,
    },
    data: input.DATA,
    condition: input.TOPICS.map((t) => `'${t}' in topics`).join(' || ')
}).then((response) => {
    // Response is a message ID string.
    console.log('Successfully sent message:', response);
}).catch((error) => {
    console.log('Error sending message:', error);
});
