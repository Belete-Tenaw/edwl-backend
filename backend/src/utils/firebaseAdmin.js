const admin = require('firebase-admin');

function initialize() {
    if (admin.apps.length > 0) return;
    const fs = require('fs');
    const path = require('path');
    const serviceAccountPath = path.join(__dirname, '../../serviceAccountKey.json');
    if (fs.existsSync(serviceAccountPath)) {
        try {
            const serviceAccount = require(serviceAccountPath);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                storageBucket: 'edwl-ethio-domesticworkerslink.firebasestorage.app'
            });
            
        } catch (e) {
            console.error('[FirebaseAdmin] ❌ Error:', e.message);
        }
    } else {
        console.warn('[FirebaseAdmin] ⚠️ Using Mock Services: no key found.');
    }
}

const authMock = {
    setCustomUserClaims: async (uid, claims) => {
        
    },
    getUser: async (uid) => {
        return { uid, email: 'mock@edwl.com' };
    },
    auth: () => authMock // Handle cases where admin.auth() is called on the object
};

const storageMock = {
    bucket: () => ({
        file: () => ({
            save: async () => { },
            getSignedUrl: async () => ['https://mock-url.com']
        })
    })
};

const auth = {
    setCustomUserClaims: async (...args) => {
        initialize();
        const service = admin.apps.length > 0 ? admin.auth() : authMock;
        return service.setCustomUserClaims(...args);
    },
    getUser: async (...args) => {
        initialize();
        const service = admin.apps.length > 0 ? admin.auth() : authMock;
        return service.getUser(...args);
    }
};

const storage = {
    bucket: (...args) => {
        initialize();
        const service = admin.apps.length > 0 ? admin.storage() : storageMock;
        return service.bucket(...args);
    }
};

module.exports = { admin, auth, storage };

