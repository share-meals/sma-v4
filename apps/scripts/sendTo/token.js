const admin = require('firebase-admin');
const {getMessaging} = require('firebase-admin/messaging');
const fs = require('fs');
const yaml = require('js-yaml');
const input = yaml.load(fs.readFileSync('./input-token.yaml'));
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
    token: input.TOKEN
}).then((response) => {
    // Response is a message ID string.
    console.log('Successfully sent message:', response);
}).catch((error) => {
    console.log('Error sending message:', error);
});
