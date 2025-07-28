export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
  priority: number;
}

export interface EmergencyService {
  id: string;
  name: string;
  type: 'hospital' | 'police' | 'fire' | 'ambulance';
  phone: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  distance?: number;
}

export interface EmergencyData {
  type: 'accident' | 'medical' | 'fire' | 'crime' | 'other';
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  message: string;
  timestamp: string;
  source: 'sms' | 'manual' | 'automatic';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class EmergencyNotificationService {
  private emergencyContacts: EmergencyContact[] = [];
  private emergencyServices: EmergencyService[] = [];
  private isInitialized = false;

  constructor() {
    this.loadEmergencyContacts();
    this.loadEmergencyServices();
  }

  private loadEmergencyContacts() {
    const saved = localStorage.getItem('emergencyContacts');
    if (saved) {
      this.emergencyContacts = JSON.parse(saved);
    } else {
      // Default emergency contacts
      this.emergencyContacts = [
        { name: 'Emergency Services', phone: '911', relationship: 'Emergency', priority: 1 },
        { name: 'Local Police', phone: '112', relationship: 'Law Enforcement', priority: 2 }
      ];
      this.saveEmergencyContacts();
    }
  }

  private saveEmergencyContacts() {
    localStorage.setItem('emergencyContacts', JSON.stringify(this.emergencyContacts));
  }

  private loadEmergencyServices() {
    const saved = localStorage.getItem('emergencyServices');
    if (saved) {
      this.emergencyServices = JSON.parse(saved);
    } else {
      // Default emergency services (will be populated by location-based search)
      this.emergencyServices = [];
    }
  }

  public async sendEmergencyAlert(emergencyData: EmergencyData): Promise<boolean> {
    try {
      console.log('Sending emergency alert:', emergencyData);

      // 1. Send to emergency services API
      await this.sendToEmergencyAPI(emergencyData);

      // 2. Send SMS to emergency contacts
      await this.sendSMSToContacts(emergencyData);

      // 3. Send push notifications
      await this.sendPushNotifications(emergencyData);

      // 4. Show browser notification
      this.showBrowserNotification(emergencyData);

      // 5. Log emergency event
      this.logEmergencyEvent(emergencyData);

      return true;
    } catch (error) {
      console.error('Failed to send emergency alert:', error);
      return false;
    }
  }

  private async sendToEmergencyAPI(emergencyData: EmergencyData): Promise<void> {
    const apiUrl = 'https://your-emergency-api.com/alert';
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer your-api-key'
        },
        body: JSON.stringify({
          ...emergencyData,
          deviceInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      console.log('Emergency alert sent to API successfully');
    } catch (error) {
      console.error('Failed to send to emergency API:', error);
      // Fallback: try alternative emergency services
      await this.sendToAlternativeServices(emergencyData);
    }
  }

  private async sendToAlternativeServices(emergencyData: EmergencyData): Promise<void> {
    // Send to multiple emergency service providers
    const providers = [
      'https://emergency-service-1.com/api/alert',
      'https://emergency-service-2.com/api/alert',
      'https://local-emergency.com/api/alert'
    ];

    for (const provider of providers) {
      try {
        const response = await fetch(provider, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(emergencyData)
        });

        if (response.ok) {
          console.log(`Emergency alert sent to ${provider}`);
          break;
        }
      } catch (error) {
        console.error(`Failed to send to ${provider}:`, error);
      }
    }
  }

  private async sendSMSToContacts(emergencyData: EmergencyData): Promise<void> {
    // In a real app, you would use an SMS service like Twilio
    // For now, we'll simulate SMS sending
    
    for (const contact of this.emergencyContacts) {
      try {
        const message = this.formatEmergencyMessage(emergencyData, contact);
        
        // Simulate SMS sending
        console.log(`Sending SMS to ${contact.name} (${contact.phone}): ${message}`);
        
        // In a real implementation:
        // await twilioClient.messages.create({
        //   body: message,
        //   to: contact.phone,
        //   from: 'your-twilio-number'
        // });
        
      } catch (error) {
        console.error(`Failed to send SMS to ${contact.name}:`, error);
      }
    }
  }

  private formatEmergencyMessage(emergencyData: EmergencyData, contact: EmergencyContact): string {
    const location = emergencyData.location;
    const mapUrl = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
    
    return `🚨 EMERGENCY ALERT 🚨
Type: ${emergencyData.type.toUpperCase()}
Location: ${location.latitude}, ${location.longitude}
Map: ${mapUrl}
Time: ${new Date(emergencyData.timestamp).toLocaleString()}
Message: ${emergencyData.message}
Please respond immediately!`;
  }

  private async sendPushNotifications(emergencyData: EmergencyData): Promise<void> {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        
        // Send push notification to service worker
        registration.active?.postMessage({
          type: 'EMERGENCY_PUSH',
          data: emergencyData
        });
        
      } catch (error) {
        console.error('Failed to send push notification:', error);
      }
    }
  }

  private showBrowserNotification(emergencyData: EmergencyData): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('🚨 EMERGENCY ALERT', {
        body: `${emergencyData.type.toUpperCase()}: ${emergencyData.message}`,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: 'emergency-alert',
        requireInteraction: true,
        vibrate: [200, 100, 200, 100, 200, 100, 200],
        actions: [
          { action: 'view', title: 'View Details' },
          { action: 'call', title: 'Call Emergency' },
          { action: 'dismiss', title: 'Dismiss' }
        ]
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  }

  private logEmergencyEvent(emergencyData: EmergencyData): void {
    const events = JSON.parse(localStorage.getItem('emergencyEvents') || '[]');
    events.push({
      ...emergencyData,
      id: Date.now().toString(),
      loggedAt: new Date().toISOString()
    });
    
    // Keep only last 100 events
    if (events.length > 100) {
      events.splice(0, events.length - 100);
    }
    
    localStorage.setItem('emergencyEvents', JSON.stringify(events));
  }

  public async findNearbyEmergencyServices(latitude: number, longitude: number, radius: number = 10): Promise<EmergencyService[]> {
    try {
      // In a real app, you would call a location-based service API
      // For now, we'll simulate finding nearby services
      
      const mockServices: EmergencyService[] = [
        {
          id: '1',
          name: 'City General Hospital',
          type: 'hospital',
          phone: '+1-555-123-4567',
          address: '123 Main St, City, State',
          coordinates: { latitude: latitude + 0.001, longitude: longitude + 0.001 }
        },
        {
          id: '2',
          name: 'Central Police Station',
          type: 'police',
          phone: '+1-555-987-6543',
          address: '456 Oak Ave, City, State',
          coordinates: { latitude: latitude - 0.001, longitude: longitude - 0.001 }
        },
        {
          id: '3',
          name: 'Fire Station #1',
          type: 'fire',
          phone: '+1-555-456-7890',
          address: '789 Pine St, City, State',
          coordinates: { latitude: latitude + 0.002, longitude: longitude - 0.002 }
        }
      ];

      // Calculate distances and sort by proximity
      const servicesWithDistance = mockServices.map(service => ({
        ...service,
        distance: this.calculateDistance(
          latitude, longitude,
          service.coordinates.latitude,
          service.coordinates.longitude
        )
      }));

      return servicesWithDistance
        .filter(service => service.distance <= radius)
        .sort((a, b) => (a.distance || 0) - (b.distance || 0));
        
    } catch (error) {
      console.error('Failed to find nearby emergency services:', error);
      return [];
    }
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  public addEmergencyContact(contact: EmergencyContact): void {
    this.emergencyContacts.push(contact);
    this.emergencyContacts.sort((a, b) => a.priority - b.priority);
    this.saveEmergencyContacts();
  }

  public removeEmergencyContact(phone: string): void {
    this.emergencyContacts = this.emergencyContacts.filter(c => c.phone !== phone);
    this.saveEmergencyContacts();
  }

  public getEmergencyContacts(): EmergencyContact[] {
    return [...this.emergencyContacts];
  }

  public getEmergencyEvents(): any[] {
    return JSON.parse(localStorage.getItem('emergencyEvents') || '[]');
  }

  public clearEmergencyEvents(): void {
    localStorage.removeItem('emergencyEvents');
  }
}

// Create singleton instance
export const emergencyNotificationService = new EmergencyNotificationService();
export default emergencyNotificationService; 