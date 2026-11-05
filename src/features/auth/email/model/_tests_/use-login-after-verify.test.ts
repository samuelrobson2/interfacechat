import { renderHook, act } from "@testing-library/react";
import { useLoginAfterVerify } from "../use-login-after-verify";
import { useSessionStore } from "@/services/auth";
import { useNavigateAfterLogin } from "../../../_model/navigate-after-login";

// Mock dependencies
vi.mock("@/services/auth");
vi.mock("../../../_model/navigate-after-login");

describe("useLoginAfterVerify", () => {
  const mockLogin = vi.fn();
  const mockNavigateAfterLogin = vi.fn();

  const MOCK_USER = {
    user_id: "1",
    email: "test@example.com",
    phone_number: null,
    full_name: null,
    email_verified: true,
    created_at: "2023-01-01T00:00:00Z",
    profile: {},
    organizations: [],
    plan_id: "1",
  };

  // Mock data constants
  const MOCK_AUTH_DATA = {
    access_token: "token123",
    user: MOCK_USER,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSessionStore).mockReturnValue(mockLogin);
    vi.mocked(useNavigateAfterLogin).mockReturnValue(mockNavigateAfterLogin);
  });

  it("should return correct initial state when no data provided", () => {
    const { result } = renderHook(() => useLoginAfterVerify());

    expect(result.current.loginUser).toBeInstanceOf(Function);
    expect(result.current.isVerified).toBe(false);
  });

  it("should return correct state when data is provided", () => {
    const { result } = renderHook(() => useLoginAfterVerify(MOCK_AUTH_DATA));

    expect(result.current.loginUser).toBeInstanceOf(Function);
    expect(result.current.isVerified).toBe(true);
  });

  it("should return false for isVerified when data is null", () => {
    const { result } = renderHook(() => useLoginAfterVerify(null));

    expect(result.current.isVerified).toBe(false);
  });

  it("should handle successful login and navigation", async () => {
    mockLogin.mockResolvedValue(MOCK_USER);

    const { result } = renderHook(() => useLoginAfterVerify(MOCK_AUTH_DATA));

    await act(async () => {
      await result.current.loginUser();
    });

    expect(mockLogin).toHaveBeenCalledWith(
      MOCK_AUTH_DATA.access_token,
      MOCK_AUTH_DATA.user,
    );
    expect(mockNavigateAfterLogin).toHaveBeenCalledWith(MOCK_USER);
  });

  it("should not navigate when login fails", async () => {
    mockLogin.mockResolvedValue(null); // Login fails

    const { result } = renderHook(() => useLoginAfterVerify(MOCK_AUTH_DATA));

    await act(async () => {
      await result.current.loginUser();
    });

    expect(mockLogin).toHaveBeenCalledWith(
      MOCK_AUTH_DATA.access_token,
      MOCK_AUTH_DATA.user,
    );
    expect(mockNavigateAfterLogin).not.toHaveBeenCalled();
  });

  it("should do nothing when no data is provided to loginUser", async () => {
    const { result } = renderHook(() => useLoginAfterVerify());

    await act(async () => {
      await result.current.loginUser();
    });

    expect(mockLogin).not.toHaveBeenCalled();
    expect(mockNavigateAfterLogin).not.toHaveBeenCalled();
  });
});
