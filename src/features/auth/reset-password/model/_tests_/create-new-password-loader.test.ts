import { redirect } from 'react-router-dom'
import { ROUTES } from '@/shared/model/routes'
import { createNewPasswordLoader } from '../create-new-password-loader'

// Mock redirect function
vi.mock('react-router-dom', () => ({
  redirect: vi.fn(),
}))

describe('createNewPasswordLoader', () => {
  const mockRedirect = vi.mocked(redirect)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return verification token when token is provided in query params', async () => {
    // Arrange
    const validToken = 'valid-token-123'
    const request = new Request(
      `http://localhost:3000/create-new-password?token=${validToken}`
    )

    // Act
    const result = await createNewPasswordLoader({ request })

    // Assert
    expect(result).toBe(validToken)
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('should redirect to reset password when token is missing', async () => {
    // Arrange
    const request = new Request('http://localhost:3000/create-new-password')

    // Act & Assert
    await expect(createNewPasswordLoader({ request })).rejects.toThrow()
    expect(mockRedirect).toHaveBeenCalledWith(ROUTES.RESET_PASSWORD)
  })

  it('should redirect to reset password when token is empty string', async () => {
    // Arrange
    const request = new Request('http://localhost:3000/create-new-password?token=')

    // Act & Assert
    await expect(createNewPasswordLoader({ request })).rejects.toThrow()
    expect(mockRedirect).toHaveBeenCalledWith(ROUTES.RESET_PASSWORD)
  })

  it('should handle token with URL-encoded characters', async () => {
    // Arrange
    const encodedToken = 'token%20with%20spaces'
    const decodedToken = 'token with spaces'
    const request = new Request(
      `http://localhost:3000/create-new-password?token=${encodedToken}`
    )

    // Act
    const result = await createNewPasswordLoader({ request })

    // Assert
    expect(result).toBe(decodedToken)
    expect(mockRedirect).not.toHaveBeenCalled()
  })
})
