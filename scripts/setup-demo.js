#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up StreetPaws Demo...\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found!');
  console.log('Please create a .env.local file with your Firebase configuration.');
  console.log('Example:');
  console.log(`
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
  `);
  process.exit(1);
}

// Check if node_modules exists
if (!fs.existsSync(path.join(process.cwd(), 'node_modules'))) {
  console.log('📦 Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully!\n');
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    process.exit(1);
  }
}

// Add sample data
console.log('📊 Adding sample data...');
try {
  execSync('node scripts/add-sample-data.js', { stdio: 'inherit' });
  console.log('✅ Sample data added successfully!\n');
} catch (error) {
  console.error('❌ Failed to add sample data:', error.message);
  console.log('You can manually run: node scripts/add-sample-data.js');
}

console.log('🎉 Demo setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Run: npm run dev');
console.log('2. Open: http://localhost:3000');
console.log('3. Register a new account or use demo accounts:');
console.log('   - Admin: admin@streetpaws.com / password123');
console.log('   - User: maria.santos@email.com / password123');
console.log('\n📖 For detailed instructions, see DEFENSE_GUIDE.md');
console.log('\nGood luck with your defense! 🎓');
