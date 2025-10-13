'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Target, 
  Users, 
  DollarSign, 
  Car, 
  Wrench, 
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  MapPin,
  RefreshCw,
  Download
} from 'lucide-react';
import { optimizeResourceAllocation, generateStrategicRecommendations } from '@/lib/prescriptiveAnalytics';
import { detectHotspots } from '@/lib/predictiveAnalytics';
import { ref, onValue, off } from 'firebase/database';
import { database } from '@/lib/firebase';

interface ResourceAllocation {
  id: string;
  hotspotId: string;
  zone: { latitude: number; longitude: number };
  priority: number;
  priorityLevel: string;
  recommendedActions: Array<{
    action: string;
    priority: string;
    description: string;
    timeframe: string;
    resources: string;
  }>;
  resourceAllocation: {
    volunteers: number;
    budget: number;
    vehicles: number;
    equipment: number;
  };
  expectedImpact: string;
  timeline: string;
  costBenefit: string;
  successProbability: number;
  note?: string;
}

interface StrategicRecommendation {
  type: string;
  priority: string;
  recommendation: string;
  rationale: string;
  timeframe: string;
}

const PRIORITY_COLORS = {
  'Critical': 'bg-red-100 text-red-800 border-red-200',
  'High': 'bg-orange-100 text-orange-800 border-orange-200',
  'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Low': 'bg-green-100 text-green-800 border-green-200'
};

