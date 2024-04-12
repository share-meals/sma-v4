const admin = require('firebase-admin');
const {getMessaging} = require('firebase-admin/messaging');
const fs = require('fs');
const yaml = require('js-yaml');
const input = yaml.load(fs.readFileSync('./sendToTopic.yaml'));
const environment = input.ENVIRONMENT;
const topic = input.TOPIC
const serviceAccount = require(`./serviceAccountKey.${environment}.json`);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
getMessaging().send({
    notification: {
	title: 'title title title',
	body: 'body body body'
    },
    condition: `'${topic}' in topics`
}).then((response) => {
    // Response is a message ID string.
    console.log('Successfully sent message:', response);
}).catch((error) => {
    console.log('Error sending message:', error);
});
