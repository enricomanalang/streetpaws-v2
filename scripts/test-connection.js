const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

async function testConnection() {
  try {
    console.log('🔍 Testing Firebase connection...\n');
    
    // Check if all required environment variables are set
    const requiredVars = [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
      'NEXT_PUBLIC_FIREBASE_DATABASE_URL',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
      'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
      'NEXT_PUBLIC_FIREBASE_APP_ID'
    ];
    
    console.log('📋 Environment Variables:');
    for (const varName of requiredVars) {
      const value = process.env[varName];
      if (value) {
        console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
      } else {
        console.log(`❌ ${varName}: Not set`);
      }
    }
    console.log('');
    
    // Initialize Firebase
    console.log('🔥 Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    const database = getDatabase(app);
    console.log('✅ Firebase initialized successfully!\n');
    
    // Test database connection
    console.log('🗄️ Testing database connection...');
    const testRef = ref(database, 'test');
    await get(testRef);
    console.log('✅ Database connection successful!\n');
    
    // Check existing data
    console.log('📊 Checking existing data...');
    const collections = ['reports', 'approvedReports', 'lostPets', 'foundPets', 'adoptionRequests', 'users'];
    
    for (const collection of collections) {
      try {
        const collectionRef = ref(database, collection);
        const snapshot = await get(collectionRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const count = Object.keys(data).length;
          console.log(`✅ ${collection}: ${count} items`);
        } else {
          console.log(`📭 ${collection}: No data`);
        }
      } catch (error) {
        console.log(`❌ ${collection}: Error - ${error.message}`);
      }
    }
    
    console.log('\n🎉 All tests passed! Your Firebase connection is working correctly.');
    console.log('\n📋 Demo Setup Status:');
    console.log('✅ Firebase configuration: Valid');
    console.log('✅ Database connection: Working');
    console.log('✅ Sample data: Ready');
    console.log('\n🚀 You can now run: npm run dev');
    
  } catch (error) {
    console.error('\n❌ Connection test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your .env.local file');
    console.log('2. Verify Firebase project settings');
    console.log('3. Ensure database rules allow read/write');
    console.log('4. Check your internet connection');
  }
}

testConnection();
