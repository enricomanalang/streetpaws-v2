const fs = require('fs');
const path = require('path');

// Read .env.local file manually
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

// Parse environment variables
const envVars = {};
let currentKey = null;
let currentValue = '';

envContent.split('\n').forEach(line => {
  line = line.trim();
  if (line.startsWith('#') || line === '') return;
  
  if (line.includes('=')) {
    // Save previous key-value pair
    if (currentKey) {
      envVars[currentKey] = currentValue.trim();
    }
    
    const [key, ...valueParts] = line.split('=');
    currentKey = key.trim();
    currentValue = valueParts.join('=').trim();
  } else if (currentKey) {
    // Continue previous value
    currentValue += line;
  }
});

// Save last key-value pair
if (currentKey) {
  envVars[currentKey] = currentValue.trim();
}

console.log('🔍 Checking Firebase Configuration...\n');

const firebaseConfig = {
  apiKey: envVars.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: envVars.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: envVars.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: envVars.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: envVars.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: envVars.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: envVars.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log('Firebase Config:');
console.log('  API Key:', firebaseConfig.apiKey ? '✅ Present' : '❌ Missing');
console.log('  Auth Domain:', firebaseConfig.authDomain ? '✅ Present' : '❌ Missing');
console.log('  Database URL:', firebaseConfig.databaseURL ? '✅ Present' : '❌ Missing');
console.log('  Project ID:', firebaseConfig.projectId ? '✅ Present' : '❌ Missing');
console.log('  Storage Bucket:', firebaseConfig.storageBucket ? '✅ Present' : '❌ Missing');
console.log('  Messaging Sender ID:', firebaseConfig.messagingSenderId ? '✅ Present' : '❌ Missing');
console.log('  App ID:', firebaseConfig.appId ? '✅ Present' : '❌ Missing');

console.log('\nSupabase Config:');
console.log('  URL:', envVars.NEXT_PUBLIC_SUPABASE_URL ? '✅ Present' : '❌ Missing');
console.log('  Anon Key:', envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Present' : '❌ Missing');

// Check if Firebase config is valid
const isFirebaseConfigValid = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.storageBucket &&
  firebaseConfig.messagingSenderId &&
  firebaseConfig.appId
);

console.log('\n📊 Summary:');
console.log('  Firebase Config Valid:', isFirebaseConfigValid ? '✅ Yes' : '❌ No');
console.log('  Supabase Config Valid:', !!(envVars.NEXT_PUBLIC_SUPABASE_URL && envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY) ? '✅ Yes' : '❌ No');

if (!isFirebaseConfigValid) {
  console.log('\n❌ Firebase configuration is incomplete!');
  console.log('Please check your .env.local file and make sure all Firebase variables are set.');
} else {
  console.log('\n✅ Firebase configuration looks good!');
}
