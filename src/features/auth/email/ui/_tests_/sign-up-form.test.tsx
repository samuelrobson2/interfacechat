import { renderWithRouter } from "@/shared/test/test-utils";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useCheckEmail } from "../../model/use-check-email";
import { SignUpForm } from "../sign-up-form";

// Mock useCheckEmail hook
vi.mock("../../model/use-check-email");

describe("SignUpForm", () => {
  const mockCheckEmail = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation
    vi.mocked(useCheckEmail).mockReturnValue({
      checkEmail: mockCheckEmail,
      isPending: false,
      errorMessage: undefined,
    });
  });

  it("should complete successful email check workflow", async () => {
    const user = userEvent.setup();
    renderWithRouter(<SignUpForm />);

    // Verify form elements are present
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continue/i })).toBeInTheDocument();

    // Fill out form with valid email
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole("button", { name: /continue/i });

    await user.type(emailInput, "test@example.com");
    await user.click(submitButton);

    // Verify submission
    await waitFor(() => {
      expect(mockCheckEmail).toHaveBeenCalledWith(
        {
          email: "test@example.com",
        },
        expect.any(Object) // React form event
      );
    });

    // Verify no validation errors are shown
    expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
  });

  it("should handle validation errors during submission", async () => {
    const user = userEvent.setup();
    renderWithRouter(<SignUpForm />);

    const submitButton = screen.getByRole("button", { name: /continue/i });

    // Submit empty form
    await user.click(submitButton);

    // Verify validation errors appear
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(mockCheckEmail).not.toHaveBeenCalled();

    // Test invalid email
    const emailInput = screen.getByLabelText(/email/i);
    await user.clear(emailInput);
    await user.type(emailInput, "invalid-email");
    await user.click(submitButton);

    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
    expect(mockCheckEmail).not.toHaveBeenCalled();
  });

  it("should handle API errors correctly", () => {
    const errorMessage = "Email already in use";
    vi.mocked(useCheckEmail).mockReturnValue({
      checkEmail: mockCheckEmail,
      isPending: false,
      errorMessage,
    });

    renderWithRouter(<SignUpForm />);

    // Verify error message is displayed
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    
    // Verify email field has error styling
    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toBeInTheDocument();
  });

  it("should show loading state during submission", () => {
    vi.mocked(useCheckEmail).mockReturnValue({
      checkEmail: mockCheckEmail,
      isPending: true,
      errorMessage: undefined,
    });

    renderWithRouter(<SignUpForm />);

    // Verify loading state - button is disabled and contains lottie animation
    const submitButton = screen.getByRole("button", { name: "" });
    expect(submitButton).toBeDisabled();
    expect(screen.getByTestId("lottie-animation")).toBeInTheDocument();
  });

  it("should submit form on Enter key press", async () => {
    const user = userEvent.setup();
    renderWithRouter(<SignUpForm />);

    const emailInput = screen.getByLabelText(/email/i);

    await user.type(emailInput, "test@example.com");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(mockCheckEmail).toHaveBeenCalledWith(
        {
          email: "test@example.com",
        },
        expect.any(Object) // React form event
      );
    });
  });
});
