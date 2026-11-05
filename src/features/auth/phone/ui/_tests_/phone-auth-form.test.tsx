import { renderWithRouter } from "@/shared/test/test-utils";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { usePhoneLogin } from "../../model/use-phone-login";
import { PhoneAuthForm } from "../phone-auth-form";

// Mock usePhoneLogin hook
vi.mock("../../model/use-phone-login");

describe("PhoneAuthForm", () => {
  const mockPhoneLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation
    vi.mocked(usePhoneLogin).mockReturnValue({
      phoneLogin: mockPhoneLogin,
      phoneLoginAsync: vi.fn(),
      isPending: false,
      errorMessage: undefined,
    });
  });

  it("should complete successful phone auth workflow", async () => {
    const user = userEvent.setup();
    renderWithRouter(<PhoneAuthForm />);

    const phoneInput = screen.getByRole("textbox", { name: /phone number/i });
    const countryCodeInput = screen.getByRole("textbox", { name: /country code/i });
    const submitButton = screen.getByRole("button", { name: /continue/i });

    // Verify form elements are present
    expect(countryCodeInput).toBeInTheDocument();
    expect(phoneInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();

    // Fill out form with valid data
    await user.type(phoneInput, "1234567890");
    
    // Open combobox and select different country (UK)
    await user.click(countryCodeInput);
    const ukOption = await screen.findByText(/United Kingdom/i);
    await user.click(ukOption);
  
    await user.click(submitButton);

    // Verify submission with UK country code (+44)
    await waitFor(() => {
      expect(mockPhoneLogin).toHaveBeenCalledWith({
        phone: "+441234567890",
      });
    });

    // Verify no validation errors are shown
    expect(screen.queryByText(/phone is required/i)).not.toBeInTheDocument();
  });

  it("should handle validation errors during submission", async () => {
    const user = userEvent.setup();
    renderWithRouter(<PhoneAuthForm />);

    const submitButton = screen.getByRole("button", { name: /continue/i });

    // Submit empty form
    await user.click(submitButton);

    // Verify validation errors appear
    expect(await screen.findByText(/phone is required/i)).toBeInTheDocument();
    expect(mockPhoneLogin).not.toHaveBeenCalled();
  });

  it("should handle API errors correctly", () => {
    const errorMessage = "Invalid phone number";
    vi.mocked(usePhoneLogin).mockReturnValue({
      phoneLogin: mockPhoneLogin,
      phoneLoginAsync: vi.fn(),
      isPending: false,
      errorMessage,
    });

    renderWithRouter(<PhoneAuthForm />);

    // Verify error message is displayed
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it("should show loading state during submission", () => {
    vi.mocked(usePhoneLogin).mockReturnValue({
      phoneLogin: mockPhoneLogin,
      phoneLoginAsync: vi.fn(),
      isPending: true,
      errorMessage: undefined,
    });

    renderWithRouter(<PhoneAuthForm />);

    // Verify loading state - lottie animation is present
    const lottieAnimation = screen.getByTestId("lottie-animation");
    expect(lottieAnimation).toBeInTheDocument();
    
    // Get submit button (filter by type="submit")
    const buttons = screen.getAllByRole("button", { name: "" });
    const submitButton = buttons.find(btn => btn.getAttribute('type') === 'submit') as HTMLButtonElement;
    expect(submitButton).toBeDisabled();
  });

  it("should use default country code when no selection made", async () => {
    const user = userEvent.setup();
    renderWithRouter(<PhoneAuthForm />);

    const phoneInput = screen.getByRole("textbox", { name: /phone number/i });
    const submitButton = screen.getByRole("button", { name: /continue/i });

    // Fill phone number without changing country code
    await user.type(phoneInput, "9876543210");
    await user.click(submitButton);

    // Verify submission with default country code (+1)
    await waitFor(() => {
      expect(mockPhoneLogin).toHaveBeenCalledWith({
        phone: "+19876543210",
      });
    });
  });
});

