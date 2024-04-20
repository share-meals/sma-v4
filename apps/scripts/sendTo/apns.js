const apn = require('apn');
const fs = require('fs');
const yaml = require('js-yaml');

const input = yaml.load(fs.readFileSync('../input-apns.yaml', 'utf-8'));

// Set up APNs connection options
const options = {
    token: {
        key: `./apple_key_${input.ENVIRONMENT}.p8`,
        keyId: input.KEY_ID,
        teamId: input.TEAM_ID
    },
    production: false // Set to true if you're using production APNs server
};

// Initialize APNs provider
const apnProvider = new apn.Provider(options);

// The device token to validate
const deviceToken = input.APNS_TOKEN;

// Create a notification with an empty payload
const notification = new apn.Notification();

// Set the device token
notification.topic = input.BUNDLE_ID; // Your app's bundle ID
notification.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now
notification.badge = 0; // Clear badge count
notification.sound = 'ping.aiff'; // Sound to play upon receipt
notification.alert = 'hello world'; // Empty alert to keep it silent
notification.payload = {}; // Empty payload

// Send the notification to the device token
apnProvider.send(notification, deviceToken)
    .then(response => {
        console.log('Notification sent:', response.sent);
        console.log('Failed tokens:', response.failed);
        console.log('Error details:', response.details);
    })
    .catch(error => {
        console.error('Error sending notification:', error);
    });
