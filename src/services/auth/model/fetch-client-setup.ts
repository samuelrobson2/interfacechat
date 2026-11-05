import { fetchClient } from "@/shared/api/instance";
import { DEV_AUTH_BYPASS } from "@/shared/model/dev-auth-bypass";
import { ROUTER_BASENAME, ROUTES } from "@/shared/model/routes";
import { useSessionStore } from "./session-store";

export const setupFetchClient = () => {
  // Setup authorization middleware for API client
  fetchClient.use({
    async onRequest({ request }) {
      const accessToken = await useSessionStore.getState().getToken();

      if (accessToken) {
        request.headers.set("Authorization", `Bearer ${accessToken}`);
      } else if (DEV_AUTH_BYPASS) {
        // Dev bypass: proceed without a token instead of redirecting to signin,
        // so links stay navigable. The request itself may still fail (no backend).
        return request;
      } else {
        // No valid token available - redirect to signin page
        window.location.pathname = ROUTER_BASENAME + ROUTES.SIGNIN;
        return;
      }

      return request;
    },
    async onResponse({ request, response }) {
      // Handle 403 Forbidden error - try to refresh token and retry request
      // Check if this is not already a retry attempt to prevent infinite loops
      const isRetry = request.headers.get("X-Retry-Attempt") === "true";

      if (response.status === 403 && !isRetry && !DEV_AUTH_BYPASS) {
        try {
          const newToken = await useSessionStore.getState().refreshToken();

          if (!newToken) {
            window.location.pathname = ROUTER_BASENAME + ROUTES.SIGNIN;
            return;
          }

          const newRequest = request.clone();
          newRequest.headers.set("Authorization", `Bearer ${newToken}`);
          // Mark this as a retry attempt to prevent infinite loops
          newRequest.headers.set("X-Retry-Attempt", "true");

          const retryResponse = await fetch(newRequest);
          return retryResponse;
        } catch (error) {
          console.error("Token refresh failed:", error);
          window.location.pathname = ROUTER_BASENAME + ROUTES.SIGNIN;
        }
      }

      return response;
    },
  });
};
