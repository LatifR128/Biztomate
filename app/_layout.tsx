import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/authStore';
import { useCardStore } from '@/store/cardStore';
import { useUserStore } from '@/store/userStore';
import { userDataStorage } from '@/utils/userDataStorage';
import { auth } from '@/lib/firebase';
import ErrorBoundary from '@/components/ErrorBoundary';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Auth guard component
function AuthGuard() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    try {
      if (isLoading) return; // Don't redirect while loading

      const inAuthGroup = segments[0] === 'auth';
      const inTabsGroup = segments[0] === '(tabs)';

      if (!isAuthenticated && !inAuthGroup) {
        // Redirect to auth if not authenticated and not already in auth group
        console.log('🔄 Redirecting to auth...');
        router.replace('/auth');
      } else if (isAuthenticated && inAuthGroup) {
        // Redirect to home if authenticated and in auth group
        console.log('🔄 Redirecting to home...');
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('❌ AuthGuard navigation error:', error);
      // Don't throw the error to prevent crashes
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
        console.log('🚀 Initializing Biztomate app...');
        
        // Initialize user data storage
        console.log('📁 Initializing user data storage...');
        await userDataStorage.initialize();
        
        // Initialize authentication
        console.log('🔐 Initializing authentication...');
        const unsubscribe = await initializeAuth();
        
        // Initialize user store
        console.log('👤 Initializing user store...');
        await initializeUser();
        
        // Load cards if user is authenticated
        if (isAuthenticated && user) {
          console.log('📇 Loading user cards...');
          await loadCards();
        }
        
        console.log('✅ App initialization completed successfully');
        return unsubscribe;
      } catch (error) {
        console.error('❌ App initialization error:', error);
        // Don't throw the error, just log it to prevent crashes
        // The app can still function with basic features
      }
    };

    initApp();
  }, [isAuthenticated, user]);

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AuthGuard />
      <ErrorBoundary>
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
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}