import { renderHook, act } from "@testing-library/react";
import { useCheckEmail } from "../use-check-email";
import { publicRqClient } from "@/shared/api/instance";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/shared/model/routes";

// Mock dependencies
vi.mock("@/shared/api/instance");
vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
  href: vi.fn((route: string) => route),
}));

describe("useCheckEmail", () => {
  const mockNavigate = vi.fn();
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
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(publicRqClient.useMutation).mockReturnValue(createMockMutation());
  });

  it("should return initial state and call mutation correctly", () => {
    const { result } = renderHook(() => useCheckEmail());
    const emailData = { email: "test@example.com" };

    // Check initial state
    expect(result.current.checkEmail).toBeInstanceOf(Function);
    expect(result.current.isPending).toBe(false);
    expect(result.current.errorMessage).toBeUndefined();

    // Test mutation call
    act(() => {
      result.current.checkEmail(emailData);
    });

    expect(mockMutate).toHaveBeenCalledWith({ body: emailData });
    expect(publicRqClient.useMutation).toHaveBeenCalledWith(
      "post",
      "/auth/check-email",
      expect.any(Object)
    );
  });

  it("should handle loading and error states", () => {
    // Test loading state
    vi.mocked(publicRqClient.useMutation).mockReturnValue(
      createMockMutation({ isPending: true })
    );
    
    const { result: loadingResult } = renderHook(() => useCheckEmail());
    expect(loadingResult.current.isPending).toBe(true);

    // Test error state
    const errorMessage = "Network error";
    vi.mocked(publicRqClient.useMutation).mockReturnValue(
      createMockMutation({ error: { message: errorMessage } })
    );

    const { result: errorResult } = renderHook(() => useCheckEmail());
    expect(errorResult.current.errorMessage).toBe(errorMessage);
  });

  it("should handle successful email check and navigation", () => {
    const mockOnSuccess = vi.fn();
    const emailData = { email: "test@example.com" };

    vi.mocked(publicRqClient.useMutation).mockImplementation((_method, _url, options) => {
      if (options?.onSuccess) {
        mockOnSuccess.mockImplementation(options.onSuccess);
      }
      return createMockMutation();
    });

    renderHook(() => useCheckEmail());

    // Test successful response
    act(() => {
      mockOnSuccess({ isAvailable: true }, { body: emailData });
    });

    expect(mockNavigate).toHaveBeenCalledWith(
      `${ROUTES.SIGNUP_PASSWORD}?email=${encodeURIComponent(emailData.email)}`
    );
  });

  it("should throw error when email is unavailable or data is invalid", () => {
    const mockOnSuccess = vi.fn();
    const emailData = { email: "taken@example.com" };

    vi.mocked(publicRqClient.useMutation).mockImplementation((_method, _url, options) => {
      if (options?.onSuccess) {
        mockOnSuccess.mockImplementation(options.onSuccess);
      }
      return createMockMutation();
    });

    renderHook(() => useCheckEmail());

    // Test unavailable email
    expect(() => {
      act(() => {
        mockOnSuccess({ isAvailable: false }, { body: emailData });
      });
    }).toThrow("Email already in use");

    // Test invalid response data
    expect(() => {
      act(() => {
        mockOnSuccess({}, { body: emailData });
      });
    }).toThrow("Email already in use");
  });
});
