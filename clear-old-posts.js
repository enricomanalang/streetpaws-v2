// Script to clear old newsfeed posts with broken image URLs
const admin = require('firebase-admin');

// Initialize Firebase Admin (you'll need to set up service account)
const serviceAccount = require('./path-to-your-service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://your-project-id.firebaseio.com"
});

const db = admin.firestore();

async function clearOldPosts() {
  try {
    console.log('Clearing old newsfeed posts...');
    
    const newsfeedRef = db.collection('newsfeed');
    const snapshot = await newsfeedRef.get();
    
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log(`Deleted ${snapshot.docs.length} old posts`);
    
  } catch (error) {
    console.error('Error clearing posts:', error);
  }
}

clearOldPosts();
