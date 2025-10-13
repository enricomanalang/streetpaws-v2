'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  MapPin, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react';
// Firebase imports - only used on client side

export default function TestDataGenerator() {
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [stats, setStats] = useState<any>(null);

  // Generate realistic test data with clear hotspots
  const generateRealisticTestData = () => {
    const reports = [];
    const baseDate = new Date('2024-01-01');
    
    // Define realistic hotspots in Lipa City
    const hotspots = [
      {
        name: "Downtown Commercial Area",
        center: { lat: 14.0583, lng: 121.1656 },
        reports: 12,
        severity: "high"
      },
      {
        name: "Residential Zone A", 
        center: { lat: 14.0600, lng: 121.1680 },
        reports: 8,
        severity: "medium"
      },
      {
        name: "Industrial District",
        center: { lat: 14.0560, lng: 121.1620 },
        reports: 10,
        severity: "high"
      },
      {
        name: "Market Area",
        center: { lat: 14.0620, lng: 121.1700 },
        reports: 6,
        severity: "medium"
      },
      {
        name: "School District",
        center: { lat: 14.0550, lng: 121.1750 },
        reports: 4,
        severity: "low"
      }
    ];
    
    const animalTypes = ['dog', 'cat', 'dog', 'dog', 'cat'];
    const conditions = ['abuse', 'fighting', 'normal', 'abuse', 'fighting', 'normal', 'normal'];
    const colors = ['Black', 'White', 'Brown', 'Gray', 'Orange', 'Mixed'];
    const sizes = ['Small', 'Medium', 'Large'];
    
    hotspots.forEach((hotspot, hotspotIndex) => {
      for (let i = 0; i < hotspot.reports; i++) {
        const offsetLat = (Math.random() - 0.5) * 0.002;
        const offsetLng = (Math.random() - 0.5) * 0.002;
        
        const reportDate = new Date(baseDate);
        reportDate.setMonth(baseDate.getMonth() + Math.floor(Math.random() * 6));
        reportDate.setDate(Math.floor(Math.random() * 28) + 1);
        reportDate.setHours(Math.floor(Math.random() * 24));
        
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
          description: `${hotspot.name} - Report ${i + 1}. ${condition === 'abuse' ? 'Animal appears to be in distress.' : condition === 'fighting' ? 'Multiple animals fighting.' : 'Animal sighting.'}`,
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

  const addTestDataToFirebase = async () => {
    // Dynamic import to avoid SSR issues
    const { ref, push, set } = await import('firebase/database');
    const { database } = await import('@/lib/firebase');
    
    if (!database) {
      alert('Firebase not initialized. Please check your configuration.');
      return;
    }

    setLoading(true);
    try {
      console.log('🚀 Generating realistic test data...');
      
      const testReports = generateRealisticTestData();
      console.log(`📊 Generated ${testReports.length} test reports`);
      
      // Clear existing test data
      console.log('🧹 Clearing existing test data...');
      await set(ref(database, 'approvedReports'), {});
      await set(ref(database, 'reports'), {});
      await set(ref(database, 'lostPets'), {});
      await set(ref(database, 'foundPets'), {});
      await set(ref(database, 'adoptionRequests'), {});
      
      // Add approved reports
      const approvedReports = testReports.filter(r => r.status === 'approved');
      for (const report of approvedReports) {
        const newReportRef = ref(database, 'approvedReports');
        await push(newReportRef, report);
      }
      
      // Add pending reports
      const pendingReports = testReports.filter(r => r.status === 'pending');
      for (const report of pendingReports) {
        const newReportRef = ref(database, 'reports');
        await push(newReportRef, report);
      }
      
      // Add lost pets
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
      
      const stats = {
        approvedReports: approvedReports.length,
        pendingReports: pendingReports.length,
        lostPets: lostPets.length,
        foundPets: foundPets.length,
        adoptionRequests: adoptionRequests.length,
        total: testReports.length
      };
      
      setStats(stats);
      setGenerated(true);
      
      console.log('✅ Test data generated successfully!');
      console.log('📈 Stats:', stats);
      
      alert(`✅ Test data generated successfully!\n\n📊 Data Summary:\n- Approved Reports: ${stats.approvedReports}\n- Pending Reports: ${stats.pendingReports}\n- Lost Pets: ${stats.lostPets}\n- Found Pets: ${stats.foundPets}\n- Adoption Requests: ${stats.adoptionRequests}\n\n🎯 Now refresh the analytics tabs to see the results!`);
      
    } catch (error) {
      console.error('❌ Error generating test data:', error);
      alert(`❌ Error generating test data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearTestData = async () => {
    // Dynamic import to avoid SSR issues
    const { set } = await import('firebase/database');
    const { database } = await import('@/lib/firebase');
    
    if (!database) {
      alert('Firebase not initialized.');
      return;
    }

    if (!confirm('Are you sure you want to clear all test data? This cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      await set(ref(database, 'approvedReports'), {});
      await set(ref(database, 'reports'), {});
      await set(ref(database, 'lostPets'), {});
      await set(ref(database, 'foundPets'), {});
      await set(ref(database, 'adoptionRequests'), {});
      
      setGenerated(false);
      setStats(null);
      alert('✅ All test data cleared successfully!');
      
    } catch (error) {
      console.error('❌ Error clearing test data:', error);
      alert(`❌ Error clearing test data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Test Data Generator</h2>
        <p className="text-gray-600">Generate realistic test data to demonstrate analytics functionality</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generator Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="w-5 h-5 mr-2" />
              Data Generator
            </CardTitle>
            <CardDescription>Generate realistic clustered data for analytics testing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button 
                onClick={addTestDataToFirebase} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating Data...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Generate Test Data
                  </>
                )}
              </Button>
              
              <Button 
                onClick={clearTestData} 
                disabled={loading || !generated}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Clear Test Data
              </Button>
            </div>
            
            {generated && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-800">Test data generated successfully!</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Generated Data
            </CardTitle>
            <CardDescription>Statistics of the generated test data</CardDescription>
          </CardHeader>
          <CardContent>
            {stats ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats.approvedReports}</div>
                    <div className="text-sm text-blue-800">Approved Reports</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{stats.pendingReports}</div>
                    <div className="text-sm text-yellow-800">Pending Reports</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{stats.lostPets}</div>
                    <div className="text-sm text-orange-800">Lost Pets</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stats.foundPets}</div>
                    <div className="text-sm text-green-800">Found Pets</div>
                  </div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{stats.total}</div>
                  <div className="text-sm text-purple-800">Total Records</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Database className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No data generated yet</p>
                <p className="text-sm">Click "Generate Test Data" to start</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Test Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">1. Generate Test Data</h4>
              <p>Click "Generate Test Data" above to create realistic clustered data that will trigger hotspot detection.</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">2. Test Descriptive Analytics</h4>
              <p>Go to "Heat Map" tab to see the generated data visualized on the map with density analysis.</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">3. Test Predictive Analytics</h4>
              <p>Go to "Predictive Analytics" tab to see forecasting charts and hotspot detection results.</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">4. Test Prescriptive Analytics</h4>
              <p>Go to "Prescriptive Analytics" tab to see resource allocation recommendations and strategic guidance.</p>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-blue-800">Expected Results:</p>
                  <ul className="list-disc list-inside ml-4 text-blue-700 mt-1">
                    <li>5 distinct hotspots should be detected</li>
                    <li>Resource allocation recommendations should appear</li>
                    <li>Strategic recommendations should be generated</li>
                    <li>Heat map should show clustered markers</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
