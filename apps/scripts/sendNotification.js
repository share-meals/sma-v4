const admin = require('firebase-admin');
const {getMessaging} = require('firebase-admin/messaging');
const fs = require('fs');
const yaml = require('js-yaml');
const input = yaml.load(fs.readFileSync('./sendNotification.yaml'));
const environment = input.ENVIRONMENT;
const token = input.TOKEN
const serviceAccount = require(`./serviceAccountKey.${environment}.json`);


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
getMessaging().send({
    notification: {
	title: 'title title title',
	body: 'body body body'
    },
    token: token
}).then((response) => {
    // Response is a message ID string.
    console.log('Successfully sent message:', response);
}).catch((error) => {
    console.log('Error sending message:', error);
});
