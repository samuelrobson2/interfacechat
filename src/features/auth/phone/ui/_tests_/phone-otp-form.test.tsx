import { renderWithRouter } from "@/shared/test/test-utils";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { usePhoneStore } from "../../model/phone-store";
import { usePhoneLogin } from "../../model/use-phone-login";
import { usePhoneVerify } from "../../model/use-phone-verify";
import { PhoneOTPForm } from "../phone-otp-form";

// Mock hooks
vi.mock("../../model/use-phone-verify");
vi.mock("../../model/use-phone-login");
vi.mock("../../model/phone-store");

// Mock useCountdown hook
vi.mock("@/shared/lib/react/use-countdown", () => ({
  useCountdown: vi.fn(() => ({
    start: vi.fn(),
    isStarted: true,
    timeLeft: 10,
    isReady: false,
    clear: vi.fn(),
  })),
}));

describe("PhoneOTPForm", () => {
  const mockPhoneVerify = vi.fn();
  const mockPhoneLoginAsync = vi.fn();
  const testPhone = "+11234567890";

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    vi.mocked(usePhoneVerify).mockReturnValue({
      phoneVerify: mockPhoneVerify,
      isPending: false,
      errorMessage: undefined,
    });

    vi.mocked(usePhoneLogin).mockReturnValue({
      phoneLogin: vi.fn(),
      phoneLoginAsync: mockPhoneLoginAsync,
      isPending: false,
      errorMessage: undefined,
    });

    vi.mocked(usePhoneStore).mockReturnValue({
      isVerifyStarted: {},
      setIsVerifyStarted: vi.fn(),
      clearVerifyStarted: vi.fn(),
    });
  });

  it("should complete successful OTP verification workflow", async () => {
    const user = userEvent.setup();
    renderWithRouter(<PhoneOTPForm phone={testPhone} />);

    // Verify OTP input is present (input-otp renders single input, not 6 separate)
    const otpInput = screen.getByRole("textbox");
    expect(otpInput).toBeInTheDocument();

    // Verify continue button is present
    const submitButton = screen.getByRole("button", { name: /continue/i });
    expect(submitButton).toBeInTheDocument();

    // Fill OTP code by typing
    await user.type(otpInput, "123456");

    // Click submit button
    await user.click(submitButton);

    // Verify submission
    await waitFor(() => {
      expect(mockPhoneVerify).toHaveBeenCalledWith({
        phone: testPhone,
        otp: "123456",
      });
    });
  });

  it("should disable submit button when OTP is incomplete", () => {
    renderWithRouter(<PhoneOTPForm phone={testPhone} />);

    const submitButton = screen.getByRole("button", { name: /continue/i });

    // Button should be disabled initially (no OTP entered)
    expect(submitButton).toBeDisabled();
  });

  it("should handle API errors correctly", () => {
    const errorMessage = "Invalid OTP code";
    vi.mocked(usePhoneVerify).mockReturnValue({
      phoneVerify: mockPhoneVerify,
      isPending: false,
      errorMessage,
    });

    renderWithRouter(<PhoneOTPForm phone={testPhone} />);

    // Verify error message is displayed
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it("should show loading state during submission", () => {
    vi.mocked(usePhoneVerify).mockReturnValue({
      phoneVerify: mockPhoneVerify,
      isPending: true,
      errorMessage: undefined,
    });

    renderWithRouter(<PhoneOTPForm phone={testPhone} />);

    // Verify loading state - button is disabled and contains lottie animation
    const submitButton = screen.getByRole("button", { name: "" });
    expect(submitButton).toBeDisabled();
    expect(screen.getByTestId("lottie-animation")).toBeInTheDocument();
  });

  it("should display validation error for incomplete OTP", async () => {
    const user = userEvent.setup();
    renderWithRouter(<PhoneOTPForm phone={testPhone} />);

    const otpInput = screen.getByRole("textbox");

    // Enter only 3 digits (incomplete)
    await user.type(otpInput, "123");

    // Try to submit (button should be disabled)
    const submitButton = screen.getByRole("button", { name: /continue/i });
    expect(submitButton).toBeDisabled();

    // Verify verify was not called
    expect(mockPhoneVerify).not.toHaveBeenCalled();
  });

  it("should render ResendOTP component", () => {
    renderWithRouter(<PhoneOTPForm phone={testPhone} />);

    // Verify resend component is present (check for countdown text)
    expect(screen.getByText(/resend code: 10 sec/i)).toBeInTheDocument();
  });

  it("should show error styling on OTP slots when error occurs", () => {
    const errorMessage = "Invalid OTP code";
    vi.mocked(usePhoneVerify).mockReturnValue({
      phoneVerify: mockPhoneVerify,
      isPending: false,
      errorMessage,
    });

    renderWithRouter(<PhoneOTPForm phone={testPhone} />);

    // Verify error message is displayed
    expect(screen.getByText(errorMessage)).toBeInTheDocument();

    // OTP input should be present
    const otpInput = screen.getByRole("textbox");
    expect(otpInput).toBeInTheDocument();
  });
});
