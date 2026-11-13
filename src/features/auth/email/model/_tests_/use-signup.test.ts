import { renderHook, act } from "@testing-library/react";
import { useSignup } from "../use-signup";
import { publicRqClient } from "@/shared/api/instance";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/shared/model/routes";

// Mock dependencies
vi.mock("@/shared/api/instance");
vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
  href: vi.fn((route: string) => route),
}));

describe("useSignup", () => {
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
    const { result } = renderHook(() => useSignup());
    const signupData = { email: "test@example.com", password: "password123" };

    // Check initial state
    expect(result.current.signUp).toBeInstanceOf(Function);
    expect(result.current.isPending).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.errorMessage).toBeUndefined();

    // Test mutation call
    act(() => {
      result.current.signUp(signupData);
    });

    expect(mockMutate).toHaveBeenCalledWith({ body: signupData });
    expect(publicRqClient.useMutation).toHaveBeenCalledWith(
      "post",
      "/auth/register",
      expect.any(Object)
    );
  });

  it("should handle loading and error states", () => {
    // Test loading state
    vi.mocked(publicRqClient.useMutation).mockReturnValue(
      createMockMutation({ isPending: true })
    );
    
    const { result: loadingResult } = renderHook(() => useSignup());
    expect(loadingResult.current.isPending).toBe(true);

    // Test error state
    const errorMessage = "Email already exists";
    vi.mocked(publicRqClient.useMutation).mockReturnValue(
      createMockMutation({ 
        isError: true, 
        error: { responseMessage: errorMessage } 
      })
    );

    const { result: errorResult } = renderHook(() => useSignup());
    expect(errorResult.current.isError).toBe(true);
    expect(errorResult.current.errorMessage).toBe(errorMessage);
  });

  it("should navigate to notify email page on successful signup", async () => {
    const mockOnSuccess = vi.fn();
    const signupData = { email: "test@example.com", password: "password123" };

    vi.mocked(publicRqClient.useMutation).mockImplementation((_method, _url, options) => {
      if (options?.onSuccess) {
        mockOnSuccess.mockImplementation(options.onSuccess);
      }
      return createMockMutation();
    });

    renderHook(() => useSignup());

    // Simulate successful signup; onSuccess is async (it waits for the caller's own onSuccess first).
    await act(async () => {
      await mockOnSuccess(null, { body: signupData });
    });

    expect(mockNavigate).toHaveBeenCalledWith(
      `${ROUTES.NOTIFY_EMAIL}?email=${encodeURIComponent(signupData.email)}`
    );
  });

  it("should wait for the caller's onSuccess before navigating", async () => {
    const mockOnSuccess = vi.fn();
    let finish: () => void = () => {};
    const callerOnSuccess = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));

    vi.mocked(publicRqClient.useMutation).mockImplementation((_method, _url, options) => {
      if (options?.onSuccess) mockOnSuccess.mockImplementation(options.onSuccess);
      return createMockMutation();
    });

    renderHook(() => useSignup({ onSuccess: callerOnSuccess }));

    let done: Promise<unknown> = Promise.resolve();
    act(() => {
      done = mockOnSuccess(null, { body: { email: "a@b.co", password: "x" } });
    });
    expect(callerOnSuccess).toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();

    await act(async () => {
      finish();
      await done;
    });
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });
});
