const admin = require('firebase-admin');
const fs = require('fs');
const yaml = require('js-yaml');
const { postCreateClientSchema } = require('@sma-v4/schema');

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

// Function to convert starts and ends keys to Firestore Timestamp
function convertToFirestoreTimestamp(postData) {
    if (postData.starts) {
        postData.starts = admin.firestore.Timestamp.fromDate(new Date(postData.starts));
    }
    if (postData.ends) {
        postData.ends = admin.firestore.Timestamp.fromDate(new Date(postData.ends));
    }
    return postData;
}

// Function to validate post section of YAML file against schema
function validatePostSchema(yamlData) {
    try {
        const postData = yamlData.post;
        postCreateClientSchema.parse(postData);
        console.log('Post schema is valid.');
        const postDataWithTimestamp = convertToFirestoreTimestamp(postData);
        return postDataWithTimestamp;
    } catch (error) {
        console.error('Error validating post schema:', error.errors);
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
async function upsertPostToFirestore(postData, environment) {
    try {
        if (environment === 'emulator') {
            initializeFirebaseEmulator();
            console.log('Initialized Firebase Emulator for Firestore.');
        } else {
            // Load service account JSON for other environments
            const serviceAccountPath = `./serviceAccountKey.${environment}.json`;
            const serviceAccount = require(serviceAccountPath);
            const firebaseAdminConfig = {
                credential: admin.credential.cert(serviceAccount)
            };
            admin.initializeApp(firebaseAdminConfig);
            console.log(`Initialized Firebase for environment: ${environment}`);
        }

        const collectionRef = admin.firestore().collection('posts');
        if (postData.id) {
            // Update existing document
            await collectionRef.doc(postData.id).set(postData);
            console.log(`Updated post with ID ${postData.id} in Firestore.`);
        } else {
            // Create new document
            const docRef = await collectionRef.add(postData);
            console.log(`Added new post with ID ${docRef.id} to Firestore.`);
        }
    } catch (error) {
        console.error('Error upserting post to Firestore:', error);
    }
}

// Example usage
const filePath = 'upsertPost.yaml'; // Replace with your YAML file path
const yamlData = readYAMLFile(filePath);
if (yamlData && yamlData.post && yamlData.environment) {
    console.log('Validating post schema...');
    const postData = validatePostSchema(yamlData);
    if (postData) {
        console.log('Upserting post to Firestore...');
        const environment = yamlData.environment;
        upsertPostToFirestore(postData, environment);
    }
} else {
    console.error('Error: YAML file does not contain post section or environment key.');
}
