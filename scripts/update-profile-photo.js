const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get, set } = require('firebase/database');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

async function updateUserProfilePhoto(email, photoURL) {
  try {
    console.log(`Looking for user with email: ${email}`);
    
    // Get all users
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);
    
    if (!snapshot.exists()) {
      console.log('No users found in database');
      return;
    }
    
    const users = snapshot.val();
    let foundUser = null;
    let userId = null;
    
    // Find user by email
    for (const [uid, userData] of Object.entries(users)) {
      if (userData.email === email) {
        foundUser = userData;
        userId = uid;
        break;
      }
    }
    
    if (!foundUser) {
      console.log(`User with email ${email} not found`);
      return;
    }
    
    console.log('Found user:', foundUser);
    
    // Update profile with photoURL
    const updatedProfile = {
      ...foundUser,
      photoURL: photoURL
    };
    
    const userRef = ref(database, `users/${userId}`);
    await set(userRef, updatedProfile);
    
    console.log('Profile updated successfully:', updatedProfile);
    
  } catch (error) {
    console.error('Error updating profile:', error);
  }
}

// Get command line arguments
const email = process.argv[2];
const photoURL = process.argv[3];

if (!email || !photoURL) {
  console.log('Usage: node update-profile-photo.js <email> <photoURL>');
  console.log('Example: node update-profile-photo.js enricomanala@gmail.com https://example.com/photo.jpg');
  process.exit(1);
}

updateUserProfilePhoto(email, photoURL);
