import { renderWithRouter } from '@/shared/test/test-utils'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PasswordForm } from '../password-form'
import { PASSWORD_REQUIREMENTS } from '@/services/auth'

describe('PasswordForm', () => {
  const mockOnSubmit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should complete successful password creation workflow', async () => {
    // Arrange
    const user = userEvent.setup()
    renderWithRouter(
      <PasswordForm isPending={false} errorMessage={undefined} onSubmit={mockOnSubmit} />
    )

    const passwordInput = screen.getByLabelText("Password")
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })

    // Assert form elements are present
    expect(passwordInput).toBeInTheDocument()
    expect(confirmPasswordInput).toBeInTheDocument()
    expect(submitButton).toBeInTheDocument()

    // Act - fill form with valid password
    const validPassword = 'TestPassword123!'
    await user.type(passwordInput, validPassword)
    await user.type(confirmPasswordInput, validPassword)
    await user.tab()

    // Assert - submit button is enabled
    await waitFor(() => {
      expect(submitButton).toBeEnabled()
    })

    // Act - submit form
    await user.click(submitButton)

    // Assert - form submission with correct data
    // Note: handleSubmit from react-hook-form passes both data and event
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          password: validPassword,
          confirmPassword: validPassword,
        }),
        expect.anything() // event object
      )
    })
  })

  it('should update password requirements indicator on input', async () => {
    // Arrange
    const user = userEvent.setup()
    renderWithRouter(
      <PasswordForm isPending={false} errorMessage={undefined} onSubmit={mockOnSubmit} />
    )

    const passwordInput = screen.getByLabelText(/^password$/i)

    // Helper function to check if requirement is met (has CheckIcon svg path with specific d attribute)
    const isRequirementMet = (text: string) => {
      const element = screen.getByText(text)
      const parentElement = element.closest('p') // Text component renders as <p>
      if (!parentElement) return false
      
      // Check if there's an svg with the CheckIcon path (not DotIcon)
      const svg = parentElement.querySelector('svg')
      if (!svg) return false
      
      const path = svg.querySelector('path')
      if (!path) return false
      
      // CheckIcon has a specific path, DotIcon has different one
      // We check for stroke attribute which CheckIcon has but DotIcon doesn't
      return path.classList.contains('stroke-icon-primary')
    }

    // Assert - initially all requirements are shown as not met
    expect(isRequirementMet(PASSWORD_REQUIREMENTS.min_length)).toBe(false)
    expect(isRequirementMet(PASSWORD_REQUIREMENTS.uppercase)).toBe(false)
    expect(isRequirementMet(PASSWORD_REQUIREMENTS.lowercase)).toBe(false)
    expect(isRequirementMet(PASSWORD_REQUIREMENTS.number)).toBe(false)
    expect(isRequirementMet(PASSWORD_REQUIREMENTS.special)).toBe(false)

    // Step 1: Type 8+ lowercase characters - should meet length and lowercase requirements
    await user.type(passwordInput, 'testpass')
    
    await waitFor(() => {
      expect(isRequirementMet(PASSWORD_REQUIREMENTS.min_length)).toBe(true)
      expect(isRequirementMet(PASSWORD_REQUIREMENTS.lowercase)).toBe(true)
      expect(isRequirementMet(PASSWORD_REQUIREMENTS.uppercase)).toBe(false)
      expect(isRequirementMet(PASSWORD_REQUIREMENTS.number)).toBe(false)
      expect(isRequirementMet(PASSWORD_REQUIREMENTS.special)).toBe(false)
    })

    // Step 2: Add uppercase letter - should meet uppercase requirement
    await user.type(passwordInput, 'T')
    
    await waitFor(() => {
      expect(isRequirementMet(PASSWORD_REQUIREMENTS.min_length)).toBe(true)
      expect(isRequirementMet(PASSWORD_REQUIREMENTS.lowercase)).toBe(true)
      expect(isRequirementMet(PASSWORD_REQUIREMENTS.uppercase)).toBe(true)
      expect(isRequirementMet(PASSWORD_REQUIREMENTS.number)).toBe(false)
      expect(isRequirementMet(PASSWORD_REQUIREMENTS.special)).toBe(false)
    })

    // Step 3: Add number - should meet number requirement
    await user.type(passwordInput, '123')
    
    await waitFor(() => {
      expect(isRequirementMet(PASSWORD_REQUIREMENTS.min_length)).toBe(true)
      expect(isRequirementMet(PASSWORD_REQUIREMENTS.lowercase)).toBe(true)
      expect(isRequirementMet(PASSWORD_REQUIREMENTS.uppercase)).toBe(true)
      expect(isRequirementMet(PASSWORD_REQUIREMENTS.number)).toBe(true)
      expect(isRequirementMet(PASSWORD_REQUIREMENTS.special)).toBe(false)
    })

    // Step 4: Add special character - all requirements should be met
    await user.type(passwordInput, '!')
    
    await waitFor(() => {
      expect(isRequirementMet(PASSWORD_REQUIREMENTS.min_length)).toBe(true)
      expect(isRequirementMet(PASSWORD_REQUIREMENTS.lowercase)).toBe(true)
      expect(isRequirementMet(PASSWORD_REQUIREMENTS.uppercase)).toBe(true)
      expect(isRequirementMet(PASSWORD_REQUIREMENTS.number)).toBe(true)
      expect(isRequirementMet(PASSWORD_REQUIREMENTS.special)).toBe(true)
    })
  })

  it('should handle password mismatch validation error', async () => {
    // Arrange
    const user = userEvent.setup()
    renderWithRouter(
      <PasswordForm isPending={false} errorMessage={undefined} onSubmit={mockOnSubmit} />
    )

    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })

    // Act - fill with different passwords
    const password = 'TestPassword123!'
    const differentPassword = 'TestPassword456!'
    await user.type(passwordInput, password)
    await user.type(confirmPasswordInput, differentPassword)

    // Assert - submit button remains disabled
    expect(submitButton).toBeDisabled()

    // Act - submit form
    await user.click(submitButton)

    // Assert - no submission occurs
    expect(mockOnSubmit).not.toHaveBeenCalled()

    // Assert - confirmation password error is shown
    expect(await screen.findByText(/passwords don't match/i)).toBeInTheDocument()
  })

  it('should show loading state during submission', () => {
    // Arrange
    renderWithRouter(
      <PasswordForm isPending={true} errorMessage={undefined} onSubmit={mockOnSubmit} />
    )

    // Assert - loading state is shown
    // Note: When loading, button text is replaced with Lottie animation, so we find by type
    const submitButton = screen.getByRole('button', { name: '' })
    expect(submitButton).toBeDisabled()
    expect(submitButton).toHaveAttribute('type', 'submit')

    // Assert - loading indicator is present (lottie animation)
    expect(screen.getByTestId('lottie-animation')).toBeInTheDocument()
  })

  it('should handle API error correctly', async () => {
    // Arrange
    const errorMessage = 'Email already in use'
    renderWithRouter(
      <PasswordForm isPending={false} errorMessage={errorMessage} onSubmit={mockOnSubmit} />
    )

    // Assert - error message is displayed
    expect(screen.getByText(errorMessage)).toBeInTheDocument()

    // Assert - confirm password input shows error state (error is passed to confirmPassword field)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i) as HTMLInputElement
    expect(confirmPasswordInput.getAttribute('aria-invalid')).toBe('true')
  })
})

