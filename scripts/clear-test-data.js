// Script to clear all test data from Firebase Realtime Database
// Run this with: node scripts/clear-test-data.js

const { initializeApp } = require('firebase/app');
const { getDatabase, ref, remove } = require('firebase/database');

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Collections to clear
const collectionsToClear = [
  'reports',
  'approvedReports', 
  'rejectedReports',
  'lostPets',
  'foundPets',
  'adoptionRequests',
  'adoptions'
];

async function clearAllData() {
  console.log('🗑️  Starting to clear all test data...');
  
  try {
    for (const collection of collectionsToClear) {
      console.log(`\n📁 Clearing collection: ${collection}`);
      
      const collectionRef = ref(database, collection);
      await remove(collectionRef);
      
      console.log(`✅ Successfully cleared: ${collection}`);
    }
    
    console.log('\n🎉 All test data cleared successfully!');
    console.log('\n📋 Cleared collections:');
    collectionsToClear.forEach(col => console.log(`   - ${col}`));
    
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    console.log('\n💡 Make sure you have the correct Firebase configuration and permissions.');
  }
}

// Run the script
clearAllData();
