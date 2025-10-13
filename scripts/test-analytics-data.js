/**
 * Test Analytics Data Generator
 * This script adds sample data to test the analytics functionality
 */

const { initializeApp } = require('firebase/app');
const { getDatabase, ref, push, set } = require('firebase/database');

// Firebase configuration (use your actual config)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Sample data for testing analytics
const generateTestData = () => {
  const baseDate = new Date('2024-01-01');
  const testReports = [];
  
  // Generate reports for the last 6 months
  for (let month = 0; month < 6; month++) {
    const reportsPerMonth = Math.floor(Math.random() * 15) + 5; // 5-20 reports per month
    
    for (let i = 0; i < reportsPerMonth; i++) {
      const reportDate = new Date(baseDate);
      reportDate.setMonth(baseDate.getMonth() + month);
      reportDate.setDate(Math.floor(Math.random() * 28) + 1);
      reportDate.setHours(Math.floor(Math.random() * 24));
      
      // Generate coordinates around Lipa City with some clustering
      const clusterCenter = Math.random() > 0.7 ? 
        { lat: 14.0583, lng: 121.1656 } : // Main city center
        { lat: 14.0583 + (Math.random() - 0.5) * 0.02, lng: 121.1656 + (Math.random() - 0.5) * 0.02 };
      
      const report = {
        animalType: Math.random() > 0.6 ? 'dog' : 'cat',
        breed: Math.random() > 0.5 ? 'Mixed' : 'Unknown',
        color: ['Black', 'White', 'Brown', 'Gray', 'Orange'][Math.floor(Math.random() * 5)],
        size: ['Small', 'Medium', 'Large'][Math.floor(Math.random() * 3)],
        condition: Math.random() > 0.7 ? 'abuse' : Math.random() > 0.5 ? 'fighting' : 'normal',
        location: `Test Location ${month}-${i}`,
        address: `Test Street ${Math.floor(Math.random() * 100)}, Lipa City`,
        latitude: clusterCenter.lat + (Math.random() - 0.5) * 0.005,
        longitude: clusterCenter.lng + (Math.random() - 0.5) * 0.005,
        description: `Test report ${i} for analytics testing`,
        status: Math.random() > 0.3 ? 'approved' : 'pending',
        submittedBy: {
          uid: 'test-user-123',
          name: 'Test User',
          email: 'test@example.com'
        },
        createdAt: reportDate.toISOString(),
        updatedAt: reportDate.toISOString()
      };
      
      testReports.push(report);
    }
  }
  
  return testReports;
};

// Add test data to Firebase
const addTestData = async () => {
  try {
    console.log('🚀 Starting analytics test data generation...');
    
    const testReports = generateTestData();
    console.log(`📊 Generated ${testReports.length} test reports`);
    
    // Add reports to different collections
    const approvedReports = testReports.filter(r => r.status === 'approved');
    const pendingReports = testReports.filter(r => r.status === 'pending');
    
    console.log('📝 Adding approved reports...');
    for (const report of approvedReports) {
      const newReportRef = ref(database, 'approvedReports');
      await push(newReportRef, report);
    }
    
    console.log('📝 Adding pending reports...');
    for (const report of pendingReports) {
      const newReportRef = ref(database, 'reports');
      await push(newReportRef, report);
    }
    
    // Add some lost pets data
    console.log('📝 Adding lost pets data...');
    const lostPets = testReports.slice(0, 10).map(report => ({
      ...report,
      petName: `Pet-${Math.floor(Math.random() * 1000)}`,
      status: 'lost',
      lastSeen: report.createdAt
    }));
    
    for (const pet of lostPets) {
      const newPetRef = ref(database, 'lostPets');
      await push(newPetRef, pet);
    }
    
    // Add some found pets data
    console.log('📝 Adding found pets data...');
    const foundPets = testReports.slice(10, 20).map(report => ({
      ...report,
      status: 'found',
      foundDate: report.createdAt
    }));
    
    for (const pet of foundPets) {
      const newPetRef = ref(database, 'foundPets');
      await push(newPetRef, pet);
    }
    
    // Add adoption requests
    console.log('📝 Adding adoption requests...');
    const adoptionRequests = testReports.slice(20, 30).map(report => ({
      animalInfo: {
        animalType: report.animalType,
        breed: report.breed,
        color: report.color
      },
      applicant: {
        uid: 'test-applicant-123',
        name: 'Test Applicant',
        email: 'applicant@example.com'
      },
      status: 'pending',
      createdAt: report.createdAt
    }));
    
    for (const request of adoptionRequests) {
      const newRequestRef = ref(database, 'adoptionRequests');
      await push(newRequestRef, request);
    }
    
    console.log('✅ Test data added successfully!');
    console.log(`📈 Summary:`);
    console.log(`   - Approved Reports: ${approvedReports.length}`);
    console.log(`   - Pending Reports: ${pendingReports.length}`);
    console.log(`   - Lost Pets: ${lostPets.length}`);
    console.log(`   - Found Pets: ${foundPets.length}`);
    console.log(`   - Adoption Requests: ${adoptionRequests.length}`);
    console.log('\n🎯 Now you can test the analytics in the admin dashboard!');
    
  } catch (error) {
    console.error('❌ Error adding test data:', error);
  }
};

// Run the script
if (require.main === module) {
  addTestData().then(() => {
    console.log('🏁 Test data generation completed');
    process.exit(0);
  });
}

module.exports = { addTestData, generateTestData };

