import { fetchClient, publicFetchClient } from "@/shared/api/instance";
import type { ApiSchemas } from "@/shared/api/schema";
import { jwtDecode } from "jwt-decode";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { posthog } from "posthog-js";

const ACCESS_TOKEN_KEY = "access_token";
const SESSION_STORE_KEY = "session-store";

type Session = {
  userId: string;
  exp: number;
  iat: number;
};

interface SessionState {
  user: ApiSchemas["UserResponse"] | null;
}

interface SessionActions {
  login: (accessToken: string, user?: ApiSchemas["UserResponse"]) => Promise<ApiSchemas["UserResponse"] | null>;
  logout: () => void;
  updateUser: (user: ApiSchemas["UserResponse"]) => void;
  getToken: () => Promise<string | null>;
  refreshToken: () => Promise<string | null>;
}

type SessionStore = SessionState & SessionActions;

let refreshTokenPromise: Promise<string | null> | null = null;

const decodeJWT = (token: string): Session | null => {
  try {
    return jwtDecode<Session>(token);
  } catch {
    return null;
  }
};

const isTokenExpired = (token: string): boolean => {
  const session = decodeJWT(token);
  if (!session) return true;
  return session.exp <= Date.now() / 1000;
};

export const getUser = async (userId: string) => {
  try {
    const response = await fetchClient.GET("/users/{id}", {
      params: {
        path: {
          id: userId,
        },
      },
    });
    return response.data?.user ?? null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const identifyUser = (user: ApiSchemas["UserResponse"]) => {
  const personProperties: Record<string, string> = {};
  if (user.email) personProperties.email = user.email;
  if (user.phone_number) personProperties.phone_number = user.phone_number;
  if (user.profile?.name) personProperties.name = user.profile.name;

  posthog.identify(user.user_id, personProperties);
};

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,

      // Actions
      login: async (accessToken: string, user?: ApiSchemas["UserResponse"]) => {
        sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        // TODO: Remove check for countries and languages when API will be updated
        if (user && !!user?.profile && !!user?.profile?.countries && !!user?.profile?.languages) {
          set({ user });
          identifyUser(user);
          return user;
        }

        const session = decodeJWT(accessToken);
        if (!session) {
          get().logout()
          return null;
        };

        const newUser = await getUser(session.userId);
        if (!newUser) {
          get().logout()
          return null;
        };

        set({ user: newUser });
        identifyUser(newUser);
        return newUser;
      },
      logout: () => {
        posthog.reset();
        sessionStorage.removeItem(ACCESS_TOKEN_KEY);
        set({ user: null });
      },
      updateUser: (user: ApiSchemas["UserResponse"]) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...user } : user,
        }));
      },
      getToken: async () => {
        const accessToken = sessionStorage.getItem(ACCESS_TOKEN_KEY);

        if (accessToken && !isTokenExpired(accessToken)) return accessToken;

        return await get().refreshToken();
      },
      refreshToken: async () => {
        if (!refreshTokenPromise) {
          refreshTokenPromise = publicFetchClient
            .POST("/auth/refresh", {
              credentials: "include",
            })
            .then((r) => r.data?.access_token ?? null)
            .then(async (newToken) => {
              if (newToken) {
                const user = await get().login(newToken);
                return user ? newToken : null;
              }

              get().logout();
              return null;
            })
            .catch(() => {
              get().logout();
              return null;
            })
            .finally(() => {
              refreshTokenPromise = null;
            });
        }

        return refreshTokenPromise;
      },
    }),
    {
      name: SESSION_STORE_KEY,
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
