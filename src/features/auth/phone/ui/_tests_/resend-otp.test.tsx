import { renderWithRouter } from "@/shared/test/test-utils";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { usePhoneStore } from "../../model/phone-store";
import { usePhoneLogin } from "../../model/use-phone-login";
import { ResendOTP } from "../resend-otp";

// Mock hooks
vi.mock("../../model/use-phone-login");
vi.mock("../../model/phone-store");

// Mock useCountdown hook
const mockStart = vi.fn();
const mockClear = vi.fn();
let mockCountdownState = {
  start: mockStart,
  isStarted: true,
  timeLeft: 10,
  isReady: false,
  clear: mockClear,
};

vi.mock("@/shared/lib/react/use-countdown", () => ({
  useCountdown: vi.fn(() => mockCountdownState),
}));

describe("ResendOTP", () => {
  const mockPhoneLoginAsync = vi.fn();
  const mockSetIsVerifyStarted = vi.fn();
  const testPhone = "+11234567890";
  const testDuration = 10;

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset countdown state to default
    mockCountdownState = {
      start: mockStart,
      isStarted: true,
      timeLeft: 10,
      isReady: false,
      clear: mockClear,
    };

    // Default mock implementations
    vi.mocked(usePhoneLogin).mockReturnValue({
      phoneLogin: vi.fn(),
      phoneLoginAsync: mockPhoneLoginAsync,
      isPending: false,
      errorMessage: undefined,
    });

    vi.mocked(usePhoneStore).mockReturnValue({
      isVerifyStarted: {},
      setIsVerifyStarted: mockSetIsVerifyStarted,
      clearVerifyStarted: vi.fn(),
    });
  });

  it("should display countdown timer when started", () => {
    renderWithRouter(<ResendOTP phone={testPhone} duration={testDuration} />);

    // Verify countdown text is displayed
    expect(screen.getByText(/resend code: 10 sec/i)).toBeInTheDocument();

    // Verify refresh icon is present
    const refreshIcon = screen.getByText(/resend code: 10 sec/i).parentElement;
    expect(refreshIcon).toBeInTheDocument();
  });

  it("should display resend button when countdown is finished", () => {
    // Set countdown to finished state
    mockCountdownState = {
      start: mockStart,
      isStarted: false,
      timeLeft: 0,
      isReady: true,
      clear: mockClear,
    };

    renderWithRouter(<ResendOTP phone={testPhone} duration={testDuration} />);

    // Verify resend button is displayed
    const resendButton = screen.getByRole("button", { name: /resend code/i });
    expect(resendButton).toBeInTheDocument();
    expect(resendButton).not.toBeDisabled();
  });

  it("should handle resend code workflow successfully", async () => {
    const user = userEvent.setup();

    // Set countdown to finished state
    mockCountdownState = {
      start: mockStart,
      isStarted: false,
      timeLeft: 0,
      isReady: true,
      clear: mockClear,
    };

    mockPhoneLoginAsync.mockResolvedValue({});

    renderWithRouter(<ResendOTP phone={testPhone} duration={testDuration} />);

    const resendButton = screen.getByRole("button", { name: /resend code/i });

    // Click resend button
    await user.click(resendButton);

    // Verify phoneLoginAsync was called with correct phone
    await waitFor(() => {
      expect(mockPhoneLoginAsync).toHaveBeenCalledWith({ phone: testPhone });
    });

    // Verify countdown start was called
    await waitFor(() => {
      expect(mockStart).toHaveBeenCalled();
    });
  });

  it("should handle resend error gracefully", async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Set countdown to finished state
    mockCountdownState = {
      start: mockStart,
      isStarted: false,
      timeLeft: 0,
      isReady: true,
      clear: mockClear,
    };

    const testError = new Error("Network error");
    mockPhoneLoginAsync.mockRejectedValue(testError);

    renderWithRouter(<ResendOTP phone={testPhone} duration={testDuration} />);

    const resendButton = screen.getByRole("button", { name: /resend code/i });

    // Click resend button
    await user.click(resendButton);

    // Verify error was logged
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(testError);
    });

    // Verify countdown start was not called on error
    expect(mockStart).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it("should disable resend button when request is pending", () => {
    // Set countdown to finished state
    mockCountdownState = {
      start: mockStart,
      isStarted: false,
      timeLeft: 0,
      isReady: true,
      clear: mockClear,
    };

    vi.mocked(usePhoneLogin).mockReturnValue({
      phoneLogin: vi.fn(),
      phoneLoginAsync: mockPhoneLoginAsync,
      isPending: true,
      errorMessage: undefined,
    });

    renderWithRouter(<ResendOTP phone={testPhone} duration={testDuration} />);

    const resendButton = screen.getByRole("button", { name: /resend code/i });
    expect(resendButton).toBeDisabled();
  });

  it("should update countdown time display", () => {
    // Set countdown to 5 seconds
    mockCountdownState = {
      start: mockStart,
      isStarted: true,
      timeLeft: 5,
      isReady: false,
      clear: mockClear,
    };

    renderWithRouter(<ResendOTP phone={testPhone} duration={testDuration} />);

    // Verify countdown shows 5 seconds
    expect(screen.getByText(/resend code: 5 sec/i)).toBeInTheDocument();
  });
});
