import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useNavigate, redirect } from "react-router-dom";
import {
  useNavigateAfterLogin,
  redirectAfterLogin,
} from "../navigate-after-login";
import { ROUTES } from "@/shared/model/routes";
import type { ApiSchemas } from "@/shared/api/schema";
import { REDIRECT_AFTER_LOGIN_KEY } from "@/services/auth";

// Mock react-router-dom
vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
  redirect: vi.fn(),
}));

// Test data factory
const createUserResponse = (
  overrides?: Partial<ApiSchemas["UserResponse"]>,
): ApiSchemas["UserResponse"] => ({
  user_id: "1",
  email: "test@example.com",
  phone_number: null,
  full_name: null,
  email_verified: true,
  created_at: "2024-01-01T00:00:00Z",
  organizations: [],
  profile: {
    languages: [],
    countries: [],
  },
  plan_id: "1",
  ...overrides,
});

describe("Navigation after login", () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it("should navigate to APP when user has completed profile", () => {
    // Arrange - user with completed profile (name, languages, countries)
    const user = createUserResponse({
      profile: {
        name: "John Doe",
        languages: [
          {
            id: 1,
            name: "English",
            code: "en",
            createdAt: "2024-01-01T00:00:00Z",
          },
        ],
        countries: [
          {
            id: 1,
            name: "United States",
            code: "US",
            createdAt: "2024-01-01T00:00:00Z",
          },
        ],
        domains: [
          {
            id: 1,
            name: "Example Domain",
            createdAt: "2024-01-01T00:00:00Z",
            code: "example",
          },
        ],
      },
    });

    // Act & Assert - useNavigateAfterLogin
    const { result } = renderHook(() => useNavigateAfterLogin());
    result.current(user);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.HOME);

    // Act & Assert - redirectAfterLogin
    vi.clearAllMocks();
    redirectAfterLogin(user);
    expect(redirect).toHaveBeenCalledWith(ROUTES.HOME);
  });

  it("should navigate to SETUP_PROFILE when user has no profile name", () => {
    // Arrange - user without profile name
    const user = createUserResponse();

    // Act & Assert - useNavigateAfterLogin
    const { result } = renderHook(() => useNavigateAfterLogin());
    result.current(user);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SETUP_PROFILE);

    // Act & Assert - redirectAfterLogin
    vi.clearAllMocks();
    redirectAfterLogin(user);
    expect(redirect).toHaveBeenCalledWith(ROUTES.SETUP_PROFILE);
  });

  it("should navigate to SETUP_PROFILE when profile exists but name is empty", () => {
    // Arrange - user with profile but empty name
    const user = createUserResponse({
      profile: { name: "", languages: [], countries: [] },
    });

    // Act & Assert - useNavigateAfterLogin
    const { result } = renderHook(() => useNavigateAfterLogin());
    result.current(user);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SETUP_PROFILE);

    // Act & Assert - redirectAfterLogin
    vi.clearAllMocks();
    redirectAfterLogin(user);
    expect(redirect).toHaveBeenCalledWith(ROUTES.SETUP_PROFILE);
  });

  it("should navigate to SETUP_PROFILE when user has name but missing languages or countries", () => {
    // Arrange - user with name but no languages
    const userNoLanguages = createUserResponse({
      profile: {
        name: "John Doe",
        languages: [],
        countries: [
          {
            id: 1,
            name: "United States",
            code: "US",
            createdAt: "2024-01-01T00:00:00Z",
          },
        ],
      },
    });

    // Act & Assert
    const { result } = renderHook(() => useNavigateAfterLogin());
    result.current(userNoLanguages);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SETUP_PROFILE);

    // Arrange - user with name but no countries
    vi.clearAllMocks();
    const userNoCountries = createUserResponse({
      profile: {
        name: "John Doe",
        languages: [
          {
            id: 1,
            name: "English",
            code: "en",
            createdAt: "2024-01-01T00:00:00Z",
          },
        ],
        countries: [],
      },
    });

    // Act & Assert
    result.current(userNoCountries);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SETUP_PROFILE);
  });

  it("should navigate to saved redirect path from sessionStorage when profile is complete", () => {
    // Arrange - completed profile and saved redirect path
    const savedPath = "/dataset/abc-123";
    sessionStorage.setItem(REDIRECT_AFTER_LOGIN_KEY, savedPath);

    const user = createUserResponse({
      profile: {
        name: "John Doe",
        languages: [
          {
            id: 1,
            name: "English",
            code: "en",
            createdAt: "2024-01-01T00:00:00Z",
          },
        ],
        countries: [
          {
            id: 1,
            name: "United States",
            code: "US",
            createdAt: "2024-01-01T00:00:00Z",
          },
        ],
        domains: [
          {
            id: 1,
            name: "Example Domain",
            createdAt: "2024-01-01T00:00:00Z",
            code: "example",
          },
        ],
      },
    });

    // Act & Assert - useNavigateAfterLogin
    const { result } = renderHook(() => useNavigateAfterLogin());
    result.current(user);
    expect(mockNavigate).toHaveBeenCalledWith(savedPath);
    expect(sessionStorage.getItem(REDIRECT_AFTER_LOGIN_KEY)).toBeNull();

    // Act & Assert - redirectAfterLogin
    sessionStorage.setItem(REDIRECT_AFTER_LOGIN_KEY, savedPath);
    vi.clearAllMocks();
    redirectAfterLogin(user);
    expect(redirect).toHaveBeenCalledWith(savedPath);
    expect(sessionStorage.getItem(REDIRECT_AFTER_LOGIN_KEY)).toBeNull();
  });

  it("should not navigate to saved path when profile is incomplete", () => {
    // Arrange - incomplete profile and saved redirect path
    const savedPath = "/dataset/abc-123";
    sessionStorage.setItem(REDIRECT_AFTER_LOGIN_KEY, savedPath);

    const user = createUserResponse();

    // Act & Assert - useNavigateAfterLogin
    const { result } = renderHook(() => useNavigateAfterLogin());
    result.current(user);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SETUP_PROFILE);
    // Redirect path should still be in storage for after profile setup
    expect(sessionStorage.getItem(REDIRECT_AFTER_LOGIN_KEY)).toBe(savedPath);

    // Act & Assert - redirectAfterLogin
    vi.clearAllMocks();
    redirectAfterLogin(user);
    expect(redirect).toHaveBeenCalledWith(ROUTES.SETUP_PROFILE);
    expect(sessionStorage.getItem(REDIRECT_AFTER_LOGIN_KEY)).toBe(savedPath);
  });
});
