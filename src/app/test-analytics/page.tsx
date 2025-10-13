'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  BarChart3,
  TrendingUp,
  Target
} from 'lucide-react';
import { forecastAnimalReports, detectHotspots, analyzeTrends } from '@/lib/predictiveAnalytics';
import { optimizeResourceAllocation, generateStrategicRecommendations } from '@/lib/prescriptiveAnalytics';

export default function TestAnalyticsPage() {
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testData, setTestData] = useState<any>(null);

  // Sample test data
  const generateTestData = () => {
    const historical = Array.from({ length: 12 }, (_, i) => ({
      month: i,
      value: Math.floor(Math.random() * 20) + 5
    }));

    const markers = Array.from({ length: 15 }, (_, i) => ({
      id: `test-${i}`,
      latitude: 14.0583 + (Math.random() - 0.5) * 0.02,
      longitude: 121.1656 + (Math.random() - 0.5) * 0.02,
      condition: ['abuse', 'fighting', 'normal'][Math.floor(Math.random() * 3)],
      animalType: ['dog', 'cat'][Math.floor(Math.random() * 2)],
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    }));

    const resources = {
      volunteers: 10,
      budget: 50000,
      vehicles: 2,
      equipment: 5
    };

    return { historical, markers, resources };
  };

  const runPredictiveTest = async () => {
    try {
      console.log('🧪 Testing Predictive Analytics...');
      
      const forecast = forecastAnimalReports(testData.historical);
      const hotspots = detectHotspots(testData.markers);
      const trends = analyzeTrends(testData.historical);
      
      return {
        success: true,
        forecast: forecast.length,
        hotspots: hotspots.length,
        trends: trends,
        data: { forecast, hotspots, trends }
      };
    } catch (error) {
      console.error('Predictive test failed:', error);
      return { success: false, error: error.message };
    }
  };

  const runPrescriptiveTest = async () => {
    try {
      console.log('🧪 Testing Prescriptive Analytics...');
      
      const hotspots = detectHotspots(testData.markers);
      const allocations = optimizeResourceAllocation(hotspots, testData.resources);
      const strategic = generateStrategicRecommendations(hotspots, testData.resources);
      
      return {
        success: true,
        allocations: allocations.length,
        strategic: strategic.recommendations.length,
        data: { allocations, strategic }
      };
    } catch (error) {
      console.error('Prescriptive test failed:', error);
      return { success: false, error: error.message };
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    setTestData(generateTestData());
    
    try {
      const predictiveResults = await runPredictiveTest();
      const prescriptiveResults = await runPrescriptiveTest();
      
      const results = {
        timestamp: new Date().toISOString(),
        predictive: predictiveResults,
        prescriptive: prescriptiveResults,
        overall: predictiveResults.success && prescriptiveResults.success
      };
      
      setTestResults(results);
      console.log('Test results:', results);
    } catch (error) {
      console.error('Test failed:', error);
      setTestResults({
        timestamp: new Date().toISOString(),
        error: error.message,
        overall: false
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTestData(generateTestData());
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Test Suite</h1>
          <p className="text-gray-600">Test the predictive and prescriptive analytics functionality</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Test Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Play className="w-5 h-5 mr-2" />
                Test Controls
              </CardTitle>
              <CardDescription>Run analytics tests to verify functionality</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={runAllTests} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Running Tests...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run All Tests
                  </>
                )}
              </Button>
              
              {testData && (
                <div className="text-sm text-gray-600">
                  <p>Test Data Generated:</p>
                  <ul className="list-disc list-inside ml-4">
                    <li>{testData.historical.length} historical data points</li>
                    <li>{testData.markers.length} marker locations</li>
                    <li>{testData.resources.volunteers} volunteers available</li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Results Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Test Results
              </CardTitle>
              <CardDescription>Overall test status and summary</CardDescription>
            </CardHeader>
            <CardContent>
              {testResults ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Overall Status:</span>
                    <Badge variant={testResults.overall ? "default" : "destructive"}>
                      {testResults.overall ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          PASS
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          FAIL
                        </>
                      )}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p>Last run: {new Date(testResults.timestamp).toLocaleString()}</p>
                  </div>
                  
                  {testResults.error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
                      Error: {testResults.error}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No tests run yet</p>
                  <p className="text-sm">Click "Run All Tests" to start</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detailed Results */}
        {testResults && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Predictive Analytics Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Predictive Analytics
                </CardTitle>
                <CardDescription>Forecasting and hotspot detection results</CardDescription>
              </CardHeader>
              <CardContent>
                {testResults.predictive ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Status:</span>
                      <Badge variant={testResults.predictive.success ? "default" : "destructive"}>
                        {testResults.predictive.success ? "PASS" : "FAIL"}
                      </Badge>
                    </div>
                    
                    {testResults.predictive.success ? (
                      <>
                        <div className="text-sm">
                          <p>Forecast points: {testResults.predictive.forecast}</p>
                          <p>Hotspots detected: {testResults.predictive.hotspots}</p>
                          <p>Trend: {testResults.predictive.trends?.trend}</p>
                          <p>Confidence: {testResults.predictive.trends?.confidence}%</p>
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-red-600">
                        Error: {testResults.predictive.error}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No predictive test results</div>
                )}
              </CardContent>
            </Card>

            {/* Prescriptive Analytics Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Prescriptive Analytics
                </CardTitle>
                <CardDescription>Resource allocation and recommendations results</CardDescription>
              </CardHeader>
              <CardContent>
                {testResults.prescriptive ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Status:</span>
                      <Badge variant={testResults.prescriptive.success ? "default" : "destructive"}>
                        {testResults.prescriptive.success ? "PASS" : "FAIL"}
                      </Badge>
                    </div>
                    
                    {testResults.prescriptive.success ? (
                      <>
                        <div className="text-sm">
                          <p>Allocations generated: {testResults.prescriptive.allocations}</p>
                          <p>Strategic recommendations: {testResults.prescriptive.strategic}</p>
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-red-600">
                        Error: {testResults.prescriptive.error}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No prescriptive test results</div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How to Test Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">1. Run Automated Tests</h4>
                <p>Click "Run All Tests" above to test the analytics functions with sample data.</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">2. Test in Admin Dashboard</h4>
                <p>Go to <code>/admin</code> and click on "Predictive Analytics" and "Prescriptive Analytics" tabs to see the full UI.</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">3. Add Real Data</h4>
                <p>Run <code>node scripts/test-analytics-data.js</code> to add sample data to your Firebase database.</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">4. Browser Console Testing</h4>
                <p>Open browser console and run <code>window.testAnalytics.runAllTests()</code> for detailed testing.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

