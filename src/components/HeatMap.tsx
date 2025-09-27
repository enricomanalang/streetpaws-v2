'use client';

import { useState, useEffect, useRef } from 'react';
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

// Simple HeatMap component without complex heatmap layer

export default function HeatMap() {
  const [markers, setMarkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>([14.0583, 121.1656]); // Lipa City coordinates
  const [mapZoom, setMapZoom] = useState(13);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

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
    const markersRef = ref(database, 'reports');
    
    const unsubscribe = onValue(markersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const markersList = Object.keys(data).map(key => ({
          id: key,
          ...data[key],
          position: [data[key].latitude || 14.0583, data[key].longitude || 121.1656],
          lat: data[key].latitude || 14.0583,
          lng: data[key].longitude || 121.1656,
          intensity: 1
        }));
        setMarkers(markersList);
      } else {
        setMarkers([]);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching markers:', error);
      setLoading(false);
    });

    return () => {
      off(markersRef, 'value', unsubscribe);
    };
  }, []);

  const filteredMarkers = markers.filter(marker => 
    marker.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    marker.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    marker.animalType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const createCustomIcon = (color: string) => {
    if (typeof window === 'undefined' || !window.L || !window.L.divIcon) {
      // Return a default icon if Leaflet is not available
      return window.L?.icon ? window.L.icon({
        iconUrl: 'data:image/svg+xml;base64,' + btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">
            <circle cx="6" cy="6" r="4" fill="${color}" stroke="white" stroke-width="2"/>
          </svg>
        `),
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      }) : null;
    }
    
    return window.L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });
  };

  const getMarkerColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'abuse': '#ef4444',
      'lost': '#f59e0b', 
      'found': '#10b981',
      'adoption': '#3b82f6',
      'default': '#6b7280'
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
              Heatmap: {markers.length} points
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
                        <h3 className="font-semibold text-sm">{marker.address || 'Unknown Location'}</h3>
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
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">
              {markers.filter(m => m.status === 'lost').length}
            </p>
            <p className="text-sm text-yellow-800">Lost Pets</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {markers.filter(m => m.status === 'found').length}
            </p>
            <p className="text-sm text-green-800">Found Pets</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}