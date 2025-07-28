import React, { useState, useEffect } from 'react';
import LocationTracker from './components/LocationTracker';
import EmergencyAlert from './components/EmergencyAlert';
import NearbyServices from './components/NearbyServices';
import StatusButtons from './components/StatusButtons';
import InformationPanel from './components/InformationPanel';
import EmergencySettings from './components/EmergencySettings';
import KNNDemo from './components/KNNDemo';
import { findNearestServices } from './utils/knnAlgorithm';
import smsDetectionService from './services/SMSDetectionService';

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

function App() {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [emergencyStatus, setEmergencyStatus] = useState<'safe' | 'help' | 'accident' | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isServiceWorkerRegistered, setIsServiceWorkerRegistered] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  // Initialize service worker and permissions
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Register service worker
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
        setIsServiceWorkerRegistered(true);
      }

      // Request notification permission
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
      }

      // Request location permission
      if ('geolocation' in navigator) {
        navigator.permissions.query({ name: 'geolocation' }).then((permission) => {
          console.log('Location permission:', permission.state);
        });
      }

      // Listen for emergency SMS events
      window.addEventListener('emergencySMSDetected', handleEmergencySMS as EventListener);
      window.addEventListener('showEmergencyAlert', handleShowEmergencyAlert as EventListener);

      // Listen for service worker messages
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
      }

    } catch (error) {
      console.error('Failed to initialize app:', error);
    }
  };

  const handleEmergencySMS = (event: CustomEvent) => {
    console.log('Emergency SMS detected in main app:', event.detail);
    
    // Automatically start location tracking
    setIsTracking(true);
    
    // Get current location
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          setCurrentLocation(location);
          
          // Trigger emergency alert
          setEmergencyStatus('accident');
          setShowAlert(true);
        },
        (error) => {
          console.error('Failed to get location:', error);
          // Still show emergency alert without location
          setEmergencyStatus('accident');
          setShowAlert(true);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    }
  };

  const handleShowEmergencyAlert = (event: CustomEvent) => {
    console.log('Showing emergency alert:', event.detail);
    setEmergencyStatus(event.detail.status);
    setShowAlert(true);
  };

  const handleServiceWorkerMessage = (event: MessageEvent) => {
    if (event.data && event.data.type === 'EMERGENCY_SMS_DETECTED') {
      console.log('Service worker message received:', event.data);
      handleEmergencySMS(new CustomEvent('emergencySMSDetected', { detail: event.data.data }));
    }
  };

  const handleLocationUpdate = (location: Location) => {
    setCurrentLocation(location);
  };

  const handleEmergencyHelp = () => {
    setEmergencyStatus('help');
    setShowAlert(true);
  };

  const handleEmergencySafe = () => {
    setEmergencyStatus('safe');
    setShowAlert(true);
  };

  const handleAccidentAlert = () => {
    setEmergencyStatus('accident');
    setShowAlert(true);
  };

  // Compute nearby hospitals and police stations for EmergencyAlert
  const nearest = currentLocation
    ? findNearestServices(currentLocation.latitude, currentLocation.longitude, 3)
    : { hospitals: [], policeStations: [] };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-6 max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Smart Emergency Response</h1>
          <div className="flex justify-center space-x-2">
            <button 
              onClick={() => setShowInfo(true)} 
              className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full transition-colors"
            >
              Get Information
            </button>
            <button 
              onClick={() => setShowSettings(true)} 
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
            >
              Settings
            </button>
          </div>
          
          {/* Service Status Indicators */}
          <div className="mt-4 flex justify-center space-x-4 text-xs">
            <div className={`flex items-center ${isServiceWorkerRegistered ? 'text-green-400' : 'text-red-400'}`}>
              <div className={`w-2 h-2 rounded-full mr-1 ${isServiceWorkerRegistered ? 'bg-green-400' : 'bg-red-400'}`}></div>
              Service Worker
            </div>
            <div className={`flex items-center ${notificationPermission === 'granted' ? 'text-green-400' : 'text-yellow-400'}`}>
              <div className={`w-2 h-2 rounded-full mr-1 ${notificationPermission === 'granted' ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
              Notifications
            </div>
            <div className={`flex items-center ${isTracking ? 'text-green-400' : 'text-blue-400'}`}>
              <div className={`w-2 h-2 rounded-full mr-1 ${isTracking ? 'bg-green-400' : 'bg-blue-400'}`}></div>
              Location
            </div>
          </div>
        </div>

        {showAlert && emergencyStatus && (
          <EmergencyAlert
            status={emergencyStatus}
            location={currentLocation}
            onClose={() => setShowAlert(false)}
            nearbyHospitals={nearest.hospitals}
            nearbyPoliceStations={nearest.policeStations}
            onSafe={handleEmergencySafe}
          />
        )}

        <LocationTracker
          onLocationUpdate={handleLocationUpdate}
          isTracking={isTracking}
          onTrackingChange={setIsTracking}
        />

        <KNNDemo userLocation={currentLocation} />
        <NearbyServices location={currentLocation} />
        <StatusButtons
          onNeedHelp={handleEmergencyHelp}
          onSafe={handleEmergencySafe}
          onAccident={handleAccidentAlert}
          currentStatus={emergencyStatus}
        />

        {showInfo && (
          <InformationPanel onClose={() => setShowInfo(false)} />
        )}

        {showSettings && (
          <EmergencySettings onClose={() => setShowSettings(false)} />
        )}
      </div>
    </div>
  );
}

export default App;