const admin = require('firebase-admin');
const {getMessaging} = require('firebase-admin/messaging');
const prompt = require('prompt-sync')({ sigint: true });
const environment = process.argv[2] || prompt('Environment: ');
const token = process.argv[3] || prompt('Token: ');
const serviceAccount = require(`./serviceAccountKey.${environment}.json`);


console.log(serviceAccount);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
getMessaging().send({
    data: {
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
