const admin = require('firebase-admin');

// Ambil file serviceAccount dari Firebase Console > Settings > Service accounts
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Ganti UID dengan UID user kamu (ambil dari Firebase Console > Authentication)
const admins = 'vRZpLHqG8mPBudjG8KWTbIS4qz33';

admin.auth().setCustomUserClaims(admins, { admin: true }).then(() => {
  console.log('✅ Role admin berhasil ditambahkan');
});
