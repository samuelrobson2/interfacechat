import { redirect } from 'react-router-dom'
import { ROUTES } from '@/shared/model/routes'
import { signUpPasswordLoader } from '../signup-password-loader'

// Mock redirect function
vi.mock('react-router-dom', () => ({
  redirect: vi.fn(),
}))

describe('signUpPasswordLoader', () => {
  const mockRedirect = vi.mocked(redirect)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return email when valid email is provided in query params', async () => {
    // Arrange
    const validEmail = 'test@example.com'
    const request = new Request(`http://localhost:3000/signup-password?email=${validEmail}`)

    // Act
    const result = await signUpPasswordLoader({ request })

    // Assert
    expect(result).toBe(validEmail)
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('should redirect to signin when email is missing', async () => {
    // Arrange
    const request = new Request('http://localhost:3000/signup-password')

    // Act & Assert
    await expect(signUpPasswordLoader({ request })).rejects.toThrow()
    expect(mockRedirect).toHaveBeenCalledWith(ROUTES.SIGNIN)
  })

  it('should redirect to signin when email is empty string', async () => {
    // Arrange
    const request = new Request('http://localhost:3000/signup-password?email=')

    // Act & Assert
    await expect(signUpPasswordLoader({ request })).rejects.toThrow()
    expect(mockRedirect).toHaveBeenCalledWith(ROUTES.SIGNIN)
  })

  it('should redirect to signin when email format is invalid', async () => {
    // Arrange
    const invalidEmail = 'invalid-email-format'
    const request = new Request(`http://localhost:3000/signup-password?email=${invalidEmail}`)

    // Act & Assert
    await expect(signUpPasswordLoader({ request })).rejects.toThrow()
    expect(mockRedirect).toHaveBeenCalledWith(ROUTES.SIGNIN)
  })
})
