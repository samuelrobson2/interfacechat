import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";
import type { ApiPaths } from "./schema";
import { CONFIG } from "../model/config";
import type { Middleware } from "openapi-fetch";
import { ApiError } from "./api-error";

// Middleware to throw errors for HTTP error responses
// This allows ErrorBoundary to catch errors from GET requests and loaders
const errorMiddleware: Middleware = {
  async onResponse({ response }) {
    if (!response.ok) {
      const errorData = await response.clone().json().catch(() => ({}));
    
      throw new ApiError(response, errorData);
    }
    return response;
  },
};

// FOR AUTHENTICATED ROUTES
export const fetchClient = createFetchClient<ApiPaths>({
  baseUrl: CONFIG.API_BASE_URL,
});
fetchClient.use(errorMiddleware);
export const rqClient = createClient(fetchClient);

// FOR PUBLIC ROUTES
export const publicFetchClient = createFetchClient<ApiPaths>({
  baseUrl: CONFIG.API_BASE_URL,
});
publicFetchClient.use(errorMiddleware);
export const publicRqClient = createClient(publicFetchClient);
