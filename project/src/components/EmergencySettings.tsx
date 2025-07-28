import React, { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, Save, AlertTriangle, Phone, User, X } from 'lucide-react';
import { EmergencyContact, EmergencyTrigger } from '../services/EmergencyNotificationService';
import smsDetectionService from '../services/SMSDetectionService';
import emergencyNotificationService from '../services/EmergencyNotificationService';

interface EmergencySettingsProps {
  onClose: () => void;
}

const EmergencySettings: React.FC<EmergencySettingsProps> = ({ onClose }) => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [triggers, setTriggers] = useState<EmergencyTrigger[]>([]);
  const [newContact, setNewContact] = useState<Partial<EmergencyContact>>({});
  const [newTrigger, setNewTrigger] = useState<Partial<EmergencyTrigger>>({});
  const [showAddContact, setShowAddContact] = useState(false);
  const [showAddTrigger, setShowAddTrigger] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    loadSettings();
    checkNotificationPermission();
  }, []);

  const loadSettings = () => {
    setContacts(emergencyNotificationService.getEmergencyContacts());
    setTriggers(smsDetectionService.getEmergencyTriggers());
  };

  const checkNotificationPermission = async () => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  const addContact = () => {
    if (newContact.name && newContact.phone) {
      const contact: EmergencyContact = {
        name: newContact.name,
        phone: newContact.phone,
        relationship: newContact.relationship || 'Emergency Contact',
        priority: newContact.priority || contacts.length + 1
      };
      
      emergencyNotificationService.addEmergencyContact(contact);
      setContacts(emergencyNotificationService.getEmergencyContacts());
      setNewContact({});
      setShowAddContact(false);
    }
  };

  const removeContact = (phone: string) => {
    emergencyNotificationService.removeEmergencyContact(phone);
    setContacts(emergencyNotificationService.getEmergencyContacts());
  };

  const addTrigger = () => {
    if (newTrigger.keywords && newTrigger.keywords.length > 0) {
      const trigger: EmergencyTrigger = {
        keywords: newTrigger.keywords,
        senderNumbers: newTrigger.senderNumbers || ['*'],
        autoResponse: newTrigger.autoResponse !== false
      };
      
      smsDetectionService.addEmergencyTrigger(trigger);
      setTriggers(smsDetectionService.getEmergencyTriggers());
      setNewTrigger({});
      setShowAddTrigger(false);
    }
  };

  const removeTrigger = (index: number) => {
    smsDetectionService.removeEmergencyTrigger(index);
    setTriggers(smsDetectionService.getEmergencyTriggers());
  };

  const testEmergencyAlert = async () => {
    try {
      const testData = {
        type: 'accident' as const,
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          accuracy: 10
        },
        message: 'Test emergency alert',
        timestamp: new Date().toISOString(),
        source: 'manual' as const,
        severity: 'medium' as const
      };
      
      await emergencyNotificationService.sendEmergencyAlert(testData);
      alert('Test emergency alert sent successfully!');
    } catch (error) {
      console.error('Test alert failed:', error);
      alert('Test alert failed. Check console for details.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Settings className="w-6 h-6 text-white mr-2" />
            <h2 className="text-xl font-bold text-white">Emergency Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notification Permission */}
        <div className="mb-6 p-4 bg-slate-700 rounded-lg">
          <h3 className="text-white font-semibold mb-2">Notifications</h3>
          <div className="flex items-center justify-between">
            <span className="text-gray-300 text-sm">Permission Status:</span>
            <span className={`text-sm ${notificationPermission === 'granted' ? 'text-green-400' : 'text-yellow-400'}`}>
              {notificationPermission}
            </span>
          </div>
          {notificationPermission !== 'granted' && (
            <button
              onClick={requestNotificationPermission}
              className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm"
            >
              Request Permission
            </button>
          )}
        </div>

        {/* Emergency Contacts */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold">Emergency Contacts</h3>
            <button
              onClick={() => setShowAddContact(true)}
              className="flex items-center text-blue-400 hover:text-blue-300 text-sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Contact
            </button>
          </div>

          <div className="space-y-2">
            {contacts.map((contact, index) => (
              <div key={contact.phone} className="bg-slate-700 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center">
                  <User className="w-4 h-4 text-blue-400 mr-2" />
                  <div>
                    <div className="text-white text-sm font-medium">{contact.name}</div>
                    <div className="text-gray-400 text-xs">{contact.phone}</div>
                    <div className="text-gray-500 text-xs">{contact.relationship}</div>
                  </div>
                </div>
                <button
                  onClick={() => removeContact(contact.phone)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {showAddContact && (
            <div className="mt-4 p-4 bg-slate-700 rounded-lg">
              <h4 className="text-white font-medium mb-3">Add New Contact</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Name"
                  value={newContact.name || ''}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  className="w-full bg-slate-600 text-white px-3 py-2 rounded-lg text-sm"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={newContact.phone || ''}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  className="w-full bg-slate-600 text-white px-3 py-2 rounded-lg text-sm"
                />
                <input
                  type="text"
                  placeholder="Relationship"
                  value={newContact.relationship || ''}
                  onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                  className="w-full bg-slate-600 text-white px-3 py-2 rounded-lg text-sm"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={addContact}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm"
                  >
                    <Save className="w-4 h-4 mr-1 inline" />
                    Save
                  </button>
                  <button
                    onClick={() => setShowAddContact(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SMS Triggers */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold">SMS Triggers</h3>
            <button
              onClick={() => setShowAddTrigger(true)}
              className="flex items-center text-blue-400 hover:text-blue-300 text-sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Trigger
            </button>
          </div>

          <div className="space-y-2">
            {triggers.map((trigger, index) => (
              <div key={index} className="bg-slate-700 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <AlertTriangle className="w-4 h-4 text-orange-400 mr-2" />
                    <span className="text-white text-sm font-medium">Trigger {index + 1}</span>
                  </div>
                  <button
                    onClick={() => removeTrigger(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-gray-300 text-xs">
                  <div>Keywords: {trigger.keywords.join(', ')}</div>
                  <div>Senders: {trigger.senderNumbers.join(', ')}</div>
                  <div>Auto Response: {trigger.autoResponse ? 'Yes' : 'No'}</div>
                </div>
              </div>
            ))}
          </div>

          {showAddTrigger && (
            <div className="mt-4 p-4 bg-slate-700 rounded-lg">
              <h4 className="text-white font-medium mb-3">Add New Trigger</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Keywords (comma separated)"
                  value={newTrigger.keywords?.join(', ') || ''}
                  onChange={(e) => setNewTrigger({ 
                    ...newTrigger, 
                    keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
                  })}
                  className="w-full bg-slate-600 text-white px-3 py-2 rounded-lg text-sm"
                />
                <input
                  type="text"
                  placeholder="Sender numbers (comma separated, * for any)"
                  value={newTrigger.senderNumbers?.join(', ') || ''}
                  onChange={(e) => setNewTrigger({ 
                    ...newTrigger, 
                    senderNumbers: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                  })}
                  className="w-full bg-slate-600 text-white px-3 py-2 rounded-lg text-sm"
                />
                <label className="flex items-center text-white text-sm">
                  <input
                    type="checkbox"
                    checked={newTrigger.autoResponse !== false}
                    onChange={(e) => setNewTrigger({ ...newTrigger, autoResponse: e.target.checked })}
                    className="mr-2"
                  />
                  Auto Response
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={addTrigger}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm"
                  >
                    <Save className="w-4 h-4 mr-1 inline" />
                    Save
                  </button>
                  <button
                    onClick={() => setShowAddTrigger(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Test Emergency Alert */}
        <div className="mb-6 p-4 bg-orange-600/20 border border-orange-400 rounded-lg">
          <h3 className="text-white font-semibold mb-2">Test Emergency Alert</h3>
          <p className="text-gray-300 text-sm mb-3">
            Test the emergency notification system to ensure it's working properly.
          </p>
          <button
            onClick={testEmergencyAlert}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-3 rounded-lg text-sm"
          >
            Send Test Alert
          </button>
        </div>

        {/* Emergency Events Log */}
        <div className="mb-6">
          <h3 className="text-white font-semibold mb-3">Recent Emergency Events</h3>
          <div className="max-h-32 overflow-y-auto space-y-2">
            {emergencyNotificationService.getEmergencyEvents().slice(-5).reverse().map((event, index) => (
              <div key={event.id} className="bg-slate-700 rounded-lg p-2 text-xs">
                <div className="text-white font-medium">{event.type}</div>
                <div className="text-gray-400">{new Date(event.timestamp).toLocaleString()}</div>
                <div className="text-gray-500">{event.message}</div>
              </div>
            ))}
            {emergencyNotificationService.getEmergencyEvents().length === 0 && (
              <div className="text-gray-500 text-sm text-center py-4">
                No emergency events recorded
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded-lg"
        >
          Close Settings
        </button>
      </div>
    </div>
  );
};

export default EmergencySettings; 