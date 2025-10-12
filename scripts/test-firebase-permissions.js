const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const { getDatabase, ref, get } = require('firebase/database');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

async function testFirebasePermissions() {
  try {
    console.log('🔧 Testing Firebase permissions...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    const database = getDatabase(app);
    
    console.log('✅ Firebase initialized successfully');
    
    // Test authentication (you'll need to provide valid credentials)
    console.log('🔐 Testing authentication...');
    console.log('Note: You need to provide valid email/password for this test');
    
    // Test Realtime Database access
    console.log('📊 Testing Realtime Database access...');
    try {
      const reportsRef = ref(database, 'reports');
      const snapshot = await get(reportsRef);
      console.log('✅ Realtime Database access successful');
      console.log('Reports count:', snapshot.exists() ? Object.keys(snapshot.val()).length : 0);
    } catch (error) {
      console.error('❌ Realtime Database access failed:', error.message);
    }
    
    // Test Firestore access
    console.log('🔥 Testing Firestore access...');
    try {
      const adoptionRequestsRef = collection(firestore, 'adoptionRequests');
      const snapshot = await getDocs(adoptionRequestsRef);
      console.log('✅ Firestore adoptionRequests access successful');
      console.log('Adoption requests count:', snapshot.docs.length);
    } catch (error) {
      console.error('❌ Firestore adoptionRequests access failed:', error.message);
    }
    
    try {
      const lostPetsRef = collection(firestore, 'lostPets');
      const snapshot = await getDocs(lostPetsRef);
      console.log('✅ Firestore lostPets access successful');
      console.log('Lost pets count:', snapshot.docs.length);
    } catch (error) {
      console.error('❌ Firestore lostPets access failed:', error.message);
    }
    
    try {
      const petsRef = collection(firestore, 'pets');
      const snapshot = await getDocs(petsRef);
      console.log('✅ Firestore pets access successful');
      console.log('Pets count:', snapshot.docs.length);
    } catch (error) {
      console.error('❌ Firestore pets access failed:', error.message);
    }
    
    console.log('🎉 Firebase permissions test completed');
    
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
  }
}

// Run the test
testFirebasePermissions();


