/**
 * App Navigator - Routes and navigation structure
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { Colors } from '../constants/colors';

// Screens
import LoginScreen from '../screens/LoginScreenV2'; // V2 design
import RegisterScreen from '../screens/RegisterScreenV2'; // V2 design
import HomeScreenV1 from '../screens/HomeScreen'; // Old design (renamed)
import HomeScreen from '../screens/HomeScreenV2'; // V2 is now the default
import TopSongsScreenV1 from '../screens/TopSongsScreen'; // Old design (renamed)
import TopSongsScreen from '../screens/TopSongsScreenV2'; // V2 is now the default
import WorkoutStartScreenV1 from '../screens/WorkoutStartScreen'; // Old design (renamed)
import WorkoutStartScreen from '../screens/WorkoutStartScreenV2'; // V2 is now the default
import WorkoutTrackingScreenV1 from '../screens/WorkoutTrackingScreen'; // Old design (renamed)
import WorkoutTrackingScreen from '../screens/WorkoutTrackingScreenV2'; // V2 is now the default
import WorkoutDetailsScreenV1 from '../screens/WorkoutDetailsScreen'; // Old design (renamed)
import WorkoutDetailsScreen from '../screens/WorkoutDetailsScreenV2'; // V2 is now the default
import CreateProfileScreenV1 from '../screens/CreateProfileScreen'; // Old design (renamed)
import CreateProfileScreen from '../screens/CreateProfileScreenV2'; // V2 is now the default
import SpotifyConnectScreen from '../screens/SpotifyConnectScreen';
import MusicSyncScreen from '../screens/MusicSyncScreenV2'; // V2 design with theme system
import SocialScreen from '../screens/SocialScreen'; // Unified social hub with V2 design
import AccountScreen from '../screens/AccountScreen'; // Account settings with V2 design
import ActivityFeedScreen from '../screens/ActivityFeedScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        // Auth Stack - Login/Register
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      ) : (
        // Main App Stack - After login
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: Colors.primary,
            },
            headerTintColor: Colors.white,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="HomeV1"
            component={HomeScreenV1}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="TopSongs"
            component={TopSongsScreen}
            options={{ title: 'Top Songs' }}
          />
          <Stack.Screen
            name="WorkoutStart"
            component={WorkoutStartScreen}
            options={{ title: 'Start Workout' }}
          />
          <Stack.Screen
            name="WorkoutTracking"
            component={WorkoutTrackingScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="WorkoutDetails"
            component={WorkoutDetailsScreen}
            options={{ title: 'Workout Details' }}
          />
          <Stack.Screen
            name="CreateProfile"
            component={CreateProfileScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SpotifyConnect"
            component={SpotifyConnectScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="MusicSync"
            component={MusicSyncScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Friends"
            component={SocialScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Account"
            component={AccountScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ActivityFeed"
            component={ActivityFeedScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
