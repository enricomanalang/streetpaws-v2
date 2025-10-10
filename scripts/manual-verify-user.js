// Script to manually verify a user's email in Firebase
// Run this with: node scripts/manual-verify-user.js <email>

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    const serviceAccount = require('../serviceAccountKey.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin SDK initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK');
    console.error('Please download your service account key from Firebase Console');
    console.error('and save it as "serviceAccountKey.json" in your project root');
    process.exit(1);
  }
}

async function verifyUserEmail(email) {
  console.log(`📧 Manually verifying email: ${email}`);
  
  try {
    // Find the user by email
    console.log('🔍 Looking up user...');
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log(`✅ Found user: ${userRecord.uid} (${userRecord.email})`);
    
    // Check current verification status
    console.log(`📊 Current email verified status: ${userRecord.emailVerified}`);
    
    if (userRecord.emailVerified) {
      console.log('ℹ️  Email is already verified!');
      return;
    }
    
    // Manually verify the email
    console.log('✅ Manually verifying email...');
    await admin.auth().updateUser(userRecord.uid, {
      emailVerified: true
    });
    
    console.log('\n🎉 Email verification successful!');
    console.log(`📧 Email: ${email}`);
    console.log(`🆔 UID: ${userRecord.uid}`);
    console.log('\n✅ The user can now log in without email verification issues.');
    
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.log(`ℹ️  No user found with email: ${email}`);
      console.log('The user might not exist or the email might be incorrect.');
    } else {
      console.error('❌ Error verifying email:', error);
    }
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.log('❌ Please provide an email address');
  console.log('Usage: node scripts/manual-verify-user.js <email>');
  console.log('Example: node scripts/manual-verify-user.js enricomanala@gmail.com');
  process.exit(1);
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.log('❌ Please provide a valid email address');
  process.exit(1);
}

// Run the verification
verifyUserEmail(email);
