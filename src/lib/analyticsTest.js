/**
 * Browser Console Test for Analytics
 * Run this in the browser console to test analytics functions
 */

// Test data for analytics
const testData = {
  historical: [
    { month: 0, value: 10 },
    { month: 1, value: 12 },
    { month: 2, value: 8 },
    { month: 3, value: 15 },
    { month: 4, value: 18 },
    { month: 5, value: 14 },
    { month: 6, value: 20 },
    { month: 7, value: 16 },
    { month: 8, value: 22 },
    { month: 9, value: 19 },
    { month: 10, value: 25 },
    { month: 11, value: 21 }
  ],
  markers: [
    {
      id: '1',
      latitude: 14.0583,
      longitude: 121.1656,
      condition: 'abuse',
      animalType: 'dog',
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      latitude: 14.0593,
      longitude: 121.1666,
      condition: 'fighting',
      animalType: 'cat',
      createdAt: '2024-01-16T11:00:00Z'
    },
    {
      id: '3',
      latitude: 14.0603,
      longitude: 121.1676,
      condition: 'normal',
      animalType: 'dog',
      createdAt: '2024-01-17T12:00:00Z'
    },
    {
      id: '4',
      latitude: 14.0613,
      longitude: 121.1686,
      condition: 'abuse',
      animalType: 'dog',
      createdAt: '2024-01-18T13:00:00Z'
    },
    {
      id: '5',
      latitude: 14.0623,
      longitude: 121.1696,
      condition: 'normal',
      animalType: 'cat',
      createdAt: '2024-01-19T14:00:00Z'
    }
  ],
  resources: {
    volunteers: 10,
    budget: 50000,
    vehicles: 2,
    equipment: 5
  }
};

// Test functions
window.testAnalytics = {
  // Test predictive analytics
  async testPredictive() {
    console.log('🧪 Testing Predictive Analytics...');
    
    try {
      // Import the functions (you'll need to adjust the path)
      const { forecastAnimalReports, detectHotspots, analyzeTrends } = await import('./predictiveAnalytics.js');
      
      // Test forecasting
      console.log('\n📈 Testing Forecasting:');
      const forecast = forecastAnimalReports(testData.historical);
      console.log('Forecast results:', forecast);
      
      // Test hotspot detection
      console.log('\n🎯 Testing Hotspot Detection:');
      const hotspots = detectHotspots(testData.markers);
      console.log('Hotspots detected:', hotspots);
      
      // Test trend analysis
      console.log('\n📊 Testing Trend Analysis:');
      const trends = analyzeTrends(testData.historical);
      console.log('Trend analysis:', trends);
      
      console.log('✅ Predictive Analytics Test Complete!');
      return { forecast, hotspots, trends };
      
    } catch (error) {
      console.error('❌ Predictive Analytics Test Failed:', error);
      return null;
    }
  },
  
  // Test prescriptive analytics
  async testPrescriptive() {
    console.log('🧪 Testing Prescriptive Analytics...');
    
    try {
      // Import the functions
      const { optimizeResourceAllocation, generateStrategicRecommendations } = await import('./prescriptiveAnalytics.js');
      const { detectHotspots } = await import('./predictiveAnalytics.js');
      
      // First detect hotspots
      const hotspots = detectHotspots(testData.markers);
      console.log('Hotspots for prescriptive analysis:', hotspots.length);
      
      // Test resource allocation
      console.log('\n💼 Testing Resource Allocation:');
      const allocations = optimizeResourceAllocation(hotspots, testData.resources);
      console.log('Resource allocations:', allocations);
      
      // Test strategic recommendations
      console.log('\n🎯 Testing Strategic Recommendations:');
      const strategic = generateStrategicRecommendations(hotspots, testData.resources);
      console.log('Strategic recommendations:', strategic);
      
      console.log('✅ Prescriptive Analytics Test Complete!');
      return { allocations, strategic };
      
    } catch (error) {
      console.error('❌ Prescriptive Analytics Test Failed:', error);
      return null;
    }
  },
  
  // Run all tests
  async runAllTests() {
    console.log('🚀 Running All Analytics Tests...\n');
    
    const predictiveResults = await this.testPredictive();
    const prescriptiveResults = await this.testPrescriptive();
    
    console.log('\n📋 Test Summary:');
    console.log('Predictive Analytics:', predictiveResults ? '✅ PASS' : '❌ FAIL');
    console.log('Prescriptive Analytics:', prescriptiveResults ? '✅ PASS' : '❌ FAIL');
    
    if (predictiveResults && prescriptiveResults) {
      console.log('\n🎉 All analytics tests passed!');
    } else {
      console.log('\n❌ Some tests failed. Check the console for details.');
    }
    
    return { predictiveResults, prescriptiveResults };
  },
  
  // Test data visualization
  testVisualization() {
    console.log('🎨 Testing Data Visualization...');
    
    // Check if charts are rendering
    const charts = document.querySelectorAll('[class*="recharts"]');
    console.log(`Found ${charts.length} chart elements`);
    
    // Check if map is loading
    const mapContainer = document.querySelector('.leaflet-container');
    console.log('Map container found:', !!mapContainer);
    
    // Check for analytics components
    const predictiveTab = document.querySelector('[data-tab="predictive"]');
    const prescriptiveTab = document.querySelector('[data-tab="prescriptive"]');
    console.log('Predictive tab found:', !!predictiveTab);
    console.log('Prescriptive tab found:', !!prescriptiveTab);
    
    console.log('✅ Visualization Test Complete!');
  }
};

// Auto-run basic test when loaded
console.log('🔧 Analytics Test Suite Loaded!');
console.log('Run window.testAnalytics.runAllTests() to test all analytics functions');
console.log('Run window.testAnalytics.testPredictive() to test predictive analytics only');
console.log('Run window.testAnalytics.testPrescriptive() to test prescriptive analytics only');
console.log('Run window.testAnalytics.testVisualization() to test UI components');

