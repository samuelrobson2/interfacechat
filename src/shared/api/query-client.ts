import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Throw errors for GET requests so they can be caught by ErrorBoundary
      throwOnError: true,
    },
    mutations: {
      // Don't throw errors for mutations - let components handle them via error object
      throwOnError: false,
    },
  },
});
