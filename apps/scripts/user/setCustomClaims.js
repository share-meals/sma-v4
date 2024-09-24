/*
setCustomClaims.yaml

email: a@b.com
custom_claims:
  community--abc: claim_value1
  community-123: claim_value2
*/

const admin = require('firebase-admin');
const fs = require('fs');
const yaml = require('js-yaml');

// Load Firebase Admin SDK service account key
const serviceAccount = require('../serviceAccountKey.live.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Function to read and parse the YAML file
const loadYamlFile = (filePath) => {
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return yaml.load(fileContents);
  } catch (err) {
    console.error(`Error reading YAML file: ${err}`);
    return null;
  }
};

// Function to update custom claims in Firebase
const updateCustomClaims = async (email, customClaims) => {
  try {
    // Retrieve user by email
    const userRecord = await admin.auth().getUserByEmail(email);
    const userId = userRecord.uid;

    // Set custom claims
    await admin.auth().setCustomUserClaims(userId, customClaims);
    console.log(`Custom claims updated for user with email ${email}`);
  } catch (error) {
    console.error(`Error updating custom claims for ${email}: ${error}`);
  }
};

// Main function to read YAML and update Firebase custom claims
const main = async () => {
  // Path to the YAML file
  const yamlFilePath = './setCustomClaims.yaml';

  // Load YAML file data
  const yamlData = loadYamlFile(yamlFilePath);
  if (!yamlData) {
    console.error('Invalid YAML data');
    return;
  }

    const { email, custom_claims } = yamlData;

  if (!email || !custom_claims) {
    console.error('YAML file must contain user_id and custom_claims');
    return;
  }

  // Update custom claims in Firebase
  await updateCustomClaims(email, custom_claims);
};

// Execute the main function
main();
