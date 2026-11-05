import { renderWithRouter } from '@/shared/test/test-utils'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useResetPassword } from '../../model/use-reset-password'
import { ResetPasswordForm } from '../reset-password-form'

// Mock useResetPassword hook
vi.mock('../../model/use-reset-password')

describe('ResetPasswordForm', () => {
  const mockResetPassword = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    // Default mock implementation
    vi.mocked(useResetPassword).mockReturnValue({
      resetPassword: mockResetPassword,
      isPending: false,
      isError: false,
      errorMessage: undefined,
    })
  })

  it('should complete successful password reset request workflow', async () => {
    // Arrange
    const user = userEvent.setup()
    renderWithRouter(<ResetPasswordForm />)

    const emailInput = screen.getByRole('textbox', { name: /email/i })
    const submitButton = screen.getByRole('button', { name: /continue/i })

    // Assert form elements are present
    expect(emailInput).toBeInTheDocument()
    expect(submitButton).toBeInTheDocument()

    // Act - fill out form with valid email
    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)

    // Assert - form submission with correct data (first argument only)
    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith(
        { email: 'test@example.com' },
        expect.any(Object) // React form event
      )
    })

    // Assert - no validation errors are shown
    expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/invalid email/i)).not.toBeInTheDocument()
  })

  it('should handle validation errors during submission', async () => {
    // Arrange
    const user = userEvent.setup()
    renderWithRouter(<ResetPasswordForm />)

    const emailInput = screen.getByRole('textbox', { name: /email/i })
    const submitButton = screen.getByRole('button', { name: /continue/i })

    // Act - submit empty form
    await user.click(submitButton)

    // Assert - validation error appears
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument()
    expect(mockResetPassword).not.toHaveBeenCalled()

    // Act - enter invalid email format
    await user.type(emailInput, 'invalid-email')
    await user.click(submitButton)

    // Assert - invalid email error appears
    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument()
    expect(mockResetPassword).not.toHaveBeenCalled()
  })

  it('should handle API errors correctly', () => {
    // Arrange
    const errorMessage = 'User not found'
    vi.mocked(useResetPassword).mockReturnValue({
      resetPassword: mockResetPassword,
      isPending: false,
      isError: true,
      errorMessage,
    })

    // Act
    renderWithRouter(<ResetPasswordForm />)

    // Assert - error message is displayed
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  it('should show loading state during submission', () => {
    // Arrange
    vi.mocked(useResetPassword).mockReturnValue({
      resetPassword: mockResetPassword,
      isPending: true,
      isError: false,
      errorMessage: undefined,
    })

    // Act
    renderWithRouter(<ResetPasswordForm />)

    // Assert - loading state is shown
    const submitButton = screen.getByRole('button')
    expect(submitButton).toBeDisabled()
    expect(screen.getByTestId('lottie-animation')).toBeInTheDocument()
  })

  it('should prevent multiple submissions during loading', async () => {
    // Arrange
    const user = userEvent.setup()
    vi.mocked(useResetPassword).mockReturnValue({
      resetPassword: mockResetPassword,
      isPending: true,
      isError: false,
      errorMessage: undefined,
    })

    renderWithRouter(<ResetPasswordForm />)

    const emailInput = screen.getByRole('textbox', { name: /email/i })
    const submitButton = screen.getByRole('button')

    // Act - try to fill and submit while loading
    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)

    // Assert - button is disabled, no submission occurs
    expect(submitButton).toBeDisabled()
    expect(mockResetPassword).not.toHaveBeenCalled()
  })
})
