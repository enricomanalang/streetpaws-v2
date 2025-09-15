'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Search, Trash2 } from 'lucide-react';

// Dynamically import MapContainer to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

interface MapMarker {
  id: string;
  position: [number, number];
  address: string;
  type: 'lost' | 'found' | 'adoption' | 'volunteer';
  description?: string;
  date: string;
}

export default function HeatMap() {
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [addressInput, setAddressInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([14.5995, 120.9842]); // Manila coordinates
  const [mapKey, setMapKey] = useState(0); // For forcing map re-render
  const [mapStyle, setMapStyle] = useState('voyager'); // Default modern style
  const mapRef = useRef<any>(null);

  // Map style options
  const mapStyles = {
    voyager: {
      name: 'Voyager (Modern)',
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    },
    positron: {
      name: 'Positron (Light)',
      url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    },
    dark: {
      name: 'Dark Matter',
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    },
    satellite: {
      name: 'Satellite',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, Maxar, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'
    }
  };

  // Load Leaflet CSS
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Geocode address to coordinates
  const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=ph`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  // Add marker to map
  const addMarker = async () => {
    if (!addressInput.trim()) return;

    setIsSearching(true);
    const coordinates = await geocodeAddress(addressInput);
    
    if (coordinates) {
      const newMarker: MapMarker = {
        id: Date.now().toString(),
        position: coordinates,
        address: addressInput,
        type: 'lost', // Default type
        description: `Report added on ${new Date().toLocaleDateString()}`,
        date: new Date().toISOString()
      };

      setMarkers(prev => [...prev, newMarker]);
      setMapCenter(coordinates);
      setMapKey(prev => prev + 1); // Force map re-render
      setAddressInput('');
    } else {
      alert('Address not found. Please try a different address.');
    }
    
    setIsSearching(false);
  };

  // Remove marker
  const removeMarker = (id: string) => {
    setMarkers(prev => prev.filter(marker => marker.id !== id));
  };

  // Clear all markers
  const clearAllMarkers = () => {
    setMarkers([]);
  };


  // Get marker color based on type
  const getMarkerColor = (type: string) => {
    switch (type) {
      case 'lost': return 'red';
      case 'found': return 'green';
      case 'adoption': return 'blue';
      case 'volunteer': return 'purple';
      default: return 'gray';
    }
  };

  // Create custom marker icon
  const createCustomIcon = (color: string) => {
    if (typeof window !== 'undefined' && window.L) {
      return window.L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          background: linear-gradient(135deg, ${color}, ${color}dd);
          width: 24px;
          height: 24px;
          border-radius: 50% 50% 50% 0;
          border: 3px solid white;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.1);
          transform: rotate(-45deg);
          position: relative;
        ">
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(45deg);
            width: 8px;
            height: 8px;
            background: white;
            border-radius: 50%;
          "></div>
        </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 24]
      });
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Address Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Add Location to Heat Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter address (e.g., Quezon City, Metro Manila)"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addMarker()}
              className="flex-1"
            />
            <Button 
              onClick={addMarker} 
              disabled={isSearching || !addressInput.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSearching ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>
          <div className="flex gap-2 mt-3">
            <Button 
              onClick={clearAllMarkers}
              variant="outline"
              size="sm"
              className="text-red-600 border-red-600 hover:bg-red-50"
              disabled={markers.length === 0}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Enter a Philippine address to add a marker to the heat map
          </p>
        </CardContent>
      </Card>

      {/* Map Container */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Interactive Heat Map</CardTitle>
              <p className="text-sm text-gray-600">
                {markers.length} location{markers.length !== 1 ? 's' : ''} marked
              </p>
            </div>
            <div className="flex gap-2">
              <select
                value={mapStyle}
                onChange={(e) => setMapStyle(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(mapStyles).map(([key, style]) => (
                  <option key={key} value={key}>
                    {style.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-96 w-full rounded-lg overflow-hidden border">
            {typeof window !== 'undefined' && (
              <MapContainer
                key={mapKey}
                center={mapCenter}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                ref={mapRef}
              >
                <TileLayer
                  url={mapStyles[mapStyle as keyof typeof mapStyles].url}
                  attribution={mapStyles[mapStyle as keyof typeof mapStyles].attribution}
                />
                {markers.map((marker) => (
                  <Marker
                    key={marker.id}
                    position={marker.position}
                    icon={createCustomIcon(getMarkerColor(marker.type))}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-semibold text-sm">{marker.address}</h3>
                        <p className="text-xs text-gray-600 mt-1">{marker.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Type: <span className="capitalize">{marker.type}</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          Added: {new Date(marker.date).toLocaleDateString()}
                        </p>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="mt-2 w-full"
                          onClick={() => removeMarker(marker.id)}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span>Lost Animals</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span>Found Animals</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span>Adoption Centers</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
              <span>Volunteer Locations</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
