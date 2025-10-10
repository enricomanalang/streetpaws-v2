// Script to create an admin account with email verification bypass
// Run this with: node scripts/create-admin-account.js <email> <password> <name>

const admin = require('firebase-admin');
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set } = require('firebase/database');

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

async function createAdminAccount(email, password, name) {
  console.log(`👑 Creating admin account for: ${email}`);
  
  try {
    // Create user in Firebase Authentication
    console.log('🔐 Creating user in Firebase Authentication...');
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: name,
      emailVerified: false // We'll bypass verification for admin
    });
    
    console.log(`✅ User created: ${userRecord.uid} (${userRecord.email})`);
    
    // Create admin profile in database
    console.log('🗃️  Creating admin profile in database...');
    const userRef = ref(database, `users/${userRecord.uid}`);
    const adminProfile = {
      uid: userRecord.uid,
      email: userRecord.email,
      role: 'admin',
      name: name,
      createdAt: new Date().toISOString(),
      isFirstAdmin: true
    };
    
    await set(userRef, adminProfile);
    console.log('✅ Admin profile created:', adminProfile);
    
    console.log('\n🎉 Admin account created successfully!');
    console.log(`📧 Email: ${email}`);
    console.log(`🆔 UID: ${userRecord.uid}`);
    console.log(`👤 Name: ${name}`);
    console.log(`👑 Role: admin`);
    console.log('\n✅ The admin can now log in without email verification!');
    console.log('🔓 Email verification is bypassed for admin accounts.');
    
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log(`ℹ️  User with email ${email} already exists.`);
      console.log('You can use the fix-user-profile.js script to make them admin instead.');
    } else {
      console.error('❌ Error creating admin account:', error);
    }
  }
}

// Get parameters from command line arguments
const email = process.argv[2];
const password = process.argv[3];
const name = process.argv[4];

if (!email || !password || !name) {
  console.log('❌ Please provide all required parameters');
  console.log('Usage: node scripts/create-admin-account.js <email> <password> <name>');
  console.log('Example: node scripts/create-admin-account.js admin@streetpaws.com "Admin123!" "Admin User"');
  process.exit(1);
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.log('❌ Please provide a valid email address');
  process.exit(1);
}

// Validate password strength
if (password.length < 6) {
  console.log('❌ Password must be at least 6 characters long');
  process.exit(1);
}

// Run the creation
createAdminAccount(email, password, name);
