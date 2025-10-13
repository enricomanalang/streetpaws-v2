/**
 * Generate Realistic Test Data for Analytics
 * This creates realistic clustered data that will trigger hotspot detection
 */

const { initializeApp } = require('firebase/app');
const { getDatabase, ref, push, set } = require('firebase/database');

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Realistic test data with clear hotspots
const generateRealisticTestData = () => {
  const reports = [];
  const baseDate = new Date('2024-01-01');
  
  // Define realistic hotspots in Lipa City
  const hotspots = [
    {
      name: "Downtown Commercial Area",
      center: { lat: 14.0583, lng: 121.1656 },
      reports: 12,
      severity: "high", // More abuse cases
      description: "Busy commercial area with many stray animals"
    },
    {
      name: "Residential Zone A",
      center: { lat: 14.0600, lng: 121.1680 },
      reports: 8,
      severity: "medium",
      description: "Dense residential area with pet abandonment issues"
    },
    {
      name: "Industrial District",
      center: { lat: 14.0560, lng: 121.1620 },
      reports: 10,
      severity: "high",
      description: "Industrial area with poor animal welfare conditions"
    },
    {
      name: "Market Area",
      center: { lat: 14.0620, lng: 121.1700 },
      reports: 6,
      severity: "medium",
      description: "Market area with food waste attracting strays"
    },
    {
      name: "School District",
      center: { lat: 14.0550, lng: 121.1750 },
      reports: 4,
      severity: "low",
      description: "School area with occasional stray sightings"
    }
  ];
  
  const animalTypes = ['dog', 'cat', 'dog', 'dog', 'cat']; // More dogs than cats
  const conditions = ['abuse', 'fighting', 'normal', 'abuse', 'fighting', 'normal', 'normal'];
  const colors = ['Black', 'White', 'Brown', 'Gray', 'Orange', 'Mixed'];
  const sizes = ['Small', 'Medium', 'Large'];
  
  hotspots.forEach((hotspot, hotspotIndex) => {
    for (let i = 0; i < hotspot.reports; i++) {
      // Generate points within 300m of hotspot center
      const offsetLat = (Math.random() - 0.5) * 0.002; // ~200m radius
      const offsetLng = (Math.random() - 0.5) * 0.002;
      
      // Generate realistic dates over the last 6 months
      const reportDate = new Date(baseDate);
      reportDate.setMonth(baseDate.getMonth() + Math.floor(Math.random() * 6));
      reportDate.setDate(Math.floor(Math.random() * 28) + 1);
      reportDate.setHours(Math.floor(Math.random() * 24));
      
      // Weight conditions based on hotspot severity
      let condition;
      if (hotspot.severity === 'high') {
        condition = Math.random() > 0.3 ? 'abuse' : Math.random() > 0.5 ? 'fighting' : 'normal';
      } else if (hotspot.severity === 'medium') {
        condition = Math.random() > 0.5 ? 'abuse' : Math.random() > 0.3 ? 'fighting' : 'normal';
      } else {
        condition = Math.random() > 0.7 ? 'abuse' : Math.random() > 0.5 ? 'fighting' : 'normal';
      }
      
      const report = {
        animalType: animalTypes[Math.floor(Math.random() * animalTypes.length)],
        breed: Math.random() > 0.6 ? 'Mixed' : 'Unknown',
        color: colors[Math.floor(Math.random() * colors.length)],
        size: sizes[Math.floor(Math.random() * sizes.length)],
        condition: condition,
        location: `${hotspot.name} - Location ${i + 1}`,
        address: `${hotspot.name} Street ${i + 1}, Lipa City`,
        latitude: hotspot.center.lat + offsetLat,
        longitude: hotspot.center.lng + offsetLng,
        description: `${hotspot.description} - Report ${i + 1}. ${condition === 'abuse' ? 'Animal appears to be in distress.' : condition === 'fighting' ? 'Multiple animals fighting.' : 'Animal sighting.'}`,
        status: Math.random() > 0.2 ? 'approved' : 'pending',
        submittedBy: {
          uid: `test-user-${hotspotIndex}-${i}`,
          name: `Test User ${hotspotIndex}-${i}`,
          email: `test${hotspotIndex}${i}@example.com`
        },
        createdAt: reportDate.toISOString(),
        updatedAt: reportDate.toISOString()
      };
      
      reports.push(report);
    }
  });
  
  return reports;
};

