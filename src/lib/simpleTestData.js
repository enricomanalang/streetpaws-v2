/**
 * Simple Test Data for Analytics
 * Run this in browser console to add test data
 */

// Sample data that will trigger hotspot detection
const sampleTestData = {
  approvedReports: [
    // Cluster 1: Downtown (High density)
    {
      animalType: 'dog',
      condition: 'abuse',
      latitude: 14.0583,
      longitude: 121.1656,
      description: 'Downtown abuse case 1',
      createdAt: new Date().toISOString(),
      status: 'approved'
    },
    {
      animalType: 'cat',
      condition: 'fighting',
      latitude: 14.0585,
      longitude: 121.1658,
      description: 'Downtown fighting case 1',
      createdAt: new Date().toISOString(),
      status: 'approved'
    },
    {
      animalType: 'dog',
      condition: 'abuse',
      latitude: 14.0587,
      longitude: 121.1660,
      description: 'Downtown abuse case 2',
      createdAt: new Date().toISOString(),
      status: 'approved'
    },
    {
      animalType: 'dog',
      condition: 'normal',
      latitude: 14.0589,
      longitude: 121.1662,
      description: 'Downtown normal case 1',
      createdAt: new Date().toISOString(),
      status: 'approved'
    },
    {
      animalType: 'cat',
      condition: 'abuse',
      latitude: 14.0591,
      longitude: 121.1664,
      description: 'Downtown abuse case 3',
      createdAt: new Date().toISOString(),
      status: 'approved'
    },
    
    // Cluster 2: Residential Area (Medium density)
    {
      animalType: 'dog',
      condition: 'fighting',
      latitude: 14.0600,
      longitude: 121.1680,
      description: 'Residential fighting case 1',
      createdAt: new Date().toISOString(),
      status: 'approved'
    },
    {
      animalType: 'cat',
      condition: 'normal',
      latitude: 14.0602,
      longitude: 121.1682,
      description: 'Residential normal case 1',
      createdAt: new Date().toISOString(),
      status: 'approved'
    },
    {
      animalType: 'dog',
      condition: 'abuse',
      latitude: 14.0604,
      longitude: 121.1684,
      description: 'Residential abuse case 1',
      createdAt: new Date().toISOString(),
      status: 'approved'
    },
    
    // Cluster 3: Industrial Area (High density)
    {
      animalType: 'dog',
      condition: 'abuse',
      latitude: 14.0560,
      longitude: 121.1620,
      description: 'Industrial abuse case 1',
      createdAt: new Date().toISOString(),
      status: 'approved'
    },
    {
      animalType: 'cat',
      condition: 'fighting',
      latitude: 14.0562,
      longitude: 121.1622,
      description: 'Industrial fighting case 1',
      createdAt: new Date().toISOString(),
      status: 'approved'
    },
    {
      animalType: 'dog',
      condition: 'abuse',
      latitude: 14.0564,
      longitude: 121.1624,
      description: 'Industrial abuse case 2',
      createdAt: new Date().toISOString(),
      status: 'approved'
    },
    {
      animalType: 'dog',
      condition: 'normal',
      latitude: 14.0566,
      longitude: 121.1626,
      description: 'Industrial normal case 1',
      createdAt: new Date().toISOString(),
      status: 'approved'
    },
    {
      animalType: 'cat',
      condition: 'abuse',
      latitude: 14.0568,
      longitude: 121.1628,
      description: 'Industrial abuse case 3',
      createdAt: new Date().toISOString(),
      status: 'approved'
    }
  ]
};

// Function to add test data to Firebase
window.addTestData = async () => {
  try {
    console.log('🚀 Adding test data to Firebase...');
    
    // Dynamic import to avoid SSR issues
    const { ref, push } = await import('firebase/database');
    const { database } = await import('@/lib/firebase');
    
    if (!database) {
      console.error('❌ Firebase not initialized');
      return;
    }
    
    // Clear existing data
    const { set } = await import('firebase/database');
    await set(ref(database, 'approvedReports'), {});
    
    // Add new test data
    for (const report of sampleTestData.approvedReports) {
      const newReportRef = ref(database, 'approvedReports');
      await push(newReportRef, {
        ...report,
        submittedBy: {
          uid: 'test-user',
          name: 'Test User',
          email: 'test@example.com'
        },
        location: report.description,
        address: `${report.description}, Lipa City`
      });
    }
    
    console.log('✅ Test data added successfully!');
    console.log(`📊 Added ${sampleTestData.approvedReports.length} reports`);
    console.log('🎯 Now refresh the analytics tabs to see the results!');
    
    alert(`✅ Test data added successfully!\n\n📊 Added ${sampleTestData.approvedReports.length} reports\n\n🎯 Now refresh the analytics tabs to see the results!`);
    
  } catch (error) {
    console.error('❌ Error adding test data:', error);
    alert(`❌ Error adding test data: ${error.message}`);
  }
};

// Function to clear test data
window.clearTestData = async () => {
  try {
    console.log('🧹 Clearing test data...');
    
    const { ref, set } = await import('firebase/database');
    const { database } = await import('@/lib/firebase');
    
    if (!database) {
      console.error('❌ Firebase not initialized');
      return;
    }
    
    await set(ref(database, 'approvedReports'), {});
    await set(ref(database, 'reports'), {});
    await set(ref(database, 'lostPets'), {});
    await set(ref(database, 'foundPets'), {});
    await set(ref(database, 'adoptionRequests'), {});
    
    console.log('✅ Test data cleared successfully!');
    alert('✅ Test data cleared successfully!');
    
  } catch (error) {
    console.error('❌ Error clearing test data:', error);
    alert(`❌ Error clearing test data: ${error.message}`);
  }
};

console.log('🔧 Test Data Functions Loaded!');
console.log('Run addTestData() to add sample data');
console.log('Run clearTestData() to clear all data');

