import { renderHook, act } from '@testing-library/react'
import { useResetPassword } from '../use-reset-password'
import { publicRqClient } from '@/shared/api/instance'
import { ROUTES } from '@/shared/model/routes'
import { useNavigate, href } from 'react-router-dom'

// Mock dependencies
vi.mock('@/shared/api/instance')
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
  href: vi.fn((route: string) => route),
}))

describe('useResetPassword', () => {
  const mockNavigate = vi.fn()
  const mockMutate = vi.fn()

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
  })

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useNavigate).mockReturnValue(mockNavigate)
    vi.mocked(publicRqClient.useMutation).mockReturnValue(createMockMutation())
    vi.mocked(href).mockImplementation((...args) => args[0] as string)
  })

  it('should return initial state and call mutation correctly', () => {
    // Arrange
    const { result } = renderHook(() => useResetPassword())
    const resetData = { email: 'test@example.com' }

    // Assert initial state
    expect(result.current.resetPassword).toBeInstanceOf(Function)
    expect(result.current.isPending).toBe(false)
    expect(result.current.isError).toBe(false)
    expect(result.current.errorMessage).toBeUndefined()

    // Act - call resetPassword
    act(() => {
      result.current.resetPassword(resetData)
    })

    // Assert mutation was called
    expect(mockMutate).toHaveBeenCalledWith({
      body: resetData,
    })
    expect(publicRqClient.useMutation).toHaveBeenCalledWith(
      'post',
      '/auth/reset-password-request',
      expect.any(Object)
    )
  })

  it('should handle loading state', () => {
    // Arrange
    vi.mocked(publicRqClient.useMutation).mockReturnValue(
      createMockMutation({ isPending: true })
    )

    // Act
    const { result } = renderHook(() => useResetPassword())

    // Assert
    expect(result.current.isPending).toBe(true)
  })

  it('should handle error state', () => {
    // Arrange
    const errorMessage = 'Network error'
    vi.mocked(publicRqClient.useMutation).mockReturnValue(
      createMockMutation({
        isError: true,
        error: { message: errorMessage },
      })
    )

    // Act
    const { result } = renderHook(() => useResetPassword())

    // Assert
    expect(result.current.isError).toBe(true)
    expect(result.current.errorMessage).toBe(errorMessage)
  })

  it('should navigate to check email page with email query param on success', () => {
    // Arrange
    const mockOnSuccess = vi.fn()
    const resetData = { email: 'test@example.com' }

    vi.mocked(publicRqClient.useMutation).mockImplementation(
      (_method, _url, options) => {
        if (options?.onSuccess) {
          mockOnSuccess.mockImplementation(options.onSuccess)
        }
        return createMockMutation()
      }
    )

    renderHook(() => useResetPassword())

    // Act - simulate successful reset password request
    act(() => {
      mockOnSuccess(undefined, { body: resetData })
    })

    // Assert - navigation was called with correct params
    const expectedUrl = `${ROUTES.RESET_PASSWORD_CHECK_EMAIL}?email=${encodeURIComponent(resetData.email)}`
    expect(mockNavigate).toHaveBeenCalledWith(expectedUrl)
  })

  it('should handle multiple reset password requests', () => {
    // Arrange
    const { result } = renderHook(() => useResetPassword())
    const firstEmail = { email: 'first@example.com' }
    const secondEmail = { email: 'second@example.com' }

    // Act - call resetPassword multiple times
    act(() => {
      result.current.resetPassword(firstEmail)
    })

    act(() => {
      result.current.resetPassword(secondEmail)
    })

    // Assert - mutation was called twice with different data
    expect(mockMutate).toHaveBeenCalledTimes(2)
    expect(mockMutate).toHaveBeenNthCalledWith(1, { body: firstEmail })
    expect(mockMutate).toHaveBeenNthCalledWith(2, { body: secondEmail })
  })
})

