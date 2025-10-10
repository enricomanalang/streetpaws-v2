// Script to fix user profile issues
// Run this with: node scripts/fix-user-profile.js <email> <name>

const admin = require('firebase-admin');
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set, get } = require('firebase/database');

// Firebase configuration (same as your app)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    const serviceAccount = require('../serviceAccountKey.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: firebaseConfig.databaseURL
    });
    console.log('✅ Firebase Admin SDK initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK');
    console.error('Please download your service account key from Firebase Console');
    console.error('and save it as "serviceAccountKey.json" in your project root');
    process.exit(1);
  }
}

// Initialize Firebase client for database operations
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

async function fixUserProfile(email, name) {
  console.log(`🔧 Fixing user profile for: ${email}`);
  
  try {
    // Find the user by email
    console.log('🔍 Looking up user in Firebase Authentication...');
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log(`✅ Found user: ${userRecord.uid} (${userRecord.email})`);
    
    // Check if profile exists in database
    console.log('🗃️  Checking user profile in database...');
    const userRef = ref(database, `users/${userRecord.uid}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      const currentProfile = snapshot.val();
      console.log('📋 Current profile:', currentProfile);
      
      // Update the profile with the correct name
      const updatedProfile = {
        ...currentProfile,
        name: name || userRecord.displayName || userRecord.email.split('@')[0] || 'User',
        email: userRecord.email,
        uid: userRecord.uid
      };
      
      await set(userRef, updatedProfile);
      console.log('✅ Profile updated:', updatedProfile);
    } else {
      // Create new profile
      const newProfile = {
        uid: userRecord.uid,
        email: userRecord.email,
        role: 'user',
        name: name || userRecord.displayName || userRecord.email.split('@')[0] || 'User'
      };
      
      await set(userRef, newProfile);
      console.log('✅ New profile created:', newProfile);
    }
    
    console.log('\n🎉 User profile fixed successfully!');
    console.log(`📧 Email: ${email}`);
    console.log(`🆔 UID: ${userRecord.uid}`);
    console.log(`👤 Name: ${name || userRecord.displayName || userRecord.email.split('@')[0] || 'User'}`);
    console.log('\n✅ The user should now see their correct name in the navigation and dashboard should load properly.');
    
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.log(`ℹ️  No user found with email: ${email}`);
      console.log('The user might not exist or the email might be incorrect.');
    } else {
      console.error('❌ Error fixing user profile:', error);
    }
  }
}

// Get email and name from command line arguments
const email = process.argv[2];
const name = process.argv[3];

if (!email) {
  console.log('❌ Please provide an email address');
  console.log('Usage: node scripts/fix-user-profile.js <email> [name]');
  console.log('Example: node scripts/fix-user-profile.js enricomanala@gmail.com "Enrico Manalang"');
  process.exit(1);
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.log('❌ Please provide a valid email address');
  process.exit(1);
}

// Run the fix
fixUserProfile(email, name);
