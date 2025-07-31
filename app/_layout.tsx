import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useUserStore } from "@/store/userStore";
import { useAuthStore } from "@/store/authStore";
import Colors from "@/constants/colors";
import { trpc, trpcClient } from "@/lib/trpc";
import ErrorBoundary from "@/components/ErrorBoundary";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { initializeInAppPurchases, disconnectInAppPurchases } from "@/lib/inAppPurchases";

export const unstable_settings = {
  initialRouteName: "welcome",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Create a client
const queryClient = new QueryClient();

export default function RootLayout() {
  const initializeUser = useUserStore(state => state.initializeUser);
  const { initializeAuth, isAuthenticated, isLoading } = useAuthStore();
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);
  
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) {
      console.error('Font loading error:', error);
      // Don't throw error in production, just log it
      if (__DEV__) {
        console.warn('Font loading failed, continuing without custom fonts');
      }
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      // Initialize authentication
      try {
        initializeAuth();
      } catch (error) {
        console.error('Auth initialization error:', error);
      }
      
      // Initialize in-app purchases
      if (Platform.OS === 'ios') {
        try {
          initializeInAppPurchases();
        } catch (error) {
          console.error('In-app purchases initialization error:', error);
        }
      }
      
      // Check if this is the first launch
      const checkFirstLaunch = async () => {
        try {
          const hasLaunched = await AsyncStorage.getItem('hasLaunched');
          
          if (hasLaunched === null) {
            // First launch
            setIsFirstLaunch(true);
            await AsyncStorage.setItem('hasLaunched', 'true');
          } else {
            // Not first launch
            setIsFirstLaunch(false);
            try {
              initializeUser();
            } catch (error) {
              console.error('User initialization error:', error);
            }
          }
        } catch (error) {
          console.error('Error checking first launch:', error);
          setIsFirstLaunch(false);
          try {
            initializeUser();
          } catch (userError) {
            console.error('User initialization error:', userError);
          }
        }
        
        try {
          await SplashScreen.hideAsync();
        } catch (error) {
          console.error('Error hiding splash screen:', error);
        }
      };
      
      checkFirstLaunch();
    }
  }, [loaded, initializeUser, initializeAuth]);

  // Cleanup in-app purchases on unmount
  useEffect(() => {
    return () => {
      if (Platform.OS === 'ios') {
        try {
          disconnectInAppPurchases();
        } catch (error) {
          console.error('Error disconnecting in-app purchases:', error);
        }
      }
    };
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <StatusBar style="dark" backgroundColor={Colors.light.background} />
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <RootLayoutNav isFirstLaunch={isFirstLaunch} />
        </QueryClientProvider>
      </trpc.Provider>
    </ErrorBoundary>
  );
}

function RootLayoutNav({ isFirstLaunch }: { isFirstLaunch: boolean }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  // Show loading screen while checking authentication
  if (isLoading) {
    return null; // This will show the splash screen
  }

  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        headerStyle: {
          backgroundColor: Colors.light.background,
        },
        headerTintColor: Colors.light.primary,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 17,
        },
        contentStyle: {
          backgroundColor: Colors.light.background,
        },
        headerShadowVisible: false,
        animation: Platform.OS === 'ios' ? 'default' : 'slide_from_right',
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      {/* Authentication screens */}
      {!isAuthenticated && (
        <>
          <Stack.Screen name="auth/index" options={{ headerShown: false }} />
          <Stack.Screen name="auth/signin" options={{ headerShown: false }} />
          <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
        </>
      )}

      {/* App screens - only show if authenticated */}
      {isAuthenticated && (
        <>
          {isFirstLaunch ? (
            <Stack.Screen name="welcome" options={{ headerShown: false }} />
          ) : null}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
          <Stack.Screen name="auth/signin" options={{ headerShown: false }} />
          <Stack.Screen 
            name="card/[id]" 
            options={{ 
              title: "Card Details",
              presentation: "card",
            }} 
          />
          <Stack.Screen 
            name="card/edit/[id]" 
            options={{ 
              title: "Edit Card",
              presentation: "card",
            }} 
          />
          <Stack.Screen 
            name="subscription" 
            options={{ 
              title: "Subscription Plans",
              presentation: "modal",
            }} 
          />
          <Stack.Screen 
            name="export" 
            options={{ 
              title: "Export Cards",
              presentation: "modal",
            }} 
          />
          <Stack.Screen 
            name="privacy" 
            options={{ 
              title: "Privacy Policy",
              presentation: "modal",
            }} 
          />
          <Stack.Screen 
            name="terms" 
            options={{ 
              title: "Terms of Service",
              presentation: "modal",
            }} 
          />
          <Stack.Screen 
            name="payment" 
            options={{ 
              title: "Payment",
              presentation: "modal",
            }} 
          />
        </>
      )}
    </Stack>
  );
}