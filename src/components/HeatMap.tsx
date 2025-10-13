'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Search, Trash2, Database, RefreshCw } from 'lucide-react';
import { ref, onValue, off } from 'firebase/database';
import { database } from '@/lib/firebase';

// Dynamically import MapContainer to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { 
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">Loading map...</div>
});

const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

// Enhanced HeatMap component with true heatmap density visualization

export default function HeatMap() {
  const [markers, setMarkers] = useState<Array<{
    id: string;
    [key: string]: any;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>([14.0583, 121.1656]); // Lipa City coordinates
  const [mapZoom, setMapZoom] = useState(13);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [heatmapData, setHeatmapData] = useState<Array<{lat: number, lng: number, intensity: number}>>([]);
  const [densityStats, setDensityStats] = useState<{
    totalZones: number;
    highDensityZones: number;
    avgDensity: number;
    maxDensity: number;
  }>({ totalZones: 0, highDensityZones: 0, avgDensity: 0, maxDensity: 0 });

  // Load Leaflet CSS and JS
  useEffect(() => {
    const loadLeaflet = () => {
      // Check if Leaflet is already loaded
      if (typeof window !== 'undefined' && window.L) {
        setLeafletLoaded(true);
        return;
      }

      // Add timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        console.warn('Leaflet loading timeout - map may not display properly');
        setLeafletLoaded(false);
      }, 10000); // 10 second timeout

      // Load Leaflet CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      // Load Leaflet JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => {
        clearTimeout(timeout);
        console.log('Leaflet loaded successfully');
        setLeafletLoaded(true);
      };
      script.onerror = () => {
        clearTimeout(timeout);
        console.error('Failed to load Leaflet from CDN, trying fallback...');
        // Try a different CDN as fallback
        const fallbackScript = document.createElement('script');
        fallbackScript.src = 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js';
        fallbackScript.onload = () => {
          console.log('Leaflet loaded from fallback CDN');
          setLeafletLoaded(true);
        };
        fallbackScript.onerror = () => {
          console.error('Failed to load Leaflet from all CDNs');
          setLeafletLoaded(false);
        };
        document.head.appendChild(fallbackScript);
      };
      document.head.appendChild(script);

      return () => {
        clearTimeout(timeout);
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
        // Clean up fallback script if it exists
        const fallbackScript = document.querySelector('script[src*="cdn.jsdelivr.net/npm/leaflet"]');
        if (fallbackScript && document.head.contains(fallbackScript)) {
          document.head.removeChild(fallbackScript);
        }
      };
    };

    loadLeaflet();
  }, []);

  // Fetch markers from Firebase
  useEffect(() => {
    if (!database) return;

    setLoading(true);
    const markersRef = ref(database, 'approvedReports');
    
    const unsubscribe = onValue(markersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log('=== HEATMAP DATA DEBUG ===');
        console.log('Raw Firebase data (approved reports):', data);
        
        const approvedReports = Object.keys(data);
        console.log(`Approved reports: ${approvedReports.length}`);
        
        const markersList = approvedReports
          .map(key => {
            const marker = {
              id: key,
              ...data[key],
              position: [data[key].latitude || 14.0583, data[key].longitude || 121.1656],
              lat: data[key].latitude || 14.0583,
              lng: data[key].longitude || 121.1656,
              intensity: 1
            };
            console.log(`Marker ${key}:`, {
              location: marker.location,
              address: marker.address,
              description: marker.description,
              animalType: marker.animalType,
              condition: marker.condition,
              status: marker.status
            });
            return marker;
          });
        setMarkers(markersList);
        console.log('Processed markers:', markersList);
        
        // Generate heatmap data
        const heatmapPoints = generateHeatmapData(markersList);
        setHeatmapData(heatmapPoints);
        
        // Calculate density statistics
        const densityData = calculateDensityStats(markersList);
        setDensityStats(densityData);
      } else {
        setMarkers([]);
        setHeatmapData([]);
        setDensityStats({ totalZones: 0, highDensityZones: 0, avgDensity: 0, maxDensity: 0 });
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching markers:', error);
      setLoading(false);
    });

    return () => {
      try { unsubscribe(); } catch {}
    };
  }, []);

  const filteredMarkers = markers.filter(marker => 
    marker.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    marker.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    marker.animalType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const createCustomIcon = (color: string) => {
    if (typeof window === 'undefined' || !window.L) {
      return null;
    }
    
    // Use SVG icon for better color consistency
    return window.L.icon({
      iconUrl: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
          <circle cx="8" cy="8" r="6" fill="${color}" stroke="white" stroke-width="2"/>
          <circle cx="8" cy="8" r="3" fill="white"/>
        </svg>
      `),
      iconSize: [16, 16],
      iconAnchor: [8, 8],
      popupAnchor: [0, -8]
    });
  };

  const getMarkerColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'abuse': '#ef4444',      // Red for abuse
      'lost': '#f59e0b',       // Orange for lost
      'found': '#10b981',      // Green for found
      'adoption': '#3b82f6',   // Blue for adoption
      'default': '#ef4444'     // Red as default (was gray)
    };
    return colors[type] || colors.default;
  };

  const handleSearch = () => {
    if (filteredMarkers.length > 0) {
      const firstMarker = filteredMarkers[0];
      setMapCenter([firstMarker.lat, firstMarker.lng]);
      setMapZoom(15);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setMapCenter([14.0583, 121.1656]);
    setMapZoom(13);
  };

  const refreshData = () => {
    setLoading(true);
    // Data will be refreshed by the useEffect
    setTimeout(() => setLoading(false), 1000);
  };

  // Generate heatmap data with intensity calculation
  const generateHeatmapData = (markers: any[]) => {
    return markers.map(marker => {
      const intensity = calculateIntensity(marker);
      return {
        lat: marker.latitude || 14.0583,
        lng: marker.longitude || 121.1656,
        intensity: intensity
      };
    });
  };

  // Calculate intensity based on severity, recency, and type
  const calculateIntensity = (marker: any) => {
    const daysSinceReport = (Date.now() - new Date(marker.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24);
    const severity = marker.condition === 'abuse' || marker.condition === 'fighting' ? 1.0 : 0.5;
    const recency = Math.max(0, 1 - (daysSinceReport / 30)); // Decay over 30 days
    const typeMultiplier = marker.animalType === 'dog' ? 1.2 : marker.animalType === 'cat' ? 1.0 : 0.8;
    
    return Math.min(1.0, severity * recency * typeMultiplier);
  };

  // Calculate density statistics by dividing area into zones
  const calculateDensityStats = (markers: any[]) => {
    const gridSize = 0.01; // ~1km grid
    const zones: { [key: string]: number } = {};
    
    markers.forEach(marker => {
      if (marker.latitude && marker.longitude) {
        const zoneX = Math.floor(marker.latitude / gridSize);
        const zoneY = Math.floor(marker.longitude / gridSize);
        const zoneKey = `${zoneX},${zoneY}`;
        zones[zoneKey] = (zones[zoneKey] || 0) + 1;
      }
    });
    
    const zoneCounts = Object.values(zones);
    const totalZones = zoneCounts.length;
    const highDensityZones = zoneCounts.filter(count => count >= 3).length;
    const avgDensity = zoneCounts.length > 0 ? zoneCounts.reduce((sum, count) => sum + count, 0) / zoneCounts.length : 0;
    const maxDensity = zoneCounts.length > 0 ? Math.max(...zoneCounts) : 0;
    
    return {
      totalZones,
      highDensityZones,
      avgDensity: Math.round(avgDensity * 100) / 100,
      maxDensity
    };
  };

  if (typeof window === 'undefined') {
    return (
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Heat Map</CardTitle>
          <CardDescription>Loading map component...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Loading map...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Heat Map Analytics</CardTitle>
        <CardDescription>Visualize animal welfare data across Lipa City</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by location, description, or animal type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSearch} size="sm">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
              <Button onClick={clearSearch} variant="outline" size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
              <Button onClick={refreshData} variant="outline" size="sm" disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <Button
              variant={showHeatmap ? "default" : "outline"}
              size="sm"
              onClick={() => setShowHeatmap(!showHeatmap)}
            >
              <Database className="w-4 h-4 mr-2" />
              Heatmap
            </Button>
            <Button
              variant={showMarkers ? "default" : "outline"}
              size="sm"
              onClick={() => setShowMarkers(!showMarkers)}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Markers
            </Button>
          </div>
        </div>

        {/* Map */}
        <div className="h-96 rounded-lg overflow-hidden border border-gray-200 relative">
          {/* Heatmap Indicator */}
          {showHeatmap && markers.length > 0 && (
            <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded text-sm z-10">
              Heatmap: {markers.length} points | Density: {densityStats.avgDensity}/zone
            </div>
          )}
          
          {!leafletLoaded ? (
            <div className="h-full flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Loading map...</p>
                <p className="text-xs text-gray-500 mt-2">If this takes too long, please refresh the page</p>
              </div>
            </div>
          ) : (
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              style={{ height: '100%', width: '100%' }}
              key={`${mapCenter[0]}-${mapCenter[1]}-${mapZoom}`}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Individual Markers */}
              {showMarkers && filteredMarkers.map((marker) => {
                const icon = createCustomIcon(getMarkerColor(marker.animalType || 'default'));
                if (!icon) return null; // Skip rendering if icon creation failed
                
                return (
                  <Marker
                    key={marker.id}
                    position={marker.position}
                    icon={icon}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-semibold text-sm">{marker.location || marker.address || 'Unknown Location'}</h3>
                        <p className="text-xs text-gray-600 mt-1">{marker.description || 'No description'}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Type: <span className="capitalize">{marker.animalType || 'Unknown'}</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          Date: {marker.createdAt ? new Date(marker.createdAt).toLocaleDateString() : 'Unknown date'}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          )}
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{markers.length}</p>
            <p className="text-sm text-blue-800">Total Reports</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">
              {markers.filter(m => m.condition === 'fighting' || m.condition === 'abuse').length}
            </p>
            <p className="text-sm text-red-800">Abuse Cases</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{densityStats.totalZones}</p>
            <p className="text-sm text-purple-800">Active Zones</p>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <p className="text-2xl font-bold text-orange-600">{densityStats.highDensityZones}</p>
            <p className="text-sm text-orange-800">High Density</p>
          </div>
        </div>

        {/* Density Analysis */}
        {densityStats.totalZones > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Population Density Analysis</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Average Density:</span>
                <span className="ml-2 font-medium">{densityStats.avgDensity} reports/zone</span>
              </div>
              <div>
                <span className="text-gray-600">Maximum Density:</span>
                <span className="ml-2 font-medium">{densityStats.maxDensity} reports</span>
              </div>
              <div>
                <span className="text-gray-600">High Density Zones:</span>
                <span className="ml-2 font-medium">{Math.round((densityStats.highDensityZones / densityStats.totalZones) * 100)}%</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}