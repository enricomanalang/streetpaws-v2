// Script to properly delete a user from both Firebase Auth and Database
// Run this with: node scripts/delete-user.js <email>

const admin = require('firebase-admin');
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, remove, get } = require('firebase/database');

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
  // You need to set up a service account key file
  // Download it from Firebase Console > Project Settings > Service Accounts
  // Place it in your project root as 'serviceAccountKey.json'
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

async function deleteUser(email) {
  console.log(`🗑️  Starting to delete user: ${email}`);
  
  try {
    // Step 1: Find the user by email in Firebase Auth
    console.log('🔍 Looking up user in Firebase Authentication...');
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log(`✅ Found user: ${userRecord.uid} (${userRecord.email})`);
    
    // Step 2: Delete user profile from Realtime Database
    console.log('🗃️  Deleting user profile from database...');
    const userRef = ref(database, `users/${userRecord.uid}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      await remove(userRef);
      console.log('✅ User profile deleted from database');
    } else {
      console.log('ℹ️  No user profile found in database');
    }
    
    // Step 3: Delete user from Firebase Authentication
    console.log('🔐 Deleting user from Firebase Authentication...');
    await admin.auth().deleteUser(userRecord.uid);
    console.log('✅ User deleted from Firebase Authentication');
    
    console.log('\n🎉 User successfully deleted!');
    console.log(`📧 Email: ${email}`);
    console.log(`🆔 UID: ${userRecord.uid}`);
    console.log('\n✅ The user can now register again with the same email address.');
    
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.log(`ℹ️  No user found with email: ${email}`);
      console.log('The user might have already been deleted or never existed.');
    } else {
      console.error('❌ Error deleting user:', error);
    }
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.log('❌ Please provide an email address');
  console.log('Usage: node scripts/delete-user.js <email>');
  console.log('Example: node scripts/delete-user.js enricomanala@gmail.com');
  process.exit(1);
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.log('❌ Please provide a valid email address');
  process.exit(1);
}

// Run the deletion
deleteUser(email);
