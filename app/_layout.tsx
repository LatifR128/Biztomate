import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/authStore';
import { useCardStore } from '@/store/cardStore';
import { useUserStore } from '@/store/userStore';
import { userDataStorage } from '@/utils/userDataStorage';
import { auth } from '@/lib/firebase';

// Auth guard component
function AuthGuard() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Don't redirect while loading

    const inAuthGroup = segments[0] === 'auth';
    const inTabsGroup = segments[0] === '(tabs)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to auth if not authenticated and not already in auth group
      router.replace('/auth');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to home if authenticated and in auth group
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments]);

  return null;
}

export default function RootLayout() {
  const { initializeAuth, user, isAuthenticated, isLoading } = useAuthStore();
  const { loadCards } = useCardStore();
  const { initializeUser } = useUserStore();

  useEffect(() => {
    const initApp = async () => {
      try {
        // Initialize user data storage
        await userDataStorage.initialize();
        
        // Initialize authentication
        const unsubscribe = await initializeAuth();
        
        // Initialize user store
        await initializeUser();
        
        // Load cards if user is authenticated
        if (isAuthenticated && user) {
          await loadCards();
        }
        
        return unsubscribe;
      } catch (error) {
        console.error('App initialization error:', error);
      }
    };

    initApp();
  }, [isAuthenticated, user]);

  return (
    <>
      <StatusBar style="auto" />
      <AuthGuard />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="card" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="subscription" options={{ headerShown: false }} />
        <Stack.Screen name="export" options={{ headerShown: false }} />
        <Stack.Screen name="payment" options={{ headerShown: false }} />
        <Stack.Screen name="privacy" options={{ headerShown: false }} />
        <Stack.Screen name="terms" options={{ headerShown: false }} />
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}