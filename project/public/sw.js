const CACHE_NAME = 'emergency-app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/App.tsx',
  '/src/components/EmergencyAlert.tsx',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});

// Background sync for emergency alerts
self.addEventListener('sync', (event) => {
  if (event.tag === 'emergency-alert') {
    event.waitUntil(sendEmergencyAlert());
  }
});

// Push notification handling
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Emergency alert received!',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: 'emergency-alert',
    requireInteraction: true,
    actions: [
      { action: 'view', title: 'View Details' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('🚨 EMERGENCY ALERT', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handling from main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'EMERGENCY_SMS_DETECTED') {
    handleEmergencySMS(event.data);
  }
});

// Handle emergency SMS detection
function handleEmergencySMS(data) {
  console.log('Service Worker: Emergency SMS detected', data);
  
  // Show notification
  const options = {
    body: `Emergency SMS from ${data.sender}: ${data.message}`,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [200, 100, 200, 100, 200, 100, 200],
    tag: 'emergency-sms',
    requireInteraction: true,
    actions: [
      { action: 'open_app', title: 'Open App' },
      { action: 'call_emergency', title: 'Call Emergency' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  self.registration.showNotification('🚨 EMERGENCY SMS ALERT', options);
  
  // Send to all clients
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'EMERGENCY_SMS_DETECTED',
        data: data
      });
    });
  });
}

// Send emergency alert to API
async function sendEmergencyAlert() {
  try {
    const response = await fetch('/api/emergency-alert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'sms_emergency',
        timestamp: new Date().toISOString(),
        source: 'service_worker'
      })
    });
    
    if (response.ok) {
      console.log('Emergency alert sent successfully');
    }
  } catch (error) {
    console.error('Failed to send emergency alert:', error);
  }
}

// Periodic background sync for SMS checking
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-sms') {
    event.waitUntil(checkForSMS());
  }
});

async function checkForSMS() {
  try {
    // This would be your actual SMS checking logic
    // For now, we'll simulate it
    console.log('Checking for new SMS messages...');
    
    // In a real implementation, you might:
    // 1. Call your server API to check for new SMS
    // 2. Use WebSocket to receive real-time SMS
    // 3. Use native app bridge to access SMS
    
    const hasNewSMS = Math.random() > 0.8; // Simulate 20% chance of new SMS
    
    if (hasNewSMS) {
      const mockSMS = {
        sender: 'GSM_MODULE',
        message: 'EMERGENCY: Accident detected! Driver needs immediate assistance.',
        timestamp: new Date().toISOString()
      };
      
      handleEmergencySMS(mockSMS);
    }
  } catch (error) {
    console.error('Error checking for SMS:', error);
  }
}

// Handle app startup
self.addEventListener('beforeinstallprompt', (event) => {
  console.log('App can be installed');
});

// Handle app installation
self.addEventListener('appinstalled', (event) => {
  console.log('App installed successfully');
  
  // Request notification permission
  if ('Notification' in self) {
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: 'your-vapid-public-key'
    });
  }
}); 