// Add realistic test data to Firebase
const addRealisticTestData = async () => {
  try {
    console.log('🚀 Generating realistic test data for analytics demonstration...');
    
    const testReports = generateRealisticTestData();
    console.log(`📊 Generated ${testReports.length} realistic test reports`);
    
    // Clear existing test data first
    console.log('🧹 Clearing existing test data...');
    try {
      await set(ref(database, 'approvedReports'), {});
      await set(ref(database, 'reports'), {});
      await set(ref(database, 'lostPets'), {});
      await set(ref(database, 'foundPets'), {});
      await set(ref(database, 'adoptionRequests'), {});
    } catch (error) {
      console.log('Note: Some collections may not exist yet');
    }
    
    // Add approved reports (these will show on heatmap)
    console.log('📝 Adding approved reports...');
    const approvedReports = testReports.filter(r => r.status === 'approved');
    for (const report of approvedReports) {
      const newReportRef = ref(database, 'approvedReports');
      await push(newReportRef, report);
    }
    
    // Add pending reports
    console.log('📝 Adding pending reports...');
    const pendingReports = testReports.filter(r => r.status === 'pending');
    for (const report of pendingReports) {
      const newReportRef = ref(database, 'reports');
      await push(newReportRef, report);
    }
    
    // Add lost pets (some from the same areas)
    console.log('📝 Adding lost pets...');
    const lostPets = testReports.slice(0, 15).map((report, index) => ({
      ...report,
      petName: `Lost-${report.animalType.toUpperCase()}-${index + 1}`,
      status: 'lost',
      lastSeen: report.createdAt,
      ownerContact: `owner${index}@example.com`
    }));
    
    for (const pet of lostPets) {
      const newPetRef = ref(database, 'lostPets');
      await push(newPetRef, pet);
    }
    
    // Add found pets
    console.log('📝 Adding found pets...');
    const foundPets = testReports.slice(15, 25).map((report, index) => ({
      ...report,
      status: 'found',
      foundDate: report.createdAt,
      finderContact: `finder${index}@example.com`
    }));
    
    for (const pet of foundPets) {
      const newPetRef = ref(database, 'foundPets');
      await push(newPetRef, pet);
    }
    
    // Add adoption requests
    console.log('📝 Adding adoption requests...');
    const adoptionRequests = testReports.slice(25, 35).map((report, index) => ({
      animalInfo: {
        animalType: report.animalType,
        breed: report.breed,
        color: report.color,
        size: report.size
      },
      applicant: {
        uid: `applicant-${index}`,
        name: `Applicant ${index + 1}`,
        email: `applicant${index}@example.com`,
        phone: `+63-9${Math.floor(Math.random() * 100000000).toString().padStart(9, '0')}`
      },
      status: ['pending', 'approved', 'rejected'][Math.floor(Math.random() * 3)],
      createdAt: report.createdAt,
      notes: `Interested in adopting this ${report.animalType} from ${report.location}`
    }));
    
    for (const request of adoptionRequests) {
      const newRequestRef = ref(database, 'adoptionRequests');
      await push(newRequestRef, request);
    }
    
    console.log('✅ Realistic test data added successfully!');
    console.log('\n📈 Data Summary:');
    console.log(`   - Approved Reports: ${approvedReports.length}`);
    console.log(`   - Pending Reports: ${pendingReports.length}`);
    console.log(`   - Lost Pets: ${lostPets.length}`);
    console.log(`   - Found Pets: ${foundPets.length}`);
    console.log(`   - Adoption Requests: ${adoptionRequests.length}`);
    console.log('\n🎯 Now refresh your admin dashboard to see:');
    console.log('   - Heat map with clustered markers');
    console.log('   - Hotspot detection results');
    console.log('   - Resource allocation recommendations');
    console.log('   - Strategic recommendations');
    
  } catch (error) {
    console.error('❌ Error adding realistic test data:', error);
  }
};

// Run the script
if (require.main === module) {
  addRealisticTestData().then(() => {
    console.log('🏁 Realistic test data generation completed');
    process.exit(0);
  });
}

module.exports = { addRealisticTestData, generateRealisticTestData };