export const PrescriptiveDashboard = () => {
  const [allocations, setAllocations] = useState<ResourceAllocation[]>([]);
  const [strategicRecommendations, setStrategicRecommendations] = useState<StrategicRecommendation[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [availableResources, setAvailableResources] = useState({
    volunteers: 15,
    budget: 75000,
    vehicles: 3,
    equipment: 8
  });

  useEffect(() => {
    if (!database) {
      setLoading(false);
      return;
    }

    const generateRecommendations = async () => {
      try {
        setLoading(true);
        
        // Fetch data from all collections
        const [reportsSnap, approvedSnap, rejectedSnap, lostSnap, foundSnap] = await Promise.all([
          new Promise(resolve => {
            const refs = ref(database, 'reports');
            onValue(refs, resolve, { onlyOnce: true });
          }),
          new Promise(resolve => {
            const refs = ref(database, 'approvedReports');
            onValue(refs, resolve, { onlyOnce: true });
          }),
          new Promise(resolve => {
            const refs = ref(database, 'rejectedReports');
            onValue(refs, resolve, { onlyOnce: true });
          }),
          new Promise(resolve => {
            const refs = ref(database, 'lostPets');
            onValue(refs, resolve, { onlyOnce: true });
          }),
          new Promise(resolve => {
            const refs = ref(database, 'foundPets');
            onValue(refs, resolve, { onlyOnce: true });
          })
        ]);

        // Process all data
        const allData: any[] = [];
        const collections = [
          { snap: reportsSnap, name: 'reports' },
          { snap: approvedSnap, name: 'approvedReports' },
          { snap: rejectedSnap, name: 'rejectedReports' },
          { snap: lostSnap, name: 'lostPets' },
          { snap: foundSnap, name: 'foundPets' }
        ];

        collections.forEach(({ snap, name }) => {
          if (snap.exists()) {
            const data = snap.val();
            const items = Object.keys(data).map(key => ({
              id: key,
              ...data[key],
              collection: name
            }));
            allData.push(...items);
          }
        });

        // Detect hotspots
        const hotspots = detectHotspots(allData);
        
        // Generate resource allocations
        const resourceAllocations = optimizeResourceAllocation(hotspots, availableResources);
        setAllocations(resourceAllocations);

        // Generate strategic recommendations
        const strategic = generateStrategicRecommendations(hotspots, availableResources);
        setStrategicRecommendations(strategic.recommendations);
        setSummary(strategic.summary);

        console.log('Prescriptive analytics generated:', {
          allocations: resourceAllocations.length,
          strategic: strategic.recommendations.length,
          summary: strategic.summary
        });

      } catch (error) {
        console.error('Error generating prescriptive analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    generateRecommendations();
  }, [availableResources]);

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  const exportRecommendations = () => {
    const data = {
      allocations,
      strategicRecommendations,
      summary,
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resource-allocation-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600">Generating resource allocation recommendations...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Prescriptive Analytics</h2>
          <p className="text-gray-600">Resource allocation and strategic recommendations</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportRecommendations} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Resource Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-600">{availableResources.volunteers}</div>
            <div className="text-sm text-gray-600">Available Volunteers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-600">₱{availableResources.budget.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Available Budget</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Car className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold text-purple-600">{availableResources.vehicles}</div>
            <div className="text-sm text-gray-600">Available Vehicles</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Wrench className="w-8 h-8 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold text-orange-600">{availableResources.equipment}</div>
            <div className="text-sm text-gray-600">Available Equipment</div>
          </CardContent>
        </Card>
      </div>

      {/* Strategic Recommendations */}
      {strategicRecommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Strategic Recommendations
            </CardTitle>
            <CardDescription>High-level strategic guidance for operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {strategicRecommendations.map((rec, index) => (
                <div key={index} className={`p-4 border rounded-lg ${PRIORITY_COLORS[rec.priority as keyof typeof PRIORITY_COLORS]}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <Target className="w-4 h-4 mr-2" />
                      <span className="font-semibold">{rec.type}</span>
                    </div>
                    <Badge variant="outline">{rec.priority}</Badge>
                  </div>
                  <p className="text-sm mb-2">{rec.recommendation}</p>
                  <p className="text-xs text-gray-600 mb-2">{rec.rationale}</p>
                  <div className="flex justify-between items-center text-xs">
                    <span>Timeframe: {rec.timeframe}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resource Allocations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Resource Allocation Plan
          </CardTitle>
          <CardDescription>Detailed resource allocation for each hotspot</CardDescription>
        </CardHeader>
        <CardContent>
          {allocations.length > 0 ? (
            <div className="space-y-4">
              {allocations.map((allocation) => (
                <div key={allocation.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="font-semibold">Zone {allocation.id.split('_')[1]}</span>
                    </div>
                    <div className="flex gap-2">
                      <Badge 
                        className={PRIORITY_COLORS[allocation.priorityLevel as keyof typeof PRIORITY_COLORS]}
                      >
                        {allocation.priorityLevel}
                      </Badge>
                      <Badge variant="outline">
                        {Math.round(allocation.successProbability * 100)}% Success
                      </Badge>
                    </div>
                  </div>

                  {/* Resource Allocation */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <Users className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                      <div className="text-sm font-medium">{allocation.resourceAllocation.volunteers}</div>
                      <div className="text-xs text-gray-600">Volunteers</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <DollarSign className="w-4 h-4 mx-auto mb-1 text-green-600" />
                      <div className="text-sm font-medium">₱{allocation.resourceAllocation.budget.toLocaleString()}</div>
                      <div className="text-xs text-gray-600">Budget</div>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded">
                      <Car className="w-4 h-4 mx-auto mb-1 text-purple-600" />
                      <div className="text-sm font-medium">{allocation.resourceAllocation.vehicles}</div>
                      <div className="text-xs text-gray-600">Vehicles</div>
                    </div>
                    <div className="text-center p-2 bg-orange-50 rounded">
                      <Wrench className="w-4 h-4 mx-auto mb-1 text-orange-600" />
                      <div className="text-sm font-medium">{allocation.resourceAllocation.equipment}</div>
                      <div className="text-xs text-gray-600">Equipment</div>
                    </div>
                  </div>

                  {/* Action Plan */}
                  <div className="mb-3">
                    <h4 className="font-medium text-sm mb-2">Recommended Actions:</h4>
                    <div className="space-y-1">
                      {allocation.recommendedActions.slice(0, 3).map((action, actionIndex) => (
                        <div key={actionIndex} className="flex items-center text-sm">
                          <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                          <span className="text-gray-700">{action.action}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {action.timeframe}
                          </Badge>
                        </div>
                      ))}
                      {allocation.recommendedActions.length > 3 && (
                        <div className="text-xs text-gray-500 ml-5">
                          +{allocation.recommendedActions.length - 3} more actions
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Impact and Timeline */}
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <div className="flex items-center">
                      <Target className="w-3 h-3 mr-1" />
                      Impact: {allocation.expectedImpact}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      Timeline: {allocation.timeline}
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Cost-Benefit: {allocation.costBenefit}
                    </div>
                  </div>

                  {allocation.note && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                      <AlertTriangle className="w-3 h-3 inline mr-1" />
                      {allocation.note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No resource allocations generated</p>
              <p className="text-sm">Ensure there are hotspots detected for allocation</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      {Object.keys(summary).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Summary Statistics</CardTitle>
            <CardDescription>Overall analysis summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-xl font-bold text-blue-600">{summary.totalHotspots || 0}</div>
                <div className="text-sm text-blue-800">Total Hotspots</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-xl font-bold text-red-600">{summary.criticalHotspots || 0}</div>
                <div className="text-sm text-red-800">Critical Hotspots</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-xl font-bold text-orange-600">{summary.totalReports || 0}</div>
                <div className="text-sm text-orange-800">Total Reports</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-xl font-bold text-green-600">{summary.resourceUtilization || 0}%</div>
                <div className="text-sm text-green-800">Resource Utilization</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PrescriptiveDashboard;

