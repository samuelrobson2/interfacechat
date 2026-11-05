import { renderHook, act } from "@testing-library/react";
import { usePhoneVerify } from "../use-phone-verify";
import { publicRqClient } from "@/shared/api/instance";
import { useSessionStore } from "@/services/auth";
import { useNavigateAfterLogin } from "../../../_model/navigate-after-login";
import { usePhoneStore } from "../phone-store";

// Mock dependencies
vi.mock("@/shared/api/instance");
vi.mock("@/services/auth");
vi.mock("../../../_model/navigate-after-login");
vi.mock("../phone-store");

describe("usePhoneVerify", () => {
  const mockLogin = vi.fn();
  const mockNavigateAfterLogin = vi.fn();
  const mockClearVerifyStarted = vi.fn();
  const mockMutate = vi.fn();

  const MOCK_USER = {
    user_id: "1",
    email: null,
    phone_number: "+1234567890",
    full_name: null,
    email_verified: false,
    created_at: "2023-01-01T00:00:00Z",
    profile: {},
  };

  const MOCK_AUTH_DATA = {
    access_token: "token123",
    user: MOCK_USER,
  };

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
    vi.mocked(usePhoneStore).mockReturnValue(mockClearVerifyStarted);
    vi.mocked(publicRqClient.useMutation).mockReturnValue(createMockMutation());
  });

  it("should return initial state and call mutation correctly", () => {
    const { result } = renderHook(() => usePhoneVerify());
    const verifyData = { phone: "+1234567890", otp: "123456" };

    // Check initial state
    expect(result.current.phoneVerify).toBeInstanceOf(Function);
    expect(result.current.isPending).toBe(false);
    expect(result.current.errorMessage).toBeUndefined();

    // Test mutation call
    act(() => {
      result.current.phoneVerify(verifyData);
    });

    expect(mockMutate).toHaveBeenCalledWith({
      body: verifyData,
      credentials: "include",
    });
    expect(publicRqClient.useMutation).toHaveBeenCalledWith(
      "post",
      "/auth/login/phone/verify",
      expect.any(Object)
    );
  });

  it("should handle loading state", () => {
    vi.mocked(publicRqClient.useMutation).mockReturnValue(
      createMockMutation({ isPending: true })
    );

    const { result } = renderHook(() => usePhoneVerify());
    expect(result.current.isPending).toBe(true);
  });

  it("should handle error state", () => {
    const errorMessage = "Invalid OTP code";
    vi.mocked(publicRqClient.useMutation).mockReturnValue(
      createMockMutation({ error: { message: errorMessage } })
    );

    const { result } = renderHook(() => usePhoneVerify());
    expect(result.current.errorMessage).toBe(errorMessage);
  });

  it("should handle successful verification, login and navigation", async () => {
    const mockOnSuccess = vi.fn();
    const verifyData = { phone: "+1234567890", otp: "123456" };

    mockLogin.mockResolvedValue(MOCK_USER);

    vi.mocked(publicRqClient.useMutation).mockImplementation((_method, _url, options) => {
      if (options?.onSuccess) {
        mockOnSuccess.mockImplementation(options.onSuccess);
      }
      return createMockMutation();
    });

    renderHook(() => usePhoneVerify());

    // Simulate successful verification
    await act(async () => {
      await mockOnSuccess(MOCK_AUTH_DATA, { body: verifyData });
    });

    expect(mockLogin).toHaveBeenCalledWith(MOCK_AUTH_DATA.access_token, MOCK_AUTH_DATA.user);
    expect(mockClearVerifyStarted).toHaveBeenCalledWith(verifyData.phone);
    expect(mockNavigateAfterLogin).toHaveBeenCalledWith(MOCK_USER);
  });

  it("should not navigate when login fails", async () => {
    const mockOnSuccess = vi.fn();
    const verifyData = { phone: "+1234567890", otp: "123456" };

    mockLogin.mockResolvedValue(null); // Login fails

    vi.mocked(publicRqClient.useMutation).mockImplementation((_method, _url, options) => {
      if (options?.onSuccess) {
        mockOnSuccess.mockImplementation(options.onSuccess);
      }
      return createMockMutation();
    });

    renderHook(() => usePhoneVerify());

    // Simulate verification with failed login
    await act(async () => {
      await mockOnSuccess(MOCK_AUTH_DATA, { body: verifyData });
    });

    expect(mockLogin).toHaveBeenCalledWith(MOCK_AUTH_DATA.access_token, MOCK_AUTH_DATA.user);
    expect(mockClearVerifyStarted).toHaveBeenCalledWith(verifyData.phone);
    expect(mockNavigateAfterLogin).not.toHaveBeenCalled();
  });

  it("should clear verify started state after successful verification", async () => {
    const mockOnSuccess = vi.fn();
    const verifyData = { phone: "+1234567890", otp: "123456" };

    mockLogin.mockResolvedValue(MOCK_USER);

    vi.mocked(publicRqClient.useMutation).mockImplementation((_method, _url, options) => {
      if (options?.onSuccess) {
        mockOnSuccess.mockImplementation(options.onSuccess);
      }
      return createMockMutation();
    });

    renderHook(() => usePhoneVerify());

    await act(async () => {
      await mockOnSuccess(MOCK_AUTH_DATA, { body: verifyData });
    });

    // Verify that clearVerifyStarted was called with correct phone number
    expect(mockClearVerifyStarted).toHaveBeenCalledWith(verifyData.phone);
    expect(mockClearVerifyStarted).toHaveBeenCalledTimes(1);
  });
});
