const admin = require('firebase-admin');

// Ensure you have generated a service account key from the Firebase Console
// (Project Settings > Service accounts > Generate new private key)
// and saved it as backend/serviceAccountKey.json
const serviceAccount = require('../../serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'edwl-ethio-domesticworkerslink.firebasestorage.app'
});

const auth = admin.auth();
const storage = admin.storage();

module.exports = { admin, auth, storage };
