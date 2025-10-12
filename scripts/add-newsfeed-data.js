const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set, push } = require('firebase/database');

// Firebase configuration from .env.local
const firebaseConfig = {
  apiKey: "AIzaSyAAbkxo52kDylmiW1TXaipSC4EdCxG9yHI",
  authDomain: "streetpaws-2.firebaseapp.com",
  projectId: "streetpaws-2",
  storageBucket: "streetpaws-2.firebasestorage.app",
  messagingSenderId: "99847596081",
  appId: "1:99847596081:web:a3f8eb69f02517587d4d10",
  databaseURL: "https://streetpaws-2-default-rtdb.asia-southeast1.firebasedatabase.app"
};

async function addNewsfeedData() {
  try {
    console.log('🔧 Adding sample newsfeed data...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const database = getDatabase(app);
    
    console.log('✅ Firebase initialized successfully');
    
    // Add sample posts
    const newsfeedRef = ref(database, 'newsfeed');
    
    const samplePosts = [
      {
        title: 'Welcome to StreetPaws!',
        content: 'Welcome to our community! We are here to help stray animals in Lipa City. Together, we can make a difference.',
        type: 'announcement',
        authorId: 'admin',
        authorName: 'Admin',
        createdAt: new Date().toISOString(),
        isPinned: true
      },
      {
        title: 'How to Report Animal Abuse',
        content: 'If you see any animal abuse or neglect, please report it immediately through our reporting system. Your reports help us save lives.',
        type: 'update',
        authorId: 'admin',
        authorName: 'Admin',
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        isPinned: false
      },
      {
        title: 'Volunteer Opportunities',
        content: 'We are looking for volunteers to help with animal care, feeding, and adoption events. Contact us if you want to help!',
        type: 'event',
        authorId: 'admin',
        authorName: 'Admin',
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        isPinned: false
      }
    ];
    
    for (let i = 0; i < samplePosts.length; i++) {
      const postRef = push(newsfeedRef, samplePosts[i]);
      console.log(`✅ Added post ${i + 1} with ID: ${postRef.key}`);
    }
    
    console.log('🎉 Sample newsfeed data added successfully!');
    
  } catch (error) {
    console.error('❌ Failed to add newsfeed data:', error);
  }
}

// Run the script
addNewsfeedData();

