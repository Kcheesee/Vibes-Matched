# Health & Fitness Integration Guide

This guide explains how to integrate Apple HealthKit, Google Fit, and fitness wearables (Apple Watch, Fitbit, Garmin) into Vibes Matched for real-time heart rate monitoring.

---

## Table of Contents
1. [Apple HealthKit Integration (iOS)](#apple-healthkit-integration-ios)
2. [Google Fit Integration (Android)](#google-fit-integration-android)
3. [Apple Watch Integration](#apple-watch-integration)
4. [Fitbit Integration](#fitbit-integration)
5. [Garmin Integration](#garmin-integration)
6. [Testing](#testing)

---

## Apple HealthKit Integration (iOS)

### Prerequisites
- iOS 8.0+
- Physical iOS device (HealthKit doesn't work on simulator)
- Apple Developer Account

### Step 1: Enable HealthKit Capability

1. Open `ios/VibesMatched.xcworkspace` in Xcode
2. Select your project in the navigator
3. Go to **Signing & Capabilities**
4. Click **+ Capability**
5. Add **HealthKit**

### Step 2: Update Info.plist

Add required permissions to `ios/VibesMatched/Info.plist`:

```xml
<key>NSHealthShareUsageDescription</key>
<string>We need access to your heart rate data to match music to your workout intensity</string>

<key>NSHealthUpdateUsageDescription</key>
<string>We would like to save your workout data to HealthKit</string>

<key>UIBackgroundModes</key>
<array>
    <string>workout-processing</string>
</array>
```

### Step 3: Install react-native-health

```bash
cd frontend
npm install react-native-health
cd ios && pod install
```

### Step 4: Implement HealthKit Service

Create `frontend/src/services/healthKit.js`:

```javascript
import AppleHealthKit from 'react-native-health';

const HEALTHKIT_PERMISSIONS = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.HeartRate,
      AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
      AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
      AppleHealthKit.Constants.Permissions.Workout,
    ],
    write: [
      AppleHealthKit.Constants.Permissions.Workout,
      AppleHealthKit.Constants.Permissions.HeartRate,
    ],
  },
};

// Initialize HealthKit
export const initHealthKit = () => {
  return new Promise((resolve, reject) => {
    AppleHealthKit.initHealthKit(HEALTHKIT_PERMISSIONS, (error) => {
      if (error) {
        console.error('HealthKit initialization failed:', error);
        reject(error);
      } else {
        console.log('✅ HealthKit initialized successfully');
        resolve(true);
      }
    });
  });
};

// Get current heart rate
export const getCurrentHeartRate = () => {
  return new Promise((resolve, reject) => {
    const options = {
      unit: 'bpm',
      startDate: new Date(Date.now() - 5000).toISOString(), // Last 5 seconds
      endDate: new Date().toISOString(),
      ascending: false,
      limit: 1,
    };

    AppleHealthKit.getHeartRateSamples(options, (error, results) => {
      if (error) {
        reject(error);
        return;
      }

      if (results && results.length > 0) {
        resolve(results[0].value);
      } else {
        resolve(null);
      }
    });
  });
};

// Start continuous heart rate monitoring
export const startHeartRateMonitoring = (callback) => {
  const interval = setInterval(async () => {
    try {
      const heartRate = await getCurrentHeartRate();
      if (heartRate) {
        callback(heartRate);
      }
    } catch (error) {
      console.error('Heart rate monitoring error:', error);
    }
  }, 5000); // Poll every 5 seconds

  return interval; // Return interval ID to clear later
};

// Stop monitoring
export const stopHeartRateMonitoring = (intervalId) => {
  clearInterval(intervalId);
};

// Save workout to HealthKit
export const saveWorkout = async (workoutData) => {
  const options = {
    type: 'Running', // Can be: Running, Cycling, CrossTraining, etc.
    startDate: workoutData.startTime,
    endDate: workoutData.endTime,
    energyBurned: workoutData.caloriesBurned || 0,
    distance: workoutData.distance || 0,
  };

  return new Promise((resolve, reject) => {
    AppleHealthKit.saveWorkout(options, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};
```

### Step 5: Use in Your App

```javascript
import React, { useEffect, useState } from 'react';
import { initHealthKit, startHeartRateMonitoring, stopHeartRateMonitoring } from '../services/healthKit';

function WorkoutScreen() {
  const [heartRate, setHeartRate] = useState(null);
  const [monitoringInterval, setMonitoringInterval] = useState(null);

  useEffect(() => {
    // Initialize HealthKit on mount
    initHealthKit();
  }, []);

  const startMonitoring = () => {
    const interval = startHeartRateMonitoring((hr) => {
      console.log('Heart Rate:', hr);
      setHeartRate(hr);
      // Send to backend
      sendHeartRateToBackend(hr);
    });
    setMonitoringInterval(interval);
  };

  const stopMonitoring = () => {
    if (monitoringInterval) {
      stopHeartRateMonitoring(monitoringInterval);
    }
  };

  return (
    <View>
      <Text>Current Heart Rate: {heartRate || '--'} BPM</Text>
      <Button title="Start Monitoring" onPress={startMonitoring} />
      <Button title="Stop Monitoring" onPress={stopMonitoring} />
    </View>
  );
}
```

---

## Google Fit Integration (Android)

### Prerequisites
- Android 4.0+ (API 14+)
- Google Account
- Google Fit app installed on device

### Step 1: Enable Google Fit API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable **Fitness API**
4. Create OAuth 2.0 credentials
5. Add your app's SHA-1 fingerprint

Get SHA-1:
```bash
cd android
./gradlew signingReport
```

### Step 2: Install react-native-google-fit

```bash
npm install react-native-google-fit
```

### Step 3: Update AndroidManifest.xml

Add permissions to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.ACTIVITY_RECOGNITION"/>
<uses-permission android:name="android.permission.BODY_SENSORS" />
```

### Step 4: Implement Google Fit Service

Create `frontend/src/services/googleFit.js`:

```javascript
import GoogleFit from 'react-native-google-fit';

const FITNESS_PERMISSIONS = [
  {
    read: [
      GoogleFit.SCOPES.FITNESS_ACTIVITY_READ,
      GoogleFit.SCOPES.FITNESS_BODY_READ,
      GoogleFit.SCOPES.FITNESS_LOCATION_READ,
    ],
    write: [
      GoogleFit.SCOPES.FITNESS_ACTIVITY_WRITE,
      GoogleFit.SCOPES.FITNESS_BODY_WRITE,
    ],
  },
];

// Initialize Google Fit
export const initGoogleFit = async () => {
  try {
    const result = await GoogleFit.authorize(FITNESS_PERMISSIONS);
    if (result.success) {
      console.log('✅ Google Fit authorized');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Google Fit authorization failed:', error);
    throw error;
  }
};

// Get heart rate data
export const getHeartRate = async () => {
  const options = {
    startDate: new Date(Date.now() - 10000).toISOString(), // Last 10 seconds
    endDate: new Date().toISOString(),
  };

  try {
    const samples = await GoogleFit.getHeartRateSamples(options);
    if (samples && samples.length > 0) {
      return samples[samples.length - 1].value; // Return most recent
    }
    return null;
  } catch (error) {
    console.error('Failed to get heart rate:', error);
    return null;
  }
};

// Start real-time heart rate monitoring
export const startHeartRateMonitoring = (callback) => {
  const interval = setInterval(async () => {
    const heartRate = await getHeartRate();
    if (heartRate) {
      callback(heartRate);
    }
  }, 5000); // Poll every 5 seconds

  return interval;
};

// Stop monitoring
export const stopHeartRateMonitoring = (intervalId) => {
  clearInterval(intervalId);
};

// Save workout
export const saveWorkout = async (workoutData) => {
  const options = {
    startDate: workoutData.startTime,
    endDate: workoutData.endTime,
    activityType: 'running', // running, walking, cycling, etc.
    calories: workoutData.caloriesBurned || 0,
    distance: workoutData.distance || 0,
  };

  try {
    await GoogleFit.saveWorkout(options);
    console.log('✅ Workout saved to Google Fit');
  } catch (error) {
    console.error('Failed to save workout:', error);
  }
};
```

---

## Apple Watch Integration

### Overview
Apple Watch can provide **real-time heart rate data** through HealthKit. The watch syncs automatically with the iPhone.

### Step 1: Ensure Watch is Paired

- User must have Apple Watch paired with iPhone
- Health app should show "Apple Watch" as a data source

### Step 2: Request Workout Mode

For best heart rate accuracy during workouts, use:

```javascript
import AppleHealthKit from 'react-native-health';

export const startWatchWorkout = () => {
  const options = {
    type: 'Running',
    startDate: new Date().toISOString(),
  };

  AppleHealthKit.startWorkoutSession(options, (error, result) => {
    if (!error) {
      console.log('✅ Apple Watch workout started');
    }
  });
};

export const endWatchWorkout = () => {
  AppleHealthKit.endWorkoutSession((error, result) => {
    if (!error) {
      console.log('✅ Apple Watch workout ended');
    }
  });
};
```

### Step 3: Continuous Background Monitoring

Enable background delivery for live updates:

```javascript
export const enableBackgroundHeartRate = () => {
  AppleHealthKit.setObserver({
    type: 'HeartRate',
    frequency: AppleHealthKit.Constants.ObserverFrequency.immediate,
  });

  // Subscribe to updates
  AppleHealthKit.addListener('HeartRate', (data) => {
    console.log('❤️ New heart rate:', data.value, 'BPM');
    // Send to backend in real-time
    sendToBackend(data.value);
  });
};
```

---

## Fitbit Integration

### Prerequisites
- Fitbit Developer Account
- Fitbit device registered to user

### Step 1: Register Fitbit App

1. Go to [Fitbit Developer Portal](https://dev.fitbit.com/apps)
2. Register a new application
3. Set OAuth 2.0 Application Type: "Personal"
4. Note your **Client ID** and **Client Secret**

### Step 2: Install Fitbit SDK

```bash
npm install fitbit-web-api
```

### Step 3: Implement Fitbit OAuth

Create `frontend/src/services/fitbit.js`:

```javascript
import axios from 'axios';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

const FITBIT_CLIENT_ID = 'YOUR_FITBIT_CLIENT_ID';
const FITBIT_CLIENT_SECRET = 'YOUR_FITBIT_CLIENT_SECRET';
const REDIRECT_URI = 'vibesmatched://oauth/callback';

export const authorizeFitbit = async () => {
  const authUrl = `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${FITBIT_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=activity%20heartrate`;

  const result = await WebBrowser.openAuthSessionAsync(authUrl, REDIRECT_URI);

  if (result.type === 'success') {
    const code = new URL(result.url).searchParams.get('code');
    return await exchangeCodeForToken(code);
  }

  throw new Error('Fitbit authorization failed');
};

const exchangeCodeForToken = async (code) => {
  const response = await axios.post(
    'https://api.fitbit.com/oauth2/token',
    `client_id=${FITBIT_CLIENT_ID}&code=${code}&grant_type=authorization_code&redirect_uri=${REDIRECT_URI}`,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${FITBIT_CLIENT_ID}:${FITBIT_CLIENT_SECRET}`)}`,
      },
    }
  );

  return response.data.access_token;
};

// Get intraday heart rate
export const getIntradayHeartRate = async (accessToken) => {
  const today = new Date().toISOString().split('T')[0];
  const url = `https://api.fitbit.com/1/user/-/activities/heart/date/${today}/1d/1sec.json`;

  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data['activities-heart-intraday'].dataset;
};
```

---

## Garmin Integration

### Prerequisites
- Garmin Connect account
- Garmin Health API access (requires approval)

### Step 1: Apply for Garmin Health API

1. Go to [Garmin Health Developer Portal](https://developer.garmin.com/health-api/)
2. Apply for API access (review process may take weeks)
3. Receive **Consumer Key** and **Consumer Secret**

### Step 2: Implement OAuth 1.0a

Garmin uses OAuth 1.0a (more complex than OAuth 2.0):

```javascript
import OAuth from 'oauth-1.0a';
import crypto from 'crypto-js';

const garminOAuth = OAuth({
  consumer: {
    key: 'YOUR_CONSUMER_KEY',
    secret: 'YOUR_CONSUMER_SECRET',
  },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    return crypto.HmacSHA1(base_string, key).toString(crypto.enc.Base64);
  },
});

export const authorizeGarmin = async () => {
  // Step 1: Get request token
  const requestData = {
    url: 'https://connectapi.garmin.com/oauth-service/oauth/request_token',
    method: 'POST',
  };

  const headers = garminOAuth.toHeader(garminOAuth.authorize(requestData));

  // Implement full OAuth 1.0a flow
  // (More complex - consider using library like 'react-native-simple-auth')
};
```

**Note**: Garmin integration is more complex. Consider using a backend proxy to handle OAuth.

---

## Platform Detection & Fallback

Detect which services are available:

```javascript
import { Platform } from 'react-native';

export const getAvailableHealthServices = async () => {
  const services = [];

  if (Platform.OS === 'ios') {
    services.push('HealthKit', 'Apple Watch');
  } else if (Platform.OS === 'android') {
    services.push('Google Fit');
  }

  // Check if Fitbit/Garmin is connected
  const fitbitConnected = await checkFitbitConnection();
  if (fitbitConnected) services.push('Fitbit');

  return services;
};
```

---

## Testing

### Test HealthKit (iOS)

**Requirements**: Physical iPhone (simulator doesn't support HealthKit)

```javascript
const testHealthKit = async () => {
  try {
    // Initialize
    await initHealthKit();
    console.log('✅ HealthKit initialized');

    // Get heart rate
    const hr = await getCurrentHeartRate();
    console.log('❤️ Current HR:', hr, 'BPM');

    // Start monitoring
    const interval = startHeartRateMonitoring((heartRate) => {
      console.log('Real-time HR:', heartRate, 'BPM');
    });

    // Stop after 30 seconds
    setTimeout(() => {
      stopHeartRateMonitoring(interval);
      console.log('✅ Monitoring stopped');
    }, 30000);

  } catch (error) {
    console.error('❌ HealthKit test failed:', error);
  }
};
```

### Test Google Fit (Android)

**Requirements**: Physical Android device with Google Fit app

```javascript
const testGoogleFit = async () => {
  try {
    // Initialize
    const authorized = await initGoogleFit();
    if (!authorized) {
      console.log('❌ Authorization denied');
      return;
    }

    console.log('✅ Google Fit authorized');

    // Get heart rate
    const hr = await getHeartRate();
    console.log('❤️ Current HR:', hr, 'BPM');

  } catch (error) {
    console.error('❌ Google Fit test failed:', error);
  }
};
```

---

## Best Practices

### 1. **Graceful Degradation**
Always provide manual heart rate input as fallback:

```javascript
if (!healthKitAvailable) {
  // Show manual BPM input
  return <ManualHeartRateInput />;
}
```

### 2. **Battery Optimization**
- Poll heart rate every 5-10 seconds (not every second)
- Stop monitoring when app is in background
- Use background delivery only when necessary

### 3. **Privacy**
- Request only necessary permissions
- Explain why you need heart rate data
- Allow users to opt-out

### 4. **Error Handling**
```javascript
try {
  const hr = await getCurrentHeartRate();
  if (!hr) {
    // No data available - use last known value or fallback
  }
} catch (error) {
  // Permission denied or device error
  showErrorMessage('Heart rate unavailable. Please check permissions.');
}
```

---

## Resources

### Apple HealthKit
- [HealthKit Documentation](https://developer.apple.com/documentation/healthkit)
- [react-native-health](https://github.com/agencyenterprise/react-native-health)

### Google Fit
- [Google Fit REST API](https://developers.google.com/fit)
- [react-native-google-fit](https://github.com/StasDoskalenko/react-native-google-fit)

### Fitbit
- [Fitbit Web API](https://dev.fitbit.com/build/reference/web-api/)

### Garmin
- [Garmin Health API](https://developer.garmin.com/health-api/overview/)

---

## Future Enhancements

1. **Polar H10 Chest Strap** - Most accurate HR monitoring via Bluetooth
2. **Whoop Integration** - Recovery & strain data
3. **Oura Ring** - Sleep & recovery metrics
4. **Strava Integration** - Workout sync & social features
5. **Zwift Integration** - Indoor cycling/running

---

## Troubleshooting

### HealthKit: "No data available"
- Ensure user has granted permissions
- Check if Apple Watch is connected and syncing
- Verify Health app shows recent heart rate data

### Google Fit: "Authorization failed"
- Check SHA-1 fingerprint matches in Google Console
- Verify Google Fit app is installed and signed in
- Ensure all required scopes are requested

### Low accuracy / Delayed data
- Encourage users to wear Apple Watch/fitness tracker
- Ensure device is worn correctly (wrist positioning)
- Use workout mode for better accuracy
