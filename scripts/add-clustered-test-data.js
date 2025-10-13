/**
 * Add Clustered Test Data for Analytics Testing
 * This creates data in clusters to trigger hotspot detection
 */

const { initializeApp } = require('firebase/app');
const { getDatabase, ref, push } = require('firebase/database');
const { getAuth, signInWithEmailAndPassword, signInAnonymously } = require('firebase/auth');

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
const auth = getAuth(app);

async function ensureAuth() {
  const email = process.env.SEED_EMAIL;
  const password = process.env.SEED_PASSWORD;
  try {
    if (email && password) {
      console.log('🔐 Signing in with seed user...');
      await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Authenticated as seed user');
    } else {
      console.log('🔐 No SEED_EMAIL/PASSWORD provided; trying anonymous auth...');
      await signInAnonymously(auth);
      console.log('✅ Authenticated anonymously');
    }
  } catch (e) {
    console.error('❌ Authentication failed:', e.message || e);
    throw e;
  }
}

// Parse simple CLI args: --month=YYYY-MM OR --start=YYYY-MM --months=N
function parseCliOptions() {
  const args = process.argv.slice(2);
  const options = {};
  for (const arg of args) {
    const [key, value] = arg.split('=');
    if (key === '--month' && value) {
      options.fixedMonth = value; // YYYY-MM
    }
    if (key === '--start' && value) {
      options.startMonth = value; // YYYY-MM
    }
    if (key === '--months' && value) {
      const n = parseInt(value, 10);
      if (!Number.isNaN(n) && n > 0) options.months = n;
    }
  }
  return options;
}

function getRandomDateInMonth(year, monthIndex) {
  const start = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, monthIndex + 1, 0, 23, 59, 59));
  const ts = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(ts);
}

// Create clustered data for hotspot detection
const createClusteredData = (options = {}) => {
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
      
      let reportDate;
      if (options.fixedMonth) {
        const [y, m] = options.fixedMonth.split('-').map(Number);
        reportDate = getRandomDateInMonth(y, m - 1);
      } else if (options.startMonth && options.months) {
        const [y, m] = options.startMonth.split('-').map(Number);
        const monthOffset = Math.floor(Math.random() * options.months);
        const year = y + Math.floor((m - 1 + monthOffset) / 12);
        const monthIndex = (m - 1 + monthOffset) % 12;
        reportDate = getRandomDateInMonth(year, monthIndex);
      } else {
        reportDate = new Date(baseDate);
        reportDate.setDate(baseDate.getDate() + Math.floor(Math.random() * 30));
        reportDate.setHours(Math.floor(Math.random() * 24));
      }
      
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
    await ensureAuth();
    const options = parseCliOptions();
    if (options.fixedMonth) console.log(`📅 Using fixed month: ${options.fixedMonth}`);
    if (options.startMonth && options.months) console.log(`📅 Using range starting ${options.startMonth} for ${options.months} month(s)`);
    const clusteredReports = createClusteredData(options);
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

