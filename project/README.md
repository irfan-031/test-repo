# Smart Emergency Response App

A comprehensive emergency response web application that automatically detects SMS alerts from GSM modules, triggers emergency responses, and notifies nearby hospitals and police stations.

## 🚨 Features

### Automated SMS Detection
- **Real-time SMS Monitoring**: Automatically detects incoming SMS messages from your GSM module
- **Keyword-based Triggers**: Configurable keywords to identify emergency messages
- **Automatic Response**: Instantly triggers emergency protocols when emergency SMS is detected

### Emergency Response System
- **Automatic Location Tracking**: Gets current location when emergency is detected
- **Nearby Services Alert**: Automatically notifies nearby hospitals and police stations
- **Emergency Contacts**: Sends SMS alerts to pre-configured emergency contacts
- **Push Notifications**: Real-time browser notifications for emergency events

### PWA (Progressive Web App) Features
- **Offline Capability**: Works even without internet connection
- **Background Processing**: Service worker handles SMS monitoring in background
- **Automatic Startup**: App can start automatically when emergency is detected
- **Installable**: Can be installed as a native app on mobile devices

## 📱 How It Works

### 1. SMS Detection
When your GSM module sends an emergency SMS:
```
EMERGENCY: Accident detected! Driver needs immediate assistance.
```

The app automatically:
- ✅ Detects the emergency keywords
- ✅ Triggers automatic location tracking
- ✅ Sends alerts to nearby emergency services
- ✅ Notifies emergency contacts via SMS
- ✅ Shows emergency alert UI

### 2. Automatic Response Flow
1. **SMS Received** → GSM module sends emergency message
2. **Detection** → App detects emergency keywords
3. **Location** → Automatically gets current GPS location
4. **Alerts** → Sends to hospitals, police, emergency contacts
5. **UI** → Shows emergency alert interface
6. **Notifications** → Browser and push notifications

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 16+ installed
- Modern web browser with PWA support
- GSM module connected to your hardware

### Installation

1. **Clone and Install**
```bash
git clone <your-repo>
cd project
npm install
```

2. **Start Development Server**
```bash
npm run dev
```

3. **Build for Production**
```bash
npm run build
```

### PWA Installation

1. **On Mobile**: Open the app in Chrome/Safari
2. **Install**: Tap "Add to Home Screen" or "Install App"
3. **Permissions**: Grant location and notification permissions
4. **Background**: App will run in background for SMS monitoring

## ⚙️ Configuration

### Emergency Contacts
Add emergency contacts in the Settings:
- Name, phone number, relationship
- Priority order for notifications
- Automatic SMS sending

### SMS Triggers
Configure keywords that trigger emergency response:
- **Keywords**: emergency, accident, help, sos, danger, crash
- **Sender Numbers**: Specific numbers or * for any number
- **Auto Response**: Enable/disable automatic response

### Emergency Services
The app automatically finds and contacts:
- Nearby hospitals
- Police stations
- Fire departments
- Ambulance services

## 🔧 Technical Implementation

### SMS Detection Methods

#### 1. Native SMS API (Android WebView)
```javascript
// Listen for incoming SMS
navigator.sms.addEventListener('received', handleSMS);
```

#### 2. Service Worker Background Sync
```javascript
// Periodic SMS checking
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-sms') {
    checkForSMS();
  }
});
```

#### 3. WebSocket Connection
```javascript
// Real-time SMS from server
const ws = new WebSocket('wss://your-server.com/sms');
ws.onmessage = (event) => handleSMS(event.data);
```

### Location Services
```javascript
// Automatic location when emergency detected
navigator.geolocation.getCurrentPosition(
  (position) => {
    // Send location to emergency services
    sendEmergencyAlert({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    });
  }
);
```

### Emergency Notifications
```javascript
// Send to multiple services
await emergencyNotificationService.sendEmergencyAlert({
  type: 'accident',
  location: currentLocation,
  message: 'Emergency detected',
  severity: 'critical'
});
```

## 📋 API Integration

### Emergency Services API
```javascript
// Send emergency alert
POST /api/emergency-alert
{
  "type": "accident",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "message": "Emergency detected",
  "timestamp": "2024-01-01T12:00:00Z",
  "severity": "critical"
}
```

### SMS Service (Twilio)
```javascript
// Send SMS to emergency contacts
await twilioClient.messages.create({
  body: emergencyMessage,
  to: contact.phone,
  from: 'your-twilio-number'
});
```

## 🔒 Security & Privacy

- **Location Data**: Only shared during emergencies
- **SMS Content**: Processed locally, not stored
- **Emergency Contacts**: Stored locally on device
- **HTTPS Required**: All API calls use secure connections

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### PWA Requirements
- HTTPS enabled
- Valid manifest.json
- Service worker registered
- Icons in multiple sizes

### Server Requirements
- Node.js server for API endpoints
- WebSocket support for real-time SMS
- SMS gateway integration (Twilio, etc.)

## 📱 Mobile Optimization

### Android
- Add to home screen
- Background app refresh enabled
- Location permissions granted
- Notification permissions granted

### iOS
- Install as PWA
- Safari settings for location
- Notification permissions

## 🧪 Testing

### Test Emergency Alert
1. Open Settings
2. Click "Send Test Alert"
3. Verify notifications appear
4. Check emergency services contacted

### Test SMS Detection
1. Send SMS with emergency keywords
2. Verify app detects and responds
3. Check location tracking activates
4. Confirm alerts sent

## 🔧 Troubleshooting

### Common Issues

**SMS not detected:**
- Check SMS API permissions
- Verify keywords in settings
- Test with fallback detection

**Location not working:**
- Grant location permissions
- Check GPS enabled
- Test in different browsers

**Notifications not showing:**
- Grant notification permissions
- Check browser settings
- Test on HTTPS

**PWA not installing:**
- Ensure HTTPS
- Check manifest.json
- Verify service worker

## 📞 Support

For technical support or questions:
- Check browser console for errors
- Verify all permissions granted
- Test with different emergency scenarios
- Review service worker logs

## 🔄 Updates

### Version History
- **v1.0**: Basic emergency response
- **v1.1**: SMS detection added
- **v1.2**: PWA features
- **v1.3**: Automated response system

### Future Features
- Voice recognition for emergency calls
- Integration with smart home devices
- AI-powered emergency assessment
- Real-time emergency service status

---

**⚠️ Important**: This is an emergency response system. Always test thoroughly before relying on it for actual emergencies. Have backup emergency procedures in place. 