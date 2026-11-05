import { renderWithRouter } from '@/shared/test/test-utils'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SetupUserNameForm } from '../ui/setup-user-name-form'

describe('SetupProfileForm', () => {
  const mockOnSubmit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should complete successful profile setup workflow', async () => {
    // Arrange
    const user = userEvent.setup()
    renderWithRouter(<SetupUserNameForm onSubmit={mockOnSubmit} />)

    const nameInput = screen.getByRole('textbox', { name: /your name/i })
    const submitButton = screen.getByRole('button', { name: /continue/i })

    // Assert form elements are present
    expect(nameInput).toBeInTheDocument()
    expect(submitButton).toBeInTheDocument()

    // Act - fill out form with valid name
    await user.type(nameInput, 'John Doe')
    await user.click(submitButton)

    // Assert - form submission with correct data
    // Note: handleSubmit from react-hook-form passes both data and event
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'John Doe' }),
        expect.anything() // event object
      )
    })

    // Assert - no validation errors are shown
    expect(screen.queryByText(/name is required/i)).not.toBeInTheDocument()
  })

  it('should handle validation errors during submission', async () => {
    // Arrange
    const user = userEvent.setup()
    renderWithRouter(<SetupUserNameForm onSubmit={mockOnSubmit} />)

    const nameInput = screen.getByRole('textbox', { name: /your name/i })
    const submitButton = screen.getByRole('button', { name: /continue/i })

    // Act - focus on name input and blur without entering value
    await user.click(nameInput)
    await user.tab()

    // Assert - button should be disabled due to invalid form
    expect(submitButton).toBeDisabled()

    // Act - try to submit empty form
    await user.click(submitButton)

    // Assert - no submission occurs because form is invalid
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('should handle API errors correctly', () => {
    // Arrange
    const errorMessage = 'Profile update failed'

    // Act
    renderWithRouter(<SetupUserNameForm onSubmit={mockOnSubmit} errorMessage={errorMessage} />)

    // Assert - error message is displayed in the name input
    const nameInput = screen.getByRole('textbox', { name: /your name/i })
    expect(nameInput).toBeInTheDocument()
    
    // Error message should be displayed as input error
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  it('should show loading state during submission', () => {
    // Arrange & Act
    renderWithRouter(<SetupUserNameForm onSubmit={mockOnSubmit} isLoading={true} />)

    // Assert - loading state is shown
    const submitButton = screen.getByRole('button')
    expect(submitButton).toBeDisabled()
    
    // Check for loading indicator in button
    expect(screen.getByTestId('lottie-animation')).toBeInTheDocument()
  })

  it('should call onSubmit with form data when submitted', async () => {
    // Arrange
    const user = userEvent.setup()
    renderWithRouter(<SetupUserNameForm onSubmit={mockOnSubmit} />)

    const nameInput = screen.getByRole('textbox', { name: /your name/i })
    const submitButton = screen.getByRole('button', { name: /continue/i })

    // Act - fill form and submit
    await user.type(nameInput, 'John Doe')
    await user.click(submitButton)

    // Assert - onSubmit was called with correct data
    // Note: handleSubmit from react-hook-form passes both data and event
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'John Doe' }),
        expect.anything() // event object
      )
    })
  })
})
