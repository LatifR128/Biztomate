import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useUserStore } from "@/store/userStore";
import Colors from "@/constants/colors";
import { trpc, trpcClient } from "@/lib/trpc";

export const unstable_settings = {
  initialRouteName: "welcome",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Create a client
const queryClient = new QueryClient();

export default function RootLayout() {
  const initializeUser = useUserStore(state => state.initializeUser);
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);
  
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      // Check if this is the first launch
      const checkFirstLaunch = async () => {
        try {
          const hasLaunched = await import('@react-native-async-storage/async-storage').then(
            AsyncStorage => AsyncStorage.default.getItem('hasLaunched')
          );
          
          if (hasLaunched === null) {
            // First launch
            setIsFirstLaunch(true);
            await import('@react-native-async-storage/async-storage').then(
              AsyncStorage => AsyncStorage.default.setItem('hasLaunched', 'true')
            );
          } else {
            // Not first launch
            setIsFirstLaunch(false);
            initializeUser();
          }
        } catch (error) {
          console.error('Error checking first launch:', error);
          setIsFirstLaunch(false);
          initializeUser();
        }
        
        SplashScreen.hideAsync();
      };
      
      checkFirstLaunch();
    }
  }, [loaded, initializeUser]);

  if (!loaded) {
    return null;
  }

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <RootLayoutNav isFirstLaunch={isFirstLaunch} />
      </QueryClientProvider>
    </trpc.Provider>
  );
}

function RootLayoutNav({ isFirstLaunch }: { isFirstLaunch: boolean }) {
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
        },
        contentStyle: {
          backgroundColor: Colors.light.background,
        },
      }}
    >
      {isFirstLaunch ? (
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
      ) : null}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
    </Stack>
  );
}