const admin = require('firebase-admin');
const fs = require('fs');
const yaml = require('js-yaml');

// Initialize Firebase Admin SDK
const serviceAccount = require('../serviceAccountKey.live.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function fetchUsers() {
  const users = [];
  let nextPageToken;

  do {
    const result = await admin.auth().listUsers(1000, nextPageToken);
    users.push(...result.users);
    nextPageToken = result.pageToken;
  } while (nextPageToken);

  return users;
}

async function saveUsersToYaml(users) {
  const yamlData = yaml.dump(users);
  fs.writeFileSync('./all_users.yaml', yamlData, 'utf8');
  console.log('Users have been saved to all_users.yaml');
}

async function main() {
  try {
    const users = await fetchUsers();
    await saveUsersToYaml(users);
  } catch (error) {
    console.error('Error fetching users:', error);
  }
}

main();
