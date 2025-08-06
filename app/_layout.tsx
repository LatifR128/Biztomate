import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useUserStore } from '@/store/userStore';
import { useAuthStore } from '@/store/authStore';
import { useCardStore } from '@/store/cardStore';
import { userDataStorage } from '@/utils/userDataStorage';
import { auth, db, storage, analytics } from '@/lib/firebase';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { initializeUser } = useUserStore();
  const { initializeAuth, isAuthenticated, isLoading } = useAuthStore();
  const { subscribeToCards } = useCardStore();
  
  useEffect(() => {
    // Initialize user data storage and user data on app start
    const initDataStorage = async () => {
      await userDataStorage.initialize();
      initializeUser();
    };
    
    initDataStorage();
  }, [initializeUser]);

  useEffect(() => {
    const initApp = async () => {
      const unsubscribeAuth = await initializeAuth();
      
      // Set up real-time card sync when authenticated
      if (isAuthenticated) {
        const unsubscribeCards = subscribeToCards();
        
        return () => {
          unsubscribeAuth?.();
          unsubscribeCards?.();
        };
      }
      
      return unsubscribeAuth;
    };
    
    initApp();
  }, [isAuthenticated]);

  return (
    <SafeAreaProvider>
      <StatusBar 
        style={colorScheme === 'dark' ? 'light' : 'dark'}
      />
      <ErrorBoundary>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: '#FFFFFF',
            },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="subscription" options={{ headerShown: false }} />
          <Stack.Screen name="payment" options={{ headerShown: false }} />
          <Stack.Screen name="welcome" options={{ headerShown: false }} />
          <Stack.Screen name="terms" options={{ headerShown: false }} />
          <Stack.Screen name="privacy" options={{ headerShown: false }} />
          <Stack.Screen name="export" options={{ headerShown: false }} />
          <Stack.Screen name="card" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}