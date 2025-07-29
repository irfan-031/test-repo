import React, { useEffect } from 'react';
import { AlertTriangle, X, MapPin, Navigation, Phone } from 'lucide-react';
import { Location } from '../App';
import { ServiceWithDistance } from '../utils/knnAlgorithm';
import emergencyNotificationService, { EmergencyData } from '../services/EmergencyNotificationService';

interface EmergencyAlertProps {
  status: 'help' | 'accident' | 'safe';
  location: Location | null;
  onClose: () => void;
  nearbyHospitals: ServiceWithDistance[];
  nearbyPoliceStations: ServiceWithDistance[];
  onSafe: () => void;
}

const EmergencyAlert: React.FC<EmergencyAlertProps> = ({
  status,
  location,
  onClose,
  nearbyHospitals,
  nearbyPoliceStations,
  onSafe,
}) => {
  const getAlertConfig = () => {
    switch (status) {
      case 'accident':
        return {
          title: 'ACCIDENT ALERT',
          message: 'Driver met with an Accident!!!',
          statusText: 'Driver met with an Accident',
          bgColor: 'bg-red-500/90',
          borderColor: 'border-red-400',
        };
      case 'help':
        return {
          title: 'EMERGENCY HELP',
          message: 'Emergency assistance required!',
          statusText: 'Help Required',
          bgColor: 'bg-orange-500/90',
          borderColor: 'border-orange-400',
        };
      case 'safe':
        return {
          title: 'SAFETY CONFIRMED',
          message: 'User is safe and secure',
          statusText: 'User is Safe',
          bgColor: 'bg-green-500/90',
          borderColor: 'border-green-400',
        };
    }
  };

  const config = getAlertConfig();

  // Auto-send alerts to nearby services
  useEffect(() => {
    if (status !== 'safe' && location) {
      sendEmergencyAlerts();
    }
  }, [status, location]);

  const sendEmergencyAlerts = async () => {
    if (!location) return;

    const emergencyData: EmergencyData = {
      type: status === 'accident' ? 'accident' : 'medical',
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy
      },
      message: config.message,
      timestamp: new Date().toISOString(),
      source: 'manual',
      severity: status === 'accident' ? 'critical' : 'high'
    };

    try {
      // Send emergency alert through notification service
      const success = await emergencyNotificationService.sendEmergencyAlert(emergencyData);
      
      if (success) {
        console.log('Emergency alert sent successfully');
    
    // Show notification that alerts were sent
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Emergency Alert Sent', {
            body: 'Nearby hospitals and police stations have been notified.',
            icon: '/icons/icon-192.png',
          });
        }
      } else {
        console.error('Failed to send emergency alert');
      }
    } catch (error) {
      console.error('Error sending emergency alert:', error);
    }
  };



  const handleNavigation = () => {
    if (location) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;
      window.open(url, '_blank');
    }
  };

  const handleLocateOnMap = () => {
    if (location) {
      const url = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`${config.bgColor} backdrop-blur-sm rounded-xl p-6 max-w-sm w-full border-2 ${config.borderColor} animate-pulse`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 text-white mr-2" />
            <h2 className="text-xl font-bold text-white">{config.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-white/10 rounded-lg p-4 mb-4">
          <p className="text-white text-center font-medium">{config.message}</p>
        </div>

        <div className="bg-blue-500/20 border border-blue-400 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-center mb-2">
            <span className="text-red-300 font-medium">STATUS</span>
          </div>
          <p className="text-white text-center">{config.statusText}</p>
        </div>

        {status !== 'safe' && (
          <div className="bg-yellow-500/20 border border-yellow-400 rounded-lg p-3 mb-4 text-center">
            <span className="text-yellow-300 font-semibold">
              Emergency system was alerted and a message was sent to your nearby police station and hospital.
            </span>
          </div>
        )}

        {/* Safe button and confirmation */}
        {status !== 'safe' && (
          <button
            onClick={onSafe}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg font-bold mt-4 mb-2"
          >
            I'm Safe Now
          </button>
        )}
        {status === 'safe' && (
          <div className="bg-green-500/20 border border-green-400 rounded-lg p-3 mt-4 text-center">
            <span className="text-green-300 font-semibold">
              You have notified the system and your contacts that you are safe.
            </span>
          </div>
        )}

        {location && (
          <div className="bg-blue-500/20 border border-blue-400 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-center mb-2">
              <MapPin className="w-4 h-4 text-blue-300 mr-1" />
              <span className="text-blue-300 font-medium">Coordinates</span>
            </div>
            <p className="text-white text-center text-sm">
              {location.latitude.toFixed(6)} {location.longitude.toFixed(6)}
            </p>
          </div>
        )}

        <div className="flex space-x-2 mb-4">
          <button
            onClick={handleLocateOnMap}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center text-sm"
          >
            <MapPin className="w-4 h-4 mr-1" />
            Locate On Map
          </button>
          <button
            onClick={handleNavigation}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center text-sm"
          >
            <Navigation className="w-4 h-4 mr-1" />
            Navigation
          </button>
        </div>

        <div className="flex space-x-2">
          <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg font-medium transition-colors text-sm">
            Nearby Hospitals
          </button>
          <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg font-medium transition-colors text-sm">
            Nearby Police Station
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-white/80 text-xs">
            Emergency services have been automatically notified
          </p>
        </div>

        <div className="mt-4">
          {status !== 'safe' && (
            <>
              <div className="mb-3">
                <h3 className="text-white text-sm font-bold mb-1">Nearby Hospitals Notified:</h3>
                {nearbyHospitals.length > 0 ? (
                  <ul className="space-y-1">
                    {nearbyHospitals.map(hospital => (
                      <li key={hospital.id} className="bg-slate-700/60 rounded p-2 flex flex-col">
                        <span className="text-white text-xs font-semibold">{hospital.name}</span>
                        <span className="text-gray-300 text-xs">{hospital.address}</span>
                        <span className="text-gray-400 text-xs">{hospital.phone}</span>
                        <span className="text-blue-300 text-xs">{hospital.distanceText} away</span>
                        <button
                          onClick={() => window.open(`tel:${hospital.phone}`)}
                          className="mt-1 inline-flex items-center text-xs text-green-400 hover:underline"
                        >
                          <Phone className="w-3 h-3 mr-1" />Call
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-gray-400 text-xs">No hospitals found nearby.</span>
                )}
              </div>
              <div>
                <h3 className="text-white text-sm font-bold mb-1">Nearby Police Stations Notified:</h3>
                {nearbyPoliceStations.length > 0 ? (
                  <ul className="space-y-1">
                    {nearbyPoliceStations.map(station => (
                      <li key={station.id} className="bg-slate-700/60 rounded p-2 flex flex-col">
                        <span className="text-white text-xs font-semibold">{station.name}</span>
                        <span className="text-gray-300 text-xs">{station.address}</span>
                        <span className="text-gray-400 text-xs">{station.phone}</span>
                        <span className="text-blue-300 text-xs">{station.distanceText} away</span>
                        <button
                          onClick={() => window.open(`tel:${station.phone}`)}
                          className="mt-1 inline-flex items-center text-xs text-green-400 hover:underline"
                        >
                          <Phone className="w-3 h-3 mr-1" />Call
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-gray-400 text-xs">No police stations found nearby.</span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmergencyAlert;