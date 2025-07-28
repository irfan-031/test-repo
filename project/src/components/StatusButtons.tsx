import React from 'react';
import { AlertTriangle, CheckCircle, Car } from 'lucide-react';

interface StatusButtonsProps {
  onNeedHelp: () => void;
  onSafe: () => void;
  onAccident: () => void;
  currentStatus: 'safe' | 'help' | 'accident' | null;
}

const StatusButtons: React.FC<StatusButtonsProps> = ({
  onNeedHelp,
  onSafe,
  onAccident,
  currentStatus,
}) => {
  return (
    <div className="space-y-4">
      {/* Emergency Status Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={onNeedHelp}
          className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center ${
            currentStatus === 'help'
              ? 'bg-red-600 text-white scale-105 shadow-lg shadow-red-500/25'
              : 'bg-red-500 hover:bg-red-600 text-white hover:scale-105 hover:shadow-lg hover:shadow-red-500/25'
          }`}
        >
          <AlertTriangle className="w-6 h-6 mr-2" />
          I NEED HELP
        </button>
        <button
          onClick={onSafe}
          className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center ${
            currentStatus === 'safe'
              ? 'bg-green-600 text-white scale-105 shadow-lg shadow-green-500/25'
              : 'bg-green-500 hover:bg-green-600 text-white hover:scale-105 hover:shadow-lg hover:shadow-green-500/25'
          }`}
        >
          <CheckCircle className="w-6 h-6 mr-2" />
          I AM SAFE
        </button>
      </div>

      {/* Accident Alert Button */}
      <button
        onClick={onAccident}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center ${
          currentStatus === 'accident'
            ? 'bg-orange-600 text-white scale-105 shadow-lg shadow-orange-500/25'
            : 'bg-orange-500 hover:bg-orange-600 text-white hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25'
        }`}
      >
        <Car className="w-6 h-6 mr-2" />
        ACCIDENT ALERT
      </button>

      {/* Status Indicator */}
      {currentStatus && (
        <div className="text-center">
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
            currentStatus === 'safe' ? 'bg-green-500/20 text-green-300' :
            currentStatus === 'help' ? 'bg-red-500/20 text-red-300' :
            'bg-orange-500/20 text-orange-300'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 animate-pulse ${
              currentStatus === 'safe' ? 'bg-green-400' :
              currentStatus === 'help' ? 'bg-red-400' :
              'bg-orange-400'
            }`}></div>
            Status: {currentStatus === 'safe' ? 'Safe' : currentStatus === 'help' ? 'Need Help' : 'Accident Reported'}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusButtons;