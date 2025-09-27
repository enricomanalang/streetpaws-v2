'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Search, Navigation, X } from 'lucide-react';

// Dynamically import MapContainer to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

interface LocationPickerProps {
  onLocationSelect: (location: {
    address: string;
    latitude: number;
    longitude: number;
  }) => void;
  initialLocation?: {
    address: string;
    latitude: number;
    longitude: number;
  };
  placeholder?: string;
  label?: string;
  required?: boolean;
}

export default function LocationPicker({
  onLocationSelect,
  initialLocation,
  placeholder = "e.g., Barangay 1, Lipa City, Batangas",
  label = "Location",
  required = false
}: LocationPickerProps) {
  const [addressInput, setAddressInput] = useState(initialLocation?.address || '');
  const [coordinates, setCoordinates] = useState<[number, number] | null>(
    initialLocation ? [initialLocation.latitude, initialLocation.longitude] : null
  );
  const [isSearching, setIsSearching] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([14.5995, 120.9842]); // Manila coordinates
  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  // Load Leaflet CSS and JS
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      setIsLeafletLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
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

  // Handle address search
  const handleSearch = async () => {
    if (!addressInput.trim()) return;

    setIsSearching(true);
    const coords = await geocodeAddress(addressInput);
    
    if (coords) {
      setCoordinates(coords);
      setMapCenter(coords);
      onLocationSelect({
        address: addressInput,
        latitude: coords[0],
        longitude: coords[1]
      });
    } else {
      alert('Address not found. Please try a different address.');
    }
    
    setIsSearching(false);
  };

  // Handle map click
  const handleMapClick = (e: L.LeafletMouseEvent) => {
    console.log('Map clicked:', e);
    const { lat, lng } = e.latlng;
    const newCoords: [number, number] = [lat, lng];
    
    console.log('Setting coordinates:', newCoords);
    setCoordinates(newCoords);
    setMapCenter(newCoords);
    
    // Reverse geocode to get address and notify parent
    reverseGeocode(lat, lng).then((address) => {
      console.log('Reverse geocoded address:', address);
      if (address) {
        setAddressInput(address);
        onLocationSelect({
          address: address,
          latitude: lat,
          longitude: lng
        });
        console.log('Location selected:', { address, lat, lng });
      }
    });
  };

  // Reverse geocode coordinates to address
  const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        return data.display_name;
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
    
    return null;
  };

  // Get current location
  const getCurrentLocation = () => {
    console.log('Attempting to get current location...');
    
    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      alert('Geolocation is not supported by this browser. Please enter an address manually.');
      return;
    }

    // Check if we're on localhost and provide helpful guidance
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isHttps = window.location.protocol === 'https:';
    
    console.log('Environment check:', { isLocalhost, isHttps, protocol: window.location.protocol });
    
    if (isLocalhost && !isHttps) {
      const useHttps = confirm(
        'Geolocation requires HTTPS to work properly. ' +
        'Would you like to:\n\n' +
        '• Click OK to try anyway (may not work)\n' +
        '• Click Cancel to use address search or map clicking instead\n\n' +
        'For best results, run: npm run setup:https && npm run dev:https'
      );
      if (!useHttps) return;
    }

    // Show loading state
    setIsSearching(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Geolocation success:', position);
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const coords: [number, number] = [lat, lng];
        
        console.log('Setting coordinates from geolocation:', coords);
        setCoordinates(coords);
        setMapCenter(coords);
        
        // Reverse geocode and notify parent
        reverseGeocode(lat, lng).then((address) => {
          console.log('Reverse geocoded address from geolocation:', address);
          if (address) {
            setAddressInput(address);
            onLocationSelect({
              address: address,
              latitude: lat,
              longitude: lng
            });
            console.log('Location selected from geolocation:', { address, lat, lng });
          }
        });
        setIsSearching(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setIsSearching(false);
        let errorMessage = 'Unable to get your current location. ';
        
        // Check if error is caused by browser extension
        const isExtensionError = error.message && error.message.includes('chrome-extension://');
        
        if (isExtensionError) {
          errorMessage += 'A browser extension is interfering with location access. ';
          errorMessage += 'Please try:\n\n';
          errorMessage += '• Disable location-related extensions temporarily\n';
          errorMessage += '• Use an incognito window\n';
          errorMessage += '• Use address search or map clicking instead';
        } else {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Location access was denied. Please allow location access in your browser settings or enter an address manually.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Location information is unavailable. Please enter an address manually.';
              break;
            case error.TIMEOUT:
              errorMessage += 'Location request timed out. Please try again or enter an address manually.';
              break;
            default:
              errorMessage += `An unknown error occurred (Code: ${error.code}). Please enter an address manually.`;
              break;
          }
        }
        
        // Add helpful guidance based on environment
        if (isLocalhost && !isHttps) {
          errorMessage += '\n\n💡 Tip: Run "npm run setup:https && npm run dev:https" for HTTPS support.';
          errorMessage += '\n\nAlternatively, you can:';
          errorMessage += '\n• Search for an address above';
          errorMessage += '\n• Click on the map to select a location';
        } else if (isLocalhost) {
          errorMessage += '\n\n💡 Try using address search or map clicking instead.';
        } else {
          errorMessage += '\n\n💡 You can still:';
          errorMessage += '\n• Search for an address above';
          errorMessage += '\n• Click on the map to select a location';
        }
        
        console.warn('Geolocation error:', error);
        alert(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  // Create custom marker icon
  const createCustomIcon = () => {
    if (typeof window !== 'undefined' && window.L && window.L.divIcon) {
      return window.L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          width: 30px;
          height: 30px;
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
            width: 10px;
            height: 10px;
            background: white;
            border-radius: 50%;
          "></div>
        </div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30]
      });
    }
    // Return undefined if Leaflet is not available - this will use default marker
    return undefined;
  };

  return (
    <div className="space-y-4">
      {/* Address Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && '*'}
        </label>
        <div className="flex gap-2">
          <Input
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={placeholder}
            required={required}
            className="flex-1"
          />
          <Button 
            onClick={handleSearch} 
            disabled={isSearching || !addressInput.trim()}
            type="button"
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSearching ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Location Controls */}
      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={() => setShowMap(!showMap)}
          variant={showMap ? "default" : "outline"}
          type="button"
          className="bg-green-600 hover:bg-green-700"
        >
          <MapPin className="w-4 h-4 mr-2" />
          {showMap ? 'Hide' : 'Show'} Map
        </Button>
        
        <Button
          onClick={getCurrentLocation}
          variant="outline"
          type="button"
          disabled={isSearching}
          className="bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
        >
          {isSearching ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          ) : (
            <Navigation className="w-4 h-4 mr-2" />
          )}
          {isSearching ? 'Getting Location...' : 'Use My Location'}
        </Button>
      </div>

      {/* Map */}
      {showMap && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm">Select Location on Map</CardTitle>
              <Button
                onClick={() => setShowMap(false)}
                variant="ghost"
                size="sm"
                type="button"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full rounded-lg overflow-hidden border">
              {!isLeafletLoaded ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading map...</p>
                  </div>
                </div>
              ) : (
                <MapContainer
                  center={mapCenter}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                  ref={mapRef}
                  eventHandlers={{
                    click: handleMapClick
                  }}
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  />
                  {coordinates && isLeafletLoaded && (
                    <Marker
                      position={coordinates}
                      icon={createCustomIcon() || undefined}
                    >
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-semibold text-sm">Selected Location</h3>
                          <p className="text-xs text-gray-600 mt-1">{addressInput}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Coordinates: {coordinates[0].toFixed(6)}, {coordinates[1].toFixed(6)}
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  )}
                </MapContainer>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Click on the map to select a location, or search for an address above.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Selected Location Display */}
      {coordinates && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Location Selected</span>
          </div>
          <p className="text-sm text-green-700 mt-1">{addressInput}</p>
          <p className="text-xs text-green-600 mt-1">
            Coordinates: {coordinates[0].toFixed(6)}, {coordinates[1].toFixed(6)}
          </p>
        </div>
      )}

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="text-xs text-blue-700">
          <p className="mb-2">
            <strong>Tips:</strong> You can search for an address, click on the map, or use your current location.
          </p>
          {typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? (
            window.location.protocol !== 'https:' ? (
              <div className="mt-2 bg-amber-50 border border-amber-200 rounded-md p-2">
                <div className="text-amber-800 font-medium text-xs mb-1">🚀 Enable Geolocation on Localhost:</div>
                <div className="text-amber-700 text-xs">
                  Run: <code className="bg-amber-100 px-1 rounded">npm run setup:https && npm run dev:https</code>
                </div>
                <div className="text-amber-600 text-xs mt-1">
                  This will enable HTTPS and allow "Use My Location" to work properly.
                </div>
              </div>
            ) : (
              <div className="mt-2 bg-green-50 border border-green-200 rounded-md p-2">
                <div className="text-green-800 font-medium text-xs">✅ HTTPS enabled! Geolocation should work properly.</div>
                <div className="text-green-700 text-xs mt-1">
                  💡 If geolocation fails, try disabling browser extensions or use an incognito window.
                </div>
              </div>
            )
          ) : (
            <p className="mt-2">
              If location access is denied, try refreshing the page and allowing location permissions.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

