import React, { useState, useEffect } from 'react';
import { Heart, Shield, MapPin, Phone, Navigation, Settings, Search } from 'lucide-react';
import { Location } from '../App';
import { findNearestServices, findServicesInRadius, ServiceWithDistance } from '../utils/knnAlgorithm';

interface NearbyServicesProps {
  location: Location | null;
}



const NearbyServices: React.FC<NearbyServicesProps> = ({ location }) => {
  const [nearestHospitals, setNearestHospitals] = useState<ServiceWithDistance[]>([]);
  const [nearestPoliceStations, setNearestPoliceStations] = useState<ServiceWithDistance[]>([]);
  const [searchRadius, setSearchRadius] = useState<number>(5); // Default 5km radius
  const [kValue, setKValue] = useState<number>(3); // Default k=3 for KNN
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [useRadiusSearch, setUseRadiusSearch] = useState<boolean>(false);

  // Update nearby services when location changes
  useEffect(() => {
    if (location) {
      if (useRadiusSearch) {
        const servicesInRadius = findServicesInRadius(location.latitude, location.longitude, searchRadius);
        setNearestHospitals(servicesInRadius.hospitals);
        setNearestPoliceStations(servicesInRadius.policeStations);
      } else {
        const nearestServices = findNearestServices(location.latitude, location.longitude, kValue);
        setNearestHospitals(nearestServices.hospitals);
        setNearestPoliceStations(nearestServices.policeStations);
      }
    }
  }, [location, kValue, searchRadius, useRadiusSearch]);

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleNavigate = (service: ServiceWithDistance) => {
    if (location) {
      const url = `https://www.google.com/maps/dir/${location.latitude},${location.longitude}/${service.latitude},${service.longitude}`;
      window.open(url, '_blank');
    }
  };

  const ServiceCard: React.FC<{ service: ServiceWithDistance }> = ({ service }) => (
    <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          {service.type === 'hospital' ? (
            <Heart className="w-4 h-4 text-red-400 mr-2" />
          ) : (
            <Shield className="w-4 h-4 text-blue-400 mr-2" />
          )}
          <span className="text-white text-sm font-medium">{service.name}</span>
        </div>
        <span className="text-gray-300 text-xs">{service.distanceText}</span>
      </div>
      {service.address && (
        <p className="text-gray-400 text-xs mb-2">{service.address}</p>
      )}
      <div className="flex space-x-2">
        <button
          onClick={() => handleCall(service.phone)}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1.5 px-2 rounded text-xs font-medium transition-colors flex items-center justify-center"
        >
          <Phone className="w-3 h-3 mr-1" />
          Call
        </button>
        <button
          onClick={() => handleNavigate(service)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-2 rounded text-xs font-medium transition-colors flex items-center justify-center"
        >
          <Navigation className="w-3 h-3 mr-1" />
          Navigate
        </button>
      </div>
    </div>
  );

  if (!location) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 mb-6 border border-slate-700">
        <p className="text-gray-400 text-center">Enable location to find nearby services</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-6">
      {/* Settings Panel */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Search className="w-5 h-5 text-purple-400 mr-2" />
            <span className="text-white font-medium">KNN Search Settings</span>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4 mr-1" />
            {showSettings ? 'Hide' : 'Settings'}
          </button>
        </div>
        
        {showSettings && (
          <div className="space-y-3 p-3 bg-slate-700/50 rounded-lg">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="useRadiusSearch"
                checked={useRadiusSearch}
                onChange={(e) => setUseRadiusSearch(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="useRadiusSearch" className="text-white text-sm">
                Use radius search instead of KNN
              </label>
            </div>
            
            {useRadiusSearch ? (
              <div>
                <label className="text-white text-sm block mb-1">Search Radius (km):</label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={searchRadius}
                  onChange={(e) => setSearchRadius(Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-gray-300 text-xs">{searchRadius} km</span>
              </div>
            ) : (
              <div>
                <label className="text-white text-sm block mb-1">K Value (number of nearest services):</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={kValue}
                  onChange={(e) => setKValue(Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-gray-300 text-xs">{kValue} nearest services</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Nearby Hospitals */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
        <div className="flex items-center justify-center mb-3">
          <Heart className="w-5 h-5 text-red-400 mr-2" />
          <span className="text-white font-medium">
            {useRadiusSearch ? `Hospitals within ${searchRadius}km` : `${kValue} Nearest Hospitals`}
          </span>
        </div>
        <div className="space-y-2">
          {nearestHospitals.length > 0 ? (
            nearestHospitals.map((hospital) => (
              <ServiceCard key={hospital.id} service={hospital} />
            ))
          ) : (
            <p className="text-gray-400 text-center text-sm">No hospitals found in the specified range</p>
          )}
        </div>
      </div>

      {/* Nearby Police Stations */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
        <div className="flex items-center justify-center mb-3">
          <Shield className="w-5 h-5 text-blue-400 mr-2" />
          <span className="text-white font-medium">
            {useRadiusSearch ? `Police Stations within ${searchRadius}km` : `${kValue} Nearest Police Stations`}
          </span>
        </div>
        <div className="space-y-2">
          {nearestPoliceStations.length > 0 ? (
            nearestPoliceStations.map((station) => (
              <ServiceCard key={station.id} service={station} />
            ))
          ) : (
            <p className="text-gray-400 text-center text-sm">No police stations found in the specified range</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NearbyServices;