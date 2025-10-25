/**
 * Apple HealthKit Service - Interface for reading heart rate data
 */

import AppleHealthKit from 'react-native-health';
import { Platform } from 'react-native';

const PERMISSIONS = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.HeartRate,
      AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
    ],
    write: [
      AppleHealthKit.Constants.Permissions.Workout,
    ],
  },
};

class HealthService {
  constructor() {
    this.isAvailable = Platform.OS === 'ios';
    this.isInitialized = false;
  }

  /**
   * Initialize HealthKit and request permissions
   */
  async initialize() {
    if (!this.isAvailable) {
      console.log('HealthKit not available on this platform');
      return false;
    }

    return new Promise((resolve, reject) => {
      AppleHealthKit.initHealthKit(PERMISSIONS, (error) => {
        if (error) {
          console.error('Error initializing HealthKit:', error);
          reject(error);
          return;
        }

        this.isInitialized = true;
        console.log('HealthKit initialized successfully');
        resolve(true);
      });
    });
  }

  /**
   * Get the most recent heart rate sample
   * @returns {Promise<number>} Heart rate in BPM
   */
  async getLatestHeartRate() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const options = {
        unit: 'bpm',
        startDate: new Date(Date.now() - 60000).toISOString(), // Last 1 minute
        limit: 1,
        ascending: false,
      };

      AppleHealthKit.getHeartRateSamples(options, (error, results) => {
        if (error) {
          console.error('Error getting heart rate:', error);
          reject(error);
          return;
        }

        if (results && results.length > 0) {
          const bpm = Math.round(results[0].value);
          resolve(bpm);
        } else {
          // No recent data available, resolve with null
          resolve(null);
        }
      });
    });
  }

  /**
   * Start continuous heart rate monitoring
   * @param {Function} callback - Called with each new heart rate reading
   * @param {number} intervalMs - How often to check for new readings (default: 3000ms)
   * @returns {Function} Stop function to cancel monitoring
   */
  startHeartRateMonitoring(callback, intervalMs = 3000) {
    let lastValue = null;

    const checkHeartRate = async () => {
      try {
        const bpm = await this.getLatestHeartRate();

        // Only call callback if we have a new value
        if (bpm !== null && bpm !== lastValue) {
          lastValue = bpm;
          callback(bpm);
        }
      } catch (error) {
        console.error('Error in heart rate monitoring:', error);
      }
    };

    // Initial check
    checkHeartRate();

    // Set up interval
    const intervalId = setInterval(checkHeartRate, intervalMs);

    // Return stop function
    return () => clearInterval(intervalId);
  }

  /**
   * Get heart rate samples over a time range
   * @param {Date} startDate
   * @param {Date} endDate
   * @returns {Promise<Array>} Array of {value, startDate, endDate} objects
   */
  async getHeartRateSamples(startDate, endDate) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const options = {
        unit: 'bpm',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        ascending: false,
      };

      AppleHealthKit.getHeartRateSamples(options, (error, results) => {
        if (error) {
          console.error('Error getting heart rate samples:', error);
          reject(error);
          return;
        }

        resolve(results || []);
      });
    });
  }

  /**
   * Save a workout to Apple Health
   * @param {Object} workoutData - {type, startDate, endDate, energyBurned, distance}
   */
  async saveWorkout(workoutData) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const options = {
        type: workoutData.type || 'Running', // Workout type
        startDate: workoutData.startDate.toISOString(),
        endDate: workoutData.endDate.toISOString(),
        energyBurned: workoutData.energyBurned || 0, // kcal
        distance: workoutData.distance || 0, // meters
      };

      AppleHealthKit.saveWorkout(options, (error, result) => {
        if (error) {
          console.error('Error saving workout:', error);
          reject(error);
          return;
        }

        console.log('Workout saved to Apple Health');
        resolve(result);
      });
    });
  }
}

export default new HealthService();
