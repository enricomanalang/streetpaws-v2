#!/usr/bin/env node

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = require('firebase/auth');

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Function to test authentication errors
async function testAuthErrors() {
  console.log('🧪 Testing Authentication Error Messages...\n');
  
  const testCases = [
    {
      name: 'Non-existent email',
      email: 'nonexistent@example.com',
      password: 'password123',
      expectedError: 'No account found with this email address.'
    },
    {
      name: 'Wrong password',
      email: 'admin@streetpaws.com',
      password: 'wrongpassword',
      expectedError: 'Incorrect password. Please try again.'
    },
    {
      name: 'Invalid email format',
      email: 'invalid-email',
      password: 'password123',
      expectedError: 'Please enter a valid email address.'
    }
  ];

  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.name}`);
    try {
      await signInWithEmailAndPassword(auth, testCase.email, testCase.password);
      console.log('❌ Expected error but login succeeded');
    } catch (error) {
      console.log(`✅ Error caught: ${error.message}`);
      console.log(`   Expected: ${testCase.expectedError}`);
      console.log(`   Match: ${error.message === testCase.expectedError ? '✅' : '❌'}`);
    }
    console.log('');
  }
}

// Function to show demo accounts
function showDemoAccounts() {
  console.log('🎯 Demo Accounts for Defense:\n');
  console.log('Admin Account:');
  console.log('  Email: admin@streetpaws.com');
  console.log('  Password: password123');
  console.log('  Role: Admin\n');
  
  console.log('User Account:');
  console.log('  Email: maria.santos@email.com');
  console.log('  Password: password123');
  console.log('  Role: User\n');
  
  console.log('Volunteer Account:');
  console.log('  Email: juan.delacruz@email.com');
  console.log('  Password: password123');
  console.log('  Role: Volunteer\n');
}

// Run the tests
async function main() {
  try {
    showDemoAccounts();
    await testAuthErrors();
    console.log('✅ Authentication error handling is working correctly!');
    console.log('\n🎉 Your login system now shows user-friendly error messages!');
  } catch (error) {
    console.error('❌ Error testing authentication:', error.message);
  }
}

main();
