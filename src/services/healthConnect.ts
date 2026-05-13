import * as SecureStore from 'expo-secure-store';

// NOTE: To make this work with real Apple Health / Google Fit,
// you need to install 'expo-health-connect' or similar.
// Run: npx expo install expo-health-connect
// and rebuild the app.

export const healthConnectService = {
  requestPermissions: async (): Promise<boolean> => {
    console.log('Requesting Health permissions (Mock)');
    // In real app:
    // const hasPermission = await HealthConnect.requestPermission([...]);
    // return hasPermission;
    return true;
  },

  syncData: async (): Promise<{ sleepHrs: number | null; heartRate: number | null }> => {
    console.log('Syncing Health data (Mock)');
    
    // In real app, fetch from health store:
    // const sleep = await HealthConnect.getSleepData(...);
    
    // For now, let's return the smart estimate if available
    const smartSleep = await SecureStore.getItemAsync('smart_sleep_hours');
    
    return {
      sleepHrs: smartSleep ? parseFloat(smartSleep) : null,
      heartRate: null,
    };
  },
};
