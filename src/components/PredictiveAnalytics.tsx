'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  AlertTriangle, 
  MapPin, 
  Calendar,
  Target,
  Activity,
  RefreshCw
} from 'lucide-react';
import { forecastAnimalReports, detectHotspots, analyzeTrends } from '@/lib/predictiveAnalytics';
import { ref, onValue, off } from 'firebase/database';
import { database } from '@/lib/firebase';

interface ForecastData {
  month: string;
  predicted: number;
  confidence: number;
  trend: string;
}

interface HotspotData {
  id: string;
  center: { latitude: number; longitude: number };
  size: number;
  severity: number;
  risk: number;
  priority: number;
  markers: any[];
}

interface TrendData {
  trend: string;
  slope: number;
  confidence: number;
  direction: string;
}

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];

export const PredictiveDashboard = () => {
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [hotspots, setHotspots] = useState<HotspotData[]>([]);
  const [trends, setTrends] = useState<TrendData>({ trend: 'stable', slope: 0, confidence: 0, direction: 'flat' });
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (!database) {
      setLoading(false);
      return;
    }

    const generatePredictions = async () => {
      try {
        setLoading(true);
        
        // Fetch historical data from all collections
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

        // Process historical data for forecasting
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

        // Generate monthly data for forecasting
        const monthlyData = generateMonthlyData(allData, selectedYear);
        
        // Generate predictions
        const forecastData = forecastAnimalReports(monthlyData);
        setForecast(forecastData);

        // Detect hotspots
        const hotspotData = detectHotspots(allData);
        setHotspots(hotspotData);

        // Analyze trends
        const trendData = analyzeTrends(monthlyData);
        setTrends(trendData);

        console.log('Predictive analytics generated:', {
          forecast: forecastData.length,
          hotspots: hotspotData.length,
          trends: trendData
        });

      } catch (error) {
        console.error('Error generating predictions:', error);
      } finally {
        setLoading(false);
      }
    };

    generatePredictions();
  }, [selectedYear]);

  const generateMonthlyData = (data: any[], year: number) => {
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i,
      value: 0
    }));

    data.forEach(item => {
      if (item.createdAt) {
        const date = new Date(item.createdAt);
        if (date.getFullYear() === year) {
          const month = date.getMonth();
          monthlyData[month].value += 1;
        }
      }
    });

    return monthlyData;
  };

  const refreshData = () => {
    setLoading(true);
    // Trigger re-fetch
    setTimeout(() => setLoading(false), 1000);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600">Generating predictive analytics...</p>
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
          <h2 className="text-2xl font-bold text-gray-900">Predictive Analytics</h2>
          <p className="text-gray-600">Forecast trends and identify high-risk areas</p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <Button onClick={refreshData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Trend Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Trend Analysis
          </CardTitle>
          <CardDescription>Current data trends and patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 capitalize">{trends.trend}</div>
              <div className="text-sm text-blue-800">Overall Trend</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{trends.confidence}%</div>
              <div className="text-sm text-green-800">Confidence</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{trends.slope}</div>
              <div className="text-sm text-purple-800">Slope</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Forecast and Hotspots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 6-Month Forecast */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              6-Month Forecast
            </CardTitle>
            <CardDescription>Predicted animal reports for next 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            {forecast.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={forecast}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any, name: string) => [
                      name === 'predicted' ? `${value} reports` : `${value}%`,
                      name === 'predicted' ? 'Predicted' : 'Confidence'
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#8884d8" 
                    strokeWidth={3}
                    dot={{ fill: '#8884d8', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Insufficient data for forecasting</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* High-Risk Hotspots */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              High-Risk Hotspots
            </CardTitle>
            <CardDescription>Areas requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            {hotspots.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {hotspots.slice(0, 5).map((hotspot, index) => (
                  <div key={hotspot.id} className="p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="font-medium">Zone {index + 1}</span>
                      </div>
                      <Badge 
                        variant={hotspot.risk > 0.7 ? "destructive" : hotspot.risk > 0.4 ? "secondary" : "outline"}
                      >
                        Risk: {Math.round(hotspot.risk * 100)}%
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Reports:</span> {hotspot.size}
                      </div>
                      <div>
                        <span className="font-medium">Severity:</span> {Math.round(hotspot.severity * 100)}%
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-xs text-gray-500">
                        Priority: {Math.round(hotspot.priority * 100)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No hotspots detected</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Hotspot Distribution */}
      {hotspots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Hotspot Risk Distribution
            </CardTitle>
            <CardDescription>Distribution of risk levels across detected hotspots</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'High Risk', value: hotspots.filter(h => h.risk > 0.7).length, color: '#FF6B6B' },
                    { name: 'Medium Risk', value: hotspots.filter(h => h.risk > 0.4 && h.risk <= 0.7).length, color: '#FFEAA7' },
                    { name: 'Low Risk', value: hotspots.filter(h => h.risk <= 0.4).length, color: '#96CEB4' }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[
                    { name: 'High Risk', value: hotspots.filter(h => h.risk > 0.7).length, color: '#FF6B6B' },
                    { name: 'Medium Risk', value: hotspots.filter(h => h.risk > 0.4 && h.risk <= 0.7).length, color: '#FFEAA7' },
                    { name: 'Low Risk', value: hotspots.filter(h => h.risk <= 0.4).length, color: '#96CEB4' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{hotspots.length}</div>
            <div className="text-sm text-gray-600">Total Hotspots</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {hotspots.filter(h => h.risk > 0.7).length}
            </div>
            <div className="text-sm text-gray-600">High Risk</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {hotspots.reduce((sum, h) => sum + h.size, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Reports</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{trends.confidence}%</div>
            <div className="text-sm text-gray-600">Forecast Confidence</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PredictiveDashboard;

