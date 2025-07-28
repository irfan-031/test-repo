import React, { useState } from 'react';
import { X, User, Phone, Heart, Shield, Plus, Info } from 'lucide-react';

interface InformationPanelProps {
  onClose: () => void;
}

interface EmergencyContact {
  name: string;
  phone: string;
  type: 'personal' | 'medical' | 'police';
}

const InformationPanel: React.FC<InformationPanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'view' | 'add'>('view');
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    { name: 'John Doe', phone: '+1-555-0001', type: 'personal' },
    { name: 'Dr. Smith', phone: '+1-555-0002', type: 'medical' },
    { name: 'Emergency Services', phone: '911', type: 'police' },
  ]);

  const [newContact, setNewContact] = useState<EmergencyContact>({
    name: '',
    phone: '',
    type: 'personal',
  });

  const handleAddContact = () => {
    if (newContact.name && newContact.phone) {
      setContacts([...contacts, newContact]);
      setNewContact({ name: '', phone: '', type: 'personal' });
      setActiveTab('view');
    }
  };

  const getContactIcon = (type: string) => {
    switch (type) {
      case 'medical':
        return <Heart className="w-4 h-4 text-red-400" />;
      case 'police':
        return <Shield className="w-4 h-4 text-blue-400" />;
      default:
        return <User className="w-4 h-4 text-green-400" />;
    }
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl max-w-md w-full max-h-[80vh] overflow-hidden border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Emergency Information</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700">
          <button
            onClick={() => setActiveTab('view')}
            className={`flex-1 py-3 px-4 font-medium transition-colors ${
              activeTab === 'view'
                ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-700/50'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Info className="w-4 h-4 inline mr-2" />
            View Contacts
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`flex-1 py-3 px-4 font-medium transition-colors ${
              activeTab === 'add'
                ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-700/50'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Add Contact
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-96 overflow-y-auto">
          {activeTab === 'view' ? (
            <div className="space-y-3">
              {contacts.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No emergency contacts added yet</p>
              ) : (
                contacts.map((contact, index) => (
                  <div key={index} className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        {getContactIcon(contact.type)}
                        <span className="text-white ml-2 font-medium">{contact.name}</span>
                      </div>
                      <span className="text-xs text-gray-400 capitalize">{contact.type}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm">{contact.phone}</span>
                      <button
                        onClick={() => handleCall(contact.phone)}
                        className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded text-xs font-medium transition-colors flex items-center"
                      >
                        <Phone className="w-3 h-3 mr-1" />
                        Call
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                  placeholder="Enter contact name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contact Type
                </label>
                <select
                  value={newContact.type}
                  onChange={(e) => setNewContact({ ...newContact, type: e.target.value as any })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400"
                >
                  <option value="personal">Personal Contact</option>
                  <option value="medical">Medical Professional</option>
                  <option value="police">Police/Emergency</option>
                </select>
              </div>

              <button
                onClick={handleAddContact}
                disabled={!newContact.name || !newContact.phone}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors"
              >
                Add Emergency Contact
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InformationPanel;