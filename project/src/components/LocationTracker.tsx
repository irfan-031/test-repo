import React, { useEffect, useState } from 'react';
import { MapPin, Play, Square } from 'lucide-react';
import { Location } from '../App';

interface LocationTrackerProps {
  onLocationUpdate: (location: Location) => void;
  isTracking: boolean;
  onTrackingChange: (tracking: boolean) => void;
}

interface LocationWithAccuracy extends Location {
  accuracy?: number;
  timestamp?: number;
}

const LocationTracker: React.FC<LocationTrackerProps> = ({
  onLocationUpdate,
  isTracking,
  onTrackingChange,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationWithAccuracy | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'getting' | 'tracking'>('idle');

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setLocationStatus('getting');
    setError(null);

    // First, get a single high-accuracy position
    const getCurrentPosition = () => {
    const options = {
      enableHighAccuracy: true,
        timeout: 15000,
      maximumAge: 0,
    };

    const success = (position: GeolocationPosition) => {
        const location: LocationWithAccuracy = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
      };
        
        setCurrentLocation(location);
      onLocationUpdate(location);
      setError(null);
        setLocationStatus('tracking');

        // Then start continuous tracking with lower accuracy for updates
        const watchOptions = {
          enableHighAccuracy: false, // Use lower accuracy for continuous updates
          timeout: 10000,
          maximumAge: 30000, // Accept cached positions up to 30 seconds old
        };

        const watchSuccess = (watchPosition: GeolocationPosition) => {
          const watchLocation: LocationWithAccuracy = {
            latitude: watchPosition.coords.latitude,
            longitude: watchPosition.coords.longitude,
            accuracy: watchPosition.coords.accuracy,
            timestamp: watchPosition.timestamp,
          };
          setCurrentLocation(watchLocation);
          onLocationUpdate(watchLocation);
        };

        const watchError = (err: GeolocationPositionError) => {
          console.warn('Watch position error:', err.message);
    };

        const id = navigator.geolocation.watchPosition(watchSuccess, watchError, watchOptions);
    setWatchId(id);
    onTrackingChange(true);
      };

      const error = (err: GeolocationPositionError) => {
        let errorMessage = 'Location error: ';
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage += 'Location permission denied. Please enable location access in your browser settings.';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage += 'Location information unavailable. Please check your GPS and try again.';
            break;
          case err.TIMEOUT:
            errorMessage += 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage += err.message;
        }
        setError(errorMessage);
        setLocationStatus('idle');
      };

      navigator.geolocation.getCurrentPosition(success, error, options);
    };

    getCurrentPosition();
  };

  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    onTrackingChange(false);
    setLocationStatus('idle');
  };

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 mb-6 border border-slate-700">
      <div className="flex items-center justify-center mb-4">
        <MapPin className="w-5 h-5 text-green-400 mr-2" />
        <span className="text-white font-medium">Location Services</span>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      <div className="flex space-x-3">
        <button
          onClick={startTracking}
          disabled={isTracking}
          className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${
            isTracking
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          <Play className="w-4 h-4 mr-2" />
          Start Location
        </button>
        <button
          onClick={stopTracking}
          disabled={!isTracking}
          className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${
            !isTracking
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          <Square className="w-4 h-4 mr-2" />
          Stop Location
        </button>
      </div>

      {locationStatus === 'getting' && (
        <div className="mt-3 flex items-center justify-center">
          <div className="flex items-center text-yellow-400 text-sm">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse mr-2"></div>
            Getting your location...
          </div>
        </div>
      )}

      {locationStatus === 'tracking' && currentLocation && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-center">
          <div className="flex items-center text-green-400 text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
            Location tracking active
            </div>
          </div>
          
          <div className="bg-slate-700/30 rounded-lg p-3">
            <div className="text-center space-y-1">
              <p className="text-white text-sm font-medium">Current Location</p>
              <p className="text-blue-300 text-xs">
                {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
              </p>
              {currentLocation.accuracy && (
                <p className="text-gray-400 text-xs">
                  Accuracy: ±{currentLocation.accuracy.toFixed(1)} meters
                </p>
              )}
              {currentLocation.timestamp && (
                <p className="text-gray-400 text-xs">
                  Updated: {new Date(currentLocation.timestamp).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationTracker;