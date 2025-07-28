import React, { useState } from 'react';
import { MapPin, Calculator, Target, Users, Info } from 'lucide-react';
import { findNearestServices, findServicesInRadius, findNearestServicesWeighted, ServiceWithDistance } from '../utils/knnAlgorithm';

interface KNNDemoProps {
  userLocation: { latitude: number; longitude: number } | null;
}

const KNNDemo: React.FC<KNNDemoProps> = ({ userLocation }) => {
  const [demoK, setDemoK] = useState<number>(3);
  const [demoRadius, setDemoRadius] = useState<number>(5);
  const [demoEmergencyType, setDemoEmergencyType] = useState<'medical' | 'police' | 'general'>('general');
  const [demoResults, setDemoResults] = useState<{
    hospitals: ServiceWithDistance[];
    policeStations: ServiceWithDistance[];
  } | null>(null);

  const runDemo = () => {
    if (!userLocation) return;

    const results = findNearestServices(userLocation.latitude, userLocation.longitude, demoK);
    setDemoResults(results);
  };

  const runRadiusDemo = () => {
    if (!userLocation) return;

    const results = findServicesInRadius(userLocation.latitude, userLocation.longitude, demoRadius);
    setDemoResults(results);
  };

  const runWeightedDemo = () => {
    if (!userLocation) return;

    const results = findNearestServicesWeighted(
      userLocation.latitude, 
      userLocation.longitude, 
      demoK, 
      demoEmergencyType
    );
    setDemoResults(results);
  };

  const ServiceCard: React.FC<{ service: ServiceWithDistance; type: 'hospital' | 'police' }> = ({ service, type }) => (
    <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600 mb-2">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center">
          <MapPin className="w-3 h-3 text-blue-400 mr-1" />
          <span className="text-white text-xs font-medium">{service.name}</span>
        </div>
        <span className="text-gray-300 text-xs">{service.distanceText}</span>
      </div>
      <p className="text-gray-400 text-xs">{service.address}</p>
    </div>
  );

  if (!userLocation) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 mb-6 border border-slate-700">
        <p className="text-gray-400 text-center">Enable location to see KNN demo</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 mb-6 border border-slate-700">
      <div className="flex items-center justify-center mb-4">
        <Calculator className="w-5 h-5 text-green-400 mr-2" />
        <span className="text-white font-medium">KNN Algorithm Demo</span>
      </div>

      {/* Demo Controls */}
      <div className="space-y-4 mb-4">
        {/* Standard KNN */}
        <div className="bg-slate-700/50 rounded-lg p-3">
          <div className="flex items-center mb-2">
            <Target className="w-4 h-4 text-blue-400 mr-2" />
            <span className="text-white text-sm font-medium">Standard KNN</span>
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <label className="text-white text-xs">K Value:</label>
            <input
              type="range"
              min="1"
              max="5"
              value={demoK}
              onChange={(e) => setDemoK(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-gray-300 text-xs">{demoK}</span>
          </div>
          <button
            onClick={runDemo}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-xs font-medium transition-colors"
          >
            Find {demoK} Nearest Services
          </button>
        </div>

        {/* Radius Search */}
        <div className="bg-slate-700/50 rounded-lg p-3">
          <div className="flex items-center mb-2">
            <Target className="w-4 h-4 text-green-400 mr-2" />
            <span className="text-white text-sm font-medium">Radius Search</span>
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <label className="text-white text-xs">Radius:</label>
            <input
              type="range"
              min="1"
              max="30"
              value={demoRadius}
              onChange={(e) => setDemoRadius(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-gray-300 text-xs">{demoRadius}km</span>
          </div>
          <button
            onClick={runRadiusDemo}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded text-xs font-medium transition-colors"
          >
            Find Services within {demoRadius}km
          </button>
        </div>

        {/* Weighted KNN */}
        <div className="bg-slate-700/50 rounded-lg p-3">
          <div className="flex items-center mb-2">
            <Users className="w-4 h-4 text-purple-400 mr-2" />
            <span className="text-white text-sm font-medium">Weighted KNN</span>
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <label className="text-white text-xs">Emergency Type:</label>
            <select
              value={demoEmergencyType}
              onChange={(e) => setDemoEmergencyType(e.target.value as any)}
              className="bg-slate-600 text-white text-xs rounded px-2 py-1"
            >
              <option value="general">General</option>
              <option value="medical">Medical</option>
              <option value="police">Police</option>
            </select>
          </div>
          <button
            onClick={runWeightedDemo}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded text-xs font-medium transition-colors"
          >
            Find Weighted Services ({demoEmergencyType})
          </button>
        </div>
      </div>

      {/* Results */}
      {demoResults && (
        <div className="space-y-3">
          <div className="flex items-center">
            <Info className="w-4 h-4 text-yellow-400 mr-2" />
            <span className="text-white text-sm font-medium">Results</span>
          </div>
          
          {/* Hospitals */}
          <div>
            <h4 className="text-white text-xs font-medium mb-2">Hospitals ({demoResults.hospitals.length})</h4>
            <div className="max-h-32 overflow-y-auto">
              {demoResults.hospitals.length > 0 ? (
                demoResults.hospitals.map((hospital) => (
                  <ServiceCard key={hospital.id} service={hospital} type="hospital" />
                ))
              ) : (
                <p className="text-gray-400 text-xs">No hospitals found</p>
              )}
            </div>
          </div>

          {/* Police Stations */}
          <div>
            <h4 className="text-white text-xs font-medium mb-2">Police Stations ({demoResults.policeStations.length})</h4>
            <div className="max-h-32 overflow-y-auto">
              {demoResults.policeStations.length > 0 ? (
                demoResults.policeStations.map((station) => (
                  <ServiceCard key={station.id} service={station} type="police" />
                ))
              ) : (
                <p className="text-gray-400 text-xs">No police stations found</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KNNDemo; 