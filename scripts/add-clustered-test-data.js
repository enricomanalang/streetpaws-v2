/**
 * Add Clustered Test Data for Analytics Testing
 * This creates data in clusters to trigger hotspot detection
 */

const { initializeApp } = require('firebase/app');
const { getDatabase, ref, push } = require('firebase/database');

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

// Create clustered data for hotspot detection
const createClusteredData = () => {
  const reports = [];
  const baseDate = new Date('2024-01-01');
  
  // Cluster 1: High-density area (5+ reports close together)
  const cluster1 = {
    center: { lat: 14.0583, lng: 121.1656 },
    reports: 8
  };
  
  // Cluster 2: Medium-density area (3-4 reports close together)
  const cluster2 = {
    center: { lat: 14.0600, lng: 121.1680 },
    reports: 5
  };
  
  // Cluster 3: Another high-density area
  const cluster3 = {
    center: { lat: 14.0560, lng: 121.1620 },
    reports: 6
  };
  
  const clusters = [cluster1, cluster2, cluster3];
  
  clusters.forEach((cluster, clusterIndex) => {
    for (let i = 0; i < cluster.reports; i++) {
      // Generate points within 500m of cluster center
      const offsetLat = (Math.random() - 0.5) * 0.003; // ~300m radius
      const offsetLng = (Math.random() - 0.5) * 0.003;
      
      const reportDate = new Date(baseDate);
      reportDate.setDate(baseDate.getDate() + Math.floor(Math.random() * 30));
      reportDate.setHours(Math.floor(Math.random() * 24));
      
      const report = {
        animalType: Math.random() > 0.6 ? 'dog' : 'cat',
        breed: 'Mixed',
        color: ['Black', 'White', 'Brown', 'Gray'][Math.floor(Math.random() * 4)],
        size: ['Small', 'Medium', 'Large'][Math.floor(Math.random() * 3)],
        condition: Math.random() > 0.6 ? 'abuse' : Math.random() > 0.3 ? 'fighting' : 'normal',
        location: `Cluster ${clusterIndex + 1} Location ${i + 1}`,
        address: `Cluster ${clusterIndex + 1} Street ${i + 1}, Lipa City`,
        latitude: cluster.center.lat + offsetLat,
        longitude: cluster.center.lng + offsetLng,
        description: `Clustered test report ${i + 1} for hotspot detection`,
        status: 'approved',
        submittedBy: {
          uid: `test-user-${clusterIndex}-${i}`,
          name: `Test User ${clusterIndex}-${i}`,
          email: `test${clusterIndex}${i}@example.com`
        },
        createdAt: reportDate.toISOString(),
        updatedAt: reportDate.toISOString()
      };
      
      reports.push(report);
    }
  });
  
  return reports;
};

// Add clustered data to Firebase
const addClusteredData = async () => {
  try {
    console.log('🚀 Adding clustered test data for hotspot detection...');
    
    const clusteredReports = createClusteredData();
    console.log(`📊 Generated ${clusteredReports.length} clustered reports`);
    
    // Add to approved reports
    for (const report of clusteredReports) {
      const newReportRef = ref(database, 'approvedReports');
      await push(newReportRef, report);
    }
    
    console.log('✅ Clustered test data added successfully!');
    console.log('🎯 Now refresh your admin dashboard to see hotspots and recommendations!');
    
  } catch (error) {
    console.error('❌ Error adding clustered data:', error);
  }
};

// Run the script
if (require.main === module) {
  addClusteredData().then(() => {
    console.log('🏁 Clustered data generation completed');
    process.exit(0);
  });
}

module.exports = { addClusteredData, createClusteredData };

