import { renderHook, act } from '@testing-library/react'
import { useCreateNewPassword } from '../use-create-new-password'
import { publicRqClient } from '@/shared/api/instance'
import { ROUTES } from '@/shared/model/routes'
import { useNavigate } from 'react-router-dom'

// Mock dependencies
vi.mock('@/shared/api/instance')
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}))

describe('useCreateNewPassword', () => {
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
  })

  it('should return initial state and call mutation correctly', () => {
    // Arrange
    const { result } = renderHook(() => useCreateNewPassword())
    const passwordData = { password: 'NewPassword123!' }
    const verificationToken = 'test-token-123'

    // Assert initial state
    expect(result.current.createNewPassword).toBeInstanceOf(Function)
    expect(result.current.isPending).toBe(false)
    expect(result.current.isError).toBe(false)
    expect(result.current.errorMessage).toBeUndefined()

    // Act - call createNewPassword
    act(() => {
      result.current.createNewPassword(passwordData, verificationToken)
    })

    // Assert mutation was called with correct params
    expect(mockMutate).toHaveBeenCalledWith({
      params: {
        query: {
          token: verificationToken,
        },
      },
      body: passwordData,
    })
    expect(publicRqClient.useMutation).toHaveBeenCalledWith(
      'post',
      '/auth/reset-password',
      expect.any(Object)
    )
  })

  it('should handle loading state', () => {
    // Arrange
    vi.mocked(publicRqClient.useMutation).mockReturnValue(
      createMockMutation({ isPending: true })
    )

    // Act
    const { result } = renderHook(() => useCreateNewPassword())

    // Assert
    expect(result.current.isPending).toBe(true)
  })

  it('should handle error state', () => {
    // Arrange
    const errorMessage = 'Invalid token'
    vi.mocked(publicRqClient.useMutation).mockReturnValue(
      createMockMutation({
        isError: true,
        error: { message: errorMessage },
      })
    )

    // Act
    const { result } = renderHook(() => useCreateNewPassword())

    // Assert
    expect(result.current.isError).toBe(true)
    expect(result.current.errorMessage).toBe(errorMessage)
  })

  it('should navigate to success page on successful password reset', () => {
    // Arrange
    const mockOnSuccess = vi.fn()

    vi.mocked(publicRqClient.useMutation).mockImplementation(
      (_method, _url, options) => {
        if (options?.onSuccess) {
          mockOnSuccess.mockImplementation(options.onSuccess)
        }
        return createMockMutation()
      }
    )

    renderHook(() => useCreateNewPassword())

    // Act - simulate successful password reset
    act(() => {
      mockOnSuccess()
    })

    // Assert - navigation to success page
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.CREATE_NEW_PASSWORD_SUCCESS)
  })

  it('should navigate to error page on 401 error', () => {
    // Arrange
    const mockOnError = vi.fn()
    const error401 = { statusCode: 401, message: 'Unauthorized' }

    vi.mocked(publicRqClient.useMutation).mockImplementation(
      (_method, _url, options) => {
        if (options?.onError) {
          mockOnError.mockImplementation(options.onError)
        }
        return createMockMutation()
      }
    )

    renderHook(() => useCreateNewPassword())

    // Act - simulate 401 error
    act(() => {
      mockOnError(error401)
    })

    // Assert - navigation to error page
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.CREATE_NEW_PASSWORD_ERROR)
  })

  it('should not navigate to error page on non-401 errors', () => {
    // Arrange
    const mockOnError = vi.fn()
    const error500 = { statusCode: 500, message: 'Server error' }

    vi.mocked(publicRqClient.useMutation).mockImplementation(
      (_method, _url, options) => {
        if (options?.onError) {
          mockOnError.mockImplementation(options.onError)
        }
        return createMockMutation()
      }
    )

    renderHook(() => useCreateNewPassword())

    // Act - simulate non-401 error
    act(() => {
      mockOnError(error500)
    })

    // Assert - no navigation to error page
    expect(mockNavigate).not.toHaveBeenCalledWith(ROUTES.CREATE_NEW_PASSWORD_ERROR)
  })

  it('should handle multiple password reset attempts', () => {
    // Arrange
    const { result } = renderHook(() => useCreateNewPassword())
    const passwordData1 = { password: 'Password123!' }
    const passwordData2 = { password: 'NewPassword456!' }
    const token1 = 'token-123'
    const token2 = 'token-456'

    // Act - call createNewPassword multiple times
    act(() => {
      result.current.createNewPassword(passwordData1, token1)
    })

    act(() => {
      result.current.createNewPassword(passwordData2, token2)
    })

    // Assert - mutation was called twice with different data
    expect(mockMutate).toHaveBeenCalledTimes(2)
    expect(mockMutate).toHaveBeenNthCalledWith(1, {
      params: { query: { token: token1 } },
      body: passwordData1,
    })
    expect(mockMutate).toHaveBeenNthCalledWith(2, {
      params: { query: { token: token2 } },
      body: passwordData2,
    })
  })
})

