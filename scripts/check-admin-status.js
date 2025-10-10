// Script to check admin status of a user
// Run this with: node scripts/check-admin-status.js <email>

const admin = require('firebase-admin');
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');

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

async function checkAdminStatus(email) {
  console.log(`🔍 Checking admin status for: ${email}`);
  
  try {
    // Find the user by email
    console.log('🔍 Looking up user in Firebase Authentication...');
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log(`✅ Found user: ${userRecord.uid} (${userRecord.email})`);
    
    // Check email verification status
    console.log(`📧 Email verified: ${userRecord.emailVerified}`);
    
    // Check profile in database
    console.log('🗃️  Checking user profile in database...');
    const userRef = ref(database, `users/${userRecord.uid}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      const profileData = snapshot.val();
      console.log('📋 Profile data:', JSON.stringify(profileData, null, 2));
      
      const isAdmin = profileData.role === 'admin';
      console.log(`👑 Is admin: ${isAdmin}`);
      
      if (isAdmin) {
        console.log('\n✅ ADMIN STATUS CONFIRMED');
        console.log('   - User can bypass email verification');
        console.log('   - User can access admin panel');
        console.log('   - User has full admin privileges');
      } else {
        console.log('\n❌ NOT AN ADMIN');
        console.log('   - User needs email verification');
        console.log('   - User cannot access admin panel');
        console.log('   - User has regular user privileges');
      }
    } else {
      console.log('❌ No profile found in database');
      console.log('   - User profile does not exist');
      console.log('   - This will cause login issues');
    }
    
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.log(`ℹ️  No user found with email: ${email}`);
      console.log('The user might not exist or the email might be incorrect.');
    } else {
      console.error('❌ Error checking admin status:', error);
    }
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.log('❌ Please provide an email address');
  console.log('Usage: node scripts/check-admin-status.js <email>');
  console.log('Example: node scripts/check-admin-status.js enricomanala@gmail.com');
  process.exit(1);
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.log('❌ Please provide a valid email address');
  process.exit(1);
}

// Run the check
checkAdminStatus(email);
