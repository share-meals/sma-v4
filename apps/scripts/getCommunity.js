const admin = require('firebase-admin');
const fs = require('fs');
const yaml = require('js-yaml');
const input = yaml.load(fs.readFileSync('./getCommunity.yaml'));
const environment = input.ENVIRONMENT;
const name = input.NAME
const serviceAccount = require(`./serviceAccountKey.${environment}.json`);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

(async function (name) {
  try {
    // Search for communities with names that start with the provided name
    const snapshot = await db.collection('communities')
                            .where('name', '>=', name)
                            .where('name', '<=', name + '\uf8ff')
                            .get();

    if (snapshot.empty) {
      console.log('No communities found.');
      return;
    }

    snapshot.forEach(doc => {
      console.log(doc.id, '=>', doc.data());
    });
  } catch (error) {
    console.error('Error searching communities:', error);
  }
})(name);
