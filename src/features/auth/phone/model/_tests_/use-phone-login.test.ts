import { publicRqClient } from "@/shared/api/instance";
import { ROUTES } from "@/shared/model/routes";
import { act, renderHook } from "@testing-library/react";
import { useNavigate } from "react-router-dom";
import { usePhoneLogin } from "../use-phone-login";

// Mock dependencies
vi.mock("@/shared/api/instance");
vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
  href: vi.fn((route: string) => route),
}));

describe("usePhoneLogin", () => {
  const mockNavigate = vi.fn();
  const mockMutate = vi.fn();
  const mockMutateAsync = vi.fn();

  // Helper to create mock mutation return value
  const createMockMutation = (overrides = {}) => ({
    mutate: mockMutate,
    mutateAsync: mockMutateAsync,
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
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(publicRqClient.useMutation).mockReturnValue(createMockMutation());
  });

  it("should return initial state and call mutation correctly", () => {
    const { result } = renderHook(() => usePhoneLogin());
    const phoneData = { phone: "+1234567890" };

    // Check initial state
    expect(result.current.phoneLogin).toBeInstanceOf(Function);
    expect(result.current.phoneLoginAsync).toBeInstanceOf(Function);
    expect(result.current.isPending).toBe(false);
    expect(result.current.errorMessage).toBeUndefined();

    // Test mutation call
    act(() => {
      result.current.phoneLogin(phoneData);
    });

    expect(mockMutate).toHaveBeenCalledWith({
      body: phoneData,
    });
    expect(publicRqClient.useMutation).toHaveBeenCalledWith(
      "post",
      "/auth/login/phone",
      expect.any(Object)
    );
  });

  it("should handle loading state", () => {
    vi.mocked(publicRqClient.useMutation).mockReturnValue(
      createMockMutation({ isPending: true })
    );

    const { result } = renderHook(() => usePhoneLogin());
    expect(result.current.isPending).toBe(true);
  });

  it("should handle error state", () => {
    const errorMessage = "Invalid phone number";
    vi.mocked(publicRqClient.useMutation).mockReturnValue(
      createMockMutation({ error: { message: errorMessage } })
    );

    const { result } = renderHook(() => usePhoneLogin());
    expect(result.current.errorMessage).toBe(errorMessage);
  });

  it("should handle successful phone login and navigation", () => {
    const mockOnSuccess = vi.fn();
    const phoneData = { phone: "+1234567890" };

    vi.mocked(publicRqClient.useMutation).mockImplementation((_method, _url, options) => {
      if (options?.onSuccess) {
        mockOnSuccess.mockImplementation(options.onSuccess);
      }
      return createMockMutation();
    });

    renderHook(() => usePhoneLogin());

    // Simulate successful phone login
    act(() => {
      mockOnSuccess({}, { body: phoneData });
    });

    const expectedUrl = `${ROUTES.PHONE_AUTH_OTP}?phone=${encodeURIComponent(phoneData.phone)}`;
    expect(mockNavigate).toHaveBeenCalledWith(expectedUrl);
  });

  it("should call phoneLoginAsync correctly", async () => {
    const phoneData = { phone: "+1234567890" };
    mockMutateAsync.mockResolvedValue({});

    const { result } = renderHook(() => usePhoneLogin());

    await act(async () => {
      await result.current.phoneLoginAsync(phoneData);
    });

    expect(mockMutateAsync).toHaveBeenCalledWith({
      body: phoneData,
    });
  });

  it("should handle phoneLoginAsync error", async () => {
    const phoneData = { phone: "+1234567890" };
    const error = new Error("Network error");
    mockMutateAsync.mockRejectedValue(error);

    const { result } = renderHook(() => usePhoneLogin());

    await expect(
      act(async () => {
        await result.current.phoneLoginAsync(phoneData);
      })
    ).rejects.toThrow("Network error");
  });
});
