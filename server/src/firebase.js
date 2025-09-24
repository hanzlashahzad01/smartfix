const admin = require('firebase-admin');

let initialized = false;

try {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Use credentials from file path
    admin.initializeApp();
    initialized = true;
  } else if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
    });
    initialized = true;
  } else {
    console.warn('[Firebase] No credentials found. Running in mock mode.');
    initialized = false;
  }
} catch (e) {
  console.warn('[Firebase] Initialization failed, continuing in mock mode:', e.message);
  initialized = false;
}

module.exports = {
  admin,
  initialized,
}; 