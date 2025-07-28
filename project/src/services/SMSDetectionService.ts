export interface SMSMessage {
  id: string;
  sender: string;
  body: string;
  timestamp: Date;
  isEmergency: boolean;
}

export interface EmergencyTrigger {
  keywords: string[];
  senderNumbers: string[];
  autoResponse: boolean;
}

class SMSDetectionService {
  private isListening = false;
  private emergencyTriggers: EmergencyTrigger[] = [
    {
      keywords: ['emergency', 'accident', 'help', 'sos', 'danger', 'crash'],
      senderNumbers: ['*', '911', '112'], // * means any number
      autoResponse: true
    }
  ];

  constructor() {
    this.initializeSMSDetection();
  }

  private async initializeSMSDetection() {
    try {
      // Check if SMS API is available (Android WebView or PWA)
      if ('sms' in navigator || 'webkitSms' in navigator) {
        console.log('SMS API available');
        this.startListening();
      } else {
        console.log('SMS API not available, using fallback methods');
        this.setupFallbackDetection();
      }
    } catch (error) {
      console.error('Failed to initialize SMS detection:', error);
      this.setupFallbackDetection();
    }
  }

  private startListening() {
    if (this.isListening) return;

    try {
      // Listen for incoming SMS messages
      if ('sms' in navigator) {
        (navigator as any).sms.addEventListener('received', this.handleSMSReceived.bind(this));
      } else if ('webkitSms' in navigator) {
        (navigator as any).webkitSms.addEventListener('received', this.handleSMSReceived.bind(this));
      }

      this.isListening = true;
      console.log('SMS detection started');
    } catch (error) {
      console.error('Failed to start SMS listening:', error);
    }
  }

  private handleSMSReceived(event: any) {
    const message: SMSMessage = {
      id: event.id || Date.now().toString(),
      sender: event.sender || 'Unknown',
      body: event.body || '',
      timestamp: new Date(),
      isEmergency: this.isEmergencyMessage(event.body, event.sender)
    };

    console.log('SMS received:', message);

    if (message.isEmergency) {
      this.triggerEmergencyResponse(message);
    }
  }

  private isEmergencyMessage(body: string, sender: string): boolean {
    const lowerBody = body.toLowerCase();
    
    return this.emergencyTriggers.some(trigger => {
      const keywordMatch = trigger.keywords.some(keyword => 
        lowerBody.includes(keyword.toLowerCase())
      );
      
      const senderMatch = trigger.senderNumbers.includes('*') || 
        trigger.senderNumbers.includes(sender);
      
      return keywordMatch && senderMatch;
    });
  }

  private async triggerEmergencyResponse(message: SMSMessage) {
    console.log('Emergency SMS detected, triggering response...');
    
    // 1. Request location permission and get current location
    await this.requestLocationAndStartTracking();
    
    // 2. Send emergency alert
    this.sendEmergencyAlert(message);
    
    // 3. Notify nearby services
    await this.notifyNearbyServices(message);
    
    // 4. Show emergency UI
    this.showEmergencyUI(message);
  }

  private async requestLocationAndStartTracking() {
    try {
      // Request location permission
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      
      if (permission.state === 'granted' || permission.state === 'prompt') {
        // Get current location
        const position = await this.getCurrentPosition();
        
        // Store location for emergency services
        localStorage.setItem('emergencyLocation', JSON.stringify({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        }));
        
        console.log('Location obtained for emergency:', position.coords);
      }
    } catch (error) {
      console.error('Failed to get location for emergency:', error);
    }
  }

  private getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      });
    });
  }

  private sendEmergencyAlert(message: SMSMessage) {
    // Create and dispatch custom event for emergency
    const emergencyEvent = new CustomEvent('emergencySMSDetected', {
      detail: {
        message,
        location: JSON.parse(localStorage.getItem('emergencyLocation') || '{}'),
        timestamp: new Date().toISOString()
      }
    });
    
    window.dispatchEvent(emergencyEvent);
    
    // Show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🚨 EMERGENCY ALERT', {
        body: `Emergency SMS detected: ${message.body}`,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: 'emergency-alert',
        requireInteraction: true,
        actions: [
          { action: 'view', title: 'View Details' },
          { action: 'dismiss', title: 'Dismiss' }
        ]
      });
    }
  }

  private async notifyNearbyServices(message: SMSMessage) {
    try {
      const location = JSON.parse(localStorage.getItem('emergencyLocation') || '{}');
      
      if (location.latitude && location.longitude) {
        // Send to emergency services API
        const emergencyData = {
          type: 'sms_emergency',
          message: message.body,
          sender: message.sender,
          location: {
            latitude: location.latitude,
            longitude: location.longitude
          },
          timestamp: new Date().toISOString()
        };
        
        // In a real implementation, you would send this to your emergency services API
        console.log('Sending emergency data to services:', emergencyData);
        
        // Simulate API call
        await this.sendToEmergencyAPI(emergencyData);
      }
    } catch (error) {
      console.error('Failed to notify nearby services:', error);
    }
  }

  private async sendToEmergencyAPI(data: any) {
    // This would be your actual emergency services API endpoint
    const apiUrl = 'https://your-emergency-api.com/alert';
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        console.log('Emergency alert sent successfully');
      } else {
        console.error('Failed to send emergency alert');
      }
    } catch (error) {
      console.error('Error sending emergency alert:', error);
    }
  }

  private showEmergencyUI(message: SMSMessage) {
    // Trigger the emergency alert UI in the main app
    const emergencyEvent = new CustomEvent('showEmergencyAlert', {
      detail: {
        status: 'accident',
        message: message.body,
        sender: message.sender,
        timestamp: message.timestamp
      }
    });
    
    window.dispatchEvent(emergencyEvent);
  }

  private setupFallbackDetection() {
    // Fallback for when SMS API is not available
    // This could use periodic polling or other methods
    console.log('Setting up fallback SMS detection');
    
    // For demo purposes, we'll simulate SMS detection
    // In a real app, you might use:
    // - WebSocket connection to your server
    // - Server-sent events
    // - Periodic API polling
    // - Native app bridge
    
    this.simulateSMSDetection();
  }

  private simulateSMSDetection() {
    // For testing purposes - simulate emergency SMS
    setTimeout(() => {
      const testMessage: SMSMessage = {
        id: 'test-emergency',
        sender: 'GSM_MODULE',
        body: 'EMERGENCY: Accident detected! Driver needs immediate assistance.',
        timestamp: new Date(),
        isEmergency: true
      };
      
      this.handleSMSReceived({ body: testMessage.body, sender: testMessage.sender });
    }, 5000); // Simulate after 5 seconds
  }

  public addEmergencyTrigger(trigger: EmergencyTrigger) {
    this.emergencyTriggers.push(trigger);
  }

  public removeEmergencyTrigger(index: number) {
    this.emergencyTriggers.splice(index, 1);
  }

  public getEmergencyTriggers(): EmergencyTrigger[] {
    return [...this.emergencyTriggers];
  }

  public stopListening() {
    this.isListening = false;
    console.log('SMS detection stopped');
  }
}

// Create singleton instance
export const smsDetectionService = new SMSDetectionService();
export default smsDetectionService; 