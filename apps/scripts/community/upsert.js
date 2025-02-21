const admin = require('firebase-admin');
const fs = require('fs');
const yaml = require('js-yaml');
const {communitySchema} = require('@sma-v4/schema');

// Function to read and parse YAML file
function readYAMLFile(filePath) {
  try {
    // Read YAML file
    const yamlContent = fs.readFileSync(filePath, 'utf8');
    // Parse YAML content
    const data = yaml.load(yamlContent);
    return data;
  } catch (error) {
    console.error('Error reading YAML file:', error);
    return null;
  }
}

// Function to validate post section of YAML file against schema
function validateCommunitySchema(yamlData) {
  try {
    const communityData = yamlData.community;
    communitySchema
      .partial()
      .strict()
      .parse(communityData);
    console.log('Community schema is valid.');
    return communityData;
  } catch (error) {
    console.error('Error validating community schema:', error.errors);
    return null;
  }
}

// Function to initialize Firebase Admin SDK with emulator settings
function initializeFirebaseEmulator() {
  const emulatorConfig = {
    projectId: 'share-meals-dev',
    databaseName: 'localhost',
    servicePath: 'localhost',
    port: 8080,
  };

  const firestoreSettings = {
    host: `${emulatorConfig.servicePath}:${emulatorConfig.port}`,
    ssl: false
  };

  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: `http://${emulatorConfig.servicePath}:${emulatorConfig.port}?ns=${emulatorConfig.projectId}`,
    projectId: 'share-meals-dev'
  });

  admin.firestore().settings(firestoreSettings);
}

// Function to upsert data into Firestore
async function upsertCommunityToFirestore(communityData, environment) {
  try {
    if (environment === 'emulator') {
      initializeFirebaseEmulator();
      console.log('Initialized Firebase Emulator for Firestore.');
    } else {
      // Load service account JSON for other environments
      const serviceAccountPath = `../serviceAccountKey.${environment}.json`;
      const serviceAccount = require(serviceAccountPath);
      const firebaseAdminConfig = {
        credential: admin.credential.cert(serviceAccount)
      };
      admin.initializeApp(firebaseAdminConfig);
      console.log(`Initialized Firebase for environment: ${environment}`);
    }

    const collectionRef = admin.firestore().collection('communities');
    if (communityData.id) {
      // Update existing document
      await collectionRef.doc(communityData.id).set(communityData, {merge: true});
      console.log(`Updated community with ID ${communityData.id} in Firestore.`);
    } else {
      // Create new document
      const docRef = await collectionRef.add(communityData);
      console.log(`Added new community with ID ${docRef.id} to Firestore.`);
    }
  } catch (error) {
    console.error('Error upserting community to Firestore:', error);
  }
}

// Example usage
const filePath = './upsert.yaml'; // Replace with your YAML file path
const yamlData = readYAMLFile(filePath);
if (yamlData && yamlData.community && yamlData.environment) {
  console.log('Validating community schema...');
  const communityData = validateCommunitySchema(yamlData);
  if (communityData) {
    console.log('Upserting community to Firestore...');
    const environment = yamlData.environment;
    upsertCommunityToFirestore(communityData, environment);
  }
} else {
  console.error('Error: YAML file does not contain community section or environment key.');
}
