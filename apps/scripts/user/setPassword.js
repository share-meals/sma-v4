/*
setPassword.yaml

email: a@b.com
newPassword: abc123
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

const updatePassword = async (email, newPassword) => {
  try {
    // Retrieve user by email
    const userRecord = await admin.auth().getUserByEmail(email);
    const userId = userRecord.uid;

    await admin.auth().updateUser(userId, {password: newPassword});
    console.log(`Password updated successfully for user: ${email}`);
  } catch (error) {
    console.error("Error updating password:", error);
  }
};

const main = async () => {
  // Path to the YAML file
  const yamlFilePath = './setPassword.yaml';

  // Load YAML file data
  const yamlData = loadYamlFile(yamlFilePath);
  if (!yamlData) {
    console.error('Invalid YAML data');
    return;
  }

    const { email, newPassword } = yamlData;

  if (!email || !newPassword) {
    console.error('YAML file must contain email and newPassword');
    return;
  }

  await updatePassword(email, newPassword);
};

// Execute the main function
main();
