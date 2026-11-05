import { renderHook, act } from "@testing-library/react";
import { useSignin } from "../use-signin";
import { publicRqClient } from "@/shared/api/instance";
import { useSessionStore } from "@/services/auth";
import { useNavigateAfterLogin } from "../../../_model/navigate-after-login";

// Mock dependencies
vi.mock("@/shared/api/instance");
vi.mock("@/services/auth");
vi.mock("../../../_model/navigate-after-login");

describe("useSignin", () => {
  const mockLogin = vi.fn();
  const mockNavigateAfterLogin = vi.fn();
  const mockMutate = vi.fn();

  // Helper to create mock mutation return value
  const createMockMutation = (overrides = {}) => ({
    mutate: mockMutate,
    isPending: false,
    error: null,
    data: undefined,
    isError: false,
    isSuccess: false,
    reset: vi.fn(),
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSessionStore).mockReturnValue(mockLogin);
    vi.mocked(useNavigateAfterLogin).mockReturnValue(mockNavigateAfterLogin);
    vi.mocked(publicRqClient.useMutation).mockReturnValue(createMockMutation());
  });

  it("should return initial state and call mutation correctly", () => {
    const { result } = renderHook(() => useSignin());
    const loginData = { email: "test@example.com", password: "password123" };

    // Check initial state
    expect(result.current.signIn).toBeInstanceOf(Function);
    expect(result.current.isPending).toBe(false);
    expect(result.current.errorMessage).toBeUndefined();

    // Test mutation call
    act(() => {
      result.current.signIn(loginData);
    });

    expect(mockMutate).toHaveBeenCalledWith({
      body: loginData,
      credentials: "include",
    });
    expect(publicRqClient.useMutation).toHaveBeenCalledWith(
      "post",
      "/auth/login",
      expect.any(Object)
    );
  });

  it("should handle loading state", () => {
    vi.mocked(publicRqClient.useMutation).mockReturnValue(
      createMockMutation({ isPending: true })
    );

    const { result } = renderHook(() => useSignin());
    expect(result.current.isPending).toBe(true);
  });

  it("should handle different error types correctly", () => {
    // Test 401 error
    vi.mocked(publicRqClient.useMutation).mockReturnValue(
      createMockMutation({ error: { statusCode: 401, message: "Unauthorized" } })
    );
    
    const { result: result401 } = renderHook(() => useSignin());
    expect(result401.current.errorMessage).toBe("There is no account with those credentials");

    // Test 403 error
    vi.mocked(publicRqClient.useMutation).mockReturnValue(
      createMockMutation({ error: { statusCode: 403, message: "Forbidden" } })
    );

    const { result: result403 } = renderHook(() => useSignin());
    expect(result403.current.errorMessage).toBe("Email not verified");

    // Test generic error
    const genericMessage = "Network error";
    vi.mocked(publicRqClient.useMutation).mockReturnValue(
      createMockMutation({ error: { message: genericMessage } })
    );

    const { result: resultGeneric } = renderHook(() => useSignin());
    expect(resultGeneric.current.errorMessage).toBe(genericMessage);
  });

  it("should handle successful login and navigation", async () => {
    const mockOnSuccess = vi.fn();
    const mockUser = { id: "1", email: "test@example.com" };
    const loginResponse = {
      access_token: "token123",
      user: mockUser,
    };

    mockLogin.mockResolvedValue(mockUser);

    vi.mocked(publicRqClient.useMutation).mockImplementation((_method, _url, options) => {
      if (options?.onSuccess) {
        mockOnSuccess.mockImplementation(options.onSuccess);
      }
      return createMockMutation();
    });

    renderHook(() => useSignin());

    // Simulate successful login
    await act(async () => {
      await mockOnSuccess(loginResponse);
    });

    expect(mockLogin).toHaveBeenCalledWith(loginResponse.access_token, loginResponse.user);
    expect(mockNavigateAfterLogin).toHaveBeenCalledWith(mockUser);
  });

  it("should not navigate when login fails", async () => {
    const mockOnSuccess = vi.fn();
    const loginResponse = {
      access_token: "token123",
      user: { id: "1", email: "test@example.com" },
    };

    mockLogin.mockResolvedValue(null); // Login fails

    vi.mocked(publicRqClient.useMutation).mockImplementation((_method, _url, options) => {
      if (options?.onSuccess) {
        mockOnSuccess.mockImplementation(options.onSuccess);
      }
      return createMockMutation();
    });

    renderHook(() => useSignin());

    // Simulate login attempt with failed session creation
    await act(async () => {
      await mockOnSuccess(loginResponse);
    });

    expect(mockLogin).toHaveBeenCalledWith(loginResponse.access_token, loginResponse.user);
    expect(mockNavigateAfterLogin).not.toHaveBeenCalled();
  });
});
