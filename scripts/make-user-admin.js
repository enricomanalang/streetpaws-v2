// Script to make an existing user an admin
// Run this with: node scripts/make-user-admin.js <email>

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

async function makeUserAdmin(email) {
  console.log(`👑 Making user admin: ${email}`);
  
  try {
    // Find the user by email
    console.log('🔍 Looking up user in Firebase Authentication...');
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log(`✅ Found user: ${userRecord.uid} (${userRecord.email})`);
    
    // Check current profile
    console.log('🗃️  Checking current user profile...');
    const userRef = ref(database, `users/${userRecord.uid}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      const currentProfile = snapshot.val();
      console.log('📋 Current profile:', currentProfile);
      
      // Update profile to admin
      const updatedProfile = {
        ...currentProfile,
        role: 'admin',
        name: currentProfile.name || userRecord.displayName || userRecord.email.split('@')[0] || 'Admin',
        email: userRecord.email,
        uid: userRecord.uid,
        adminSince: new Date().toISOString()
      };
      
      await set(userRef, updatedProfile);
      console.log('✅ Profile updated to admin:', updatedProfile);
    } else {
      // Create new admin profile
      const adminProfile = {
        uid: userRecord.uid,
        email: userRecord.email,
        role: 'admin',
        name: userRecord.displayName || userRecord.email.split('@')[0] || 'Admin',
        createdAt: new Date().toISOString(),
        adminSince: new Date().toISOString()
      };
      
      await set(userRef, adminProfile);
      console.log('✅ New admin profile created:', adminProfile);
    }
    
    console.log('\n🎉 User successfully promoted to admin!');
    console.log(`📧 Email: ${email}`);
    console.log(`🆔 UID: ${userRecord.uid}`);
    console.log(`👑 Role: admin`);
    console.log('\n✅ The user can now:');
    console.log('   - Access the admin panel');
    console.log('   - Log in without email verification');
    console.log('   - Manage all reports and users');
    
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.log(`ℹ️  No user found with email: ${email}`);
      console.log('The user might not exist or the email might be incorrect.');
    } else {
      console.error('❌ Error making user admin:', error);
    }
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.log('❌ Please provide an email address');
  console.log('Usage: node scripts/make-user-admin.js <email>');
  console.log('Example: node scripts/make-user-admin.js enricomanala@gmail.com');
  process.exit(1);
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.log('❌ Please provide a valid email address');
  process.exit(1);
}

// Run the promotion
makeUserAdmin(email);
