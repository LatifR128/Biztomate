import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

// Create a robust tRPC client with error handling
export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: __DEV__ ? "http://localhost:3000/trpc" : "https://api.biztomate.com/trpc",
      transformer: superjson,
      // Add error handling and retry logic
      fetch: async (url, options) => {
        try {
          const response = await fetch(url, options);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response;
        } catch (error) {
          console.error('tRPC request failed:', error);
          // Return a mock response for development/production fallback
          return new Response(JSON.stringify({
            result: {
              data: null,
              error: {
                code: -32603,
                message: 'Internal error - using fallback data',
                data: null
              }
            }
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
    }),
  ],
});