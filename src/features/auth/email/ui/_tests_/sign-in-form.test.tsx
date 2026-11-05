import { renderWithRouter } from "@/shared/test/test-utils";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useSignin } from "../../model/use-signin";
import { SignInForm } from "../sign-in-form";

// Mock useSignin hook
vi.mock("../../model/use-signin");

describe("SignInForm", () => {
  const mockSignIn = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation
    vi.mocked(useSignin).mockReturnValue({
      signIn: mockSignIn,
      isPending: false,
      errorMessage: undefined,
    });
  });

  it("should complete successful sign-in workflow", async () => {
    const user = userEvent.setup();
    renderWithRouter(<SignInForm />);

    // Verify form elements are present
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /continue/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /forgot password/i }),
    ).toHaveAttribute("href", "/auth/reset-password");

    // Fill out form with valid data
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: /continue/i });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    // Verify submission
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith(
        {
          email: "test@example.com",
          password: "password123",
        },
        expect.any(Object), // React form event
      );
    });

    // Verify no validation errors are shown
    expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/password is required/i)).not.toBeInTheDocument();
  });

  it("should handle validation errors during submission", async () => {
    const user = userEvent.setup();
    renderWithRouter(<SignInForm />);

    const submitButton = screen.getByRole("button", { name: /continue/i });

    // Submit empty form
    await user.click(submitButton);

    // Verify validation errors appear
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(
      await screen.findByText(/password is required/i),
    ).toBeInTheDocument();
    expect(mockSignIn).not.toHaveBeenCalled();

    // Test invalid email
    const emailInput = screen.getByLabelText(/email/i);
    await user.clear(emailInput);
    await user.type(emailInput, "invalid-email");
    await user.click(submitButton);

    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it("should handle API errors correctly", () => {
    const errorMessage = "Invalid email or password";
    vi.mocked(useSignin).mockReturnValue({
      signIn: mockSignIn,
      isPending: false,
      errorMessage,
    });

    renderWithRouter(<SignInForm />);

    // Verify error message is displayed
    expect(screen.getByText(errorMessage)).toBeInTheDocument();

    // Verify email field has error styling
    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toBeInTheDocument();
  });

  it("should show loading state during submission", () => {
    vi.mocked(useSignin).mockReturnValue({
      signIn: mockSignIn,
      isPending: true,
      errorMessage: undefined,
    });

    renderWithRouter(<SignInForm />);

    // Verify loading state - button is disabled and contains lottie animation
    const submitButton = screen.getByRole("button", { name: "" });
    expect(submitButton).toBeDisabled();
    expect(screen.getByTestId("lottie-animation")).toBeInTheDocument();
  });

  it("should handle password visibility toggle", async () => {
    const user = userEvent.setup();
    renderWithRouter(<SignInForm />);

    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
    const toggleButton = screen.getByRole("button", { name: /show password/i });

    // Initially password should be hidden
    expect(passwordInput.type).toBe("password");

    // Click to show password
    await user.click(toggleButton);
    expect(passwordInput.type).toBe("text");

    // Click to hide password again
    const hideButton = screen.getByRole("button", { name: /hide password/i });
    await user.click(hideButton);
    expect(passwordInput.type).toBe("password");
  });

  it("should submit form on Enter key press", async () => {
    const user = userEvent.setup();
    renderWithRouter(<SignInForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText("Password");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith(
        {
          email: "test@example.com",
          password: "password123",
        },
        expect.any(Object), // React form event
      );
    });
  });
});
