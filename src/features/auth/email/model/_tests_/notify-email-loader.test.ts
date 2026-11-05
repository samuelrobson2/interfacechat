import { redirect } from 'react-router-dom'
import { ROUTES } from '@/shared/model/routes'
import { notifyEmailLoader } from '../notify-email-loader'

// Mock redirect function
vi.mock('react-router-dom', () => ({
  redirect: vi.fn(),
}))

describe('notifyEmailLoader', () => {
  const mockRedirect = vi.mocked(redirect)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return email when valid email is provided in query params', async () => {
    // Arrange
    const validEmail = 'user@example.com'
    const request = new Request(`http://localhost:3000/notify-email?email=${validEmail}`)

    // Act
    const result = await notifyEmailLoader({ request })

    // Assert
    expect(result).toBe(validEmail)
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('should redirect to signup when email is missing', async () => {
    // Arrange
    const request = new Request('http://localhost:3000/notify-email')

    // Act & Assert
    await expect(notifyEmailLoader({ request })).rejects.toThrow()
    expect(mockRedirect).toHaveBeenCalledWith(ROUTES.SIGNIN)
  })

  it('should redirect to signup when email is empty string', async () => {
    // Arrange
    const request = new Request('http://localhost:3000/notify-email?email=')

    // Act & Assert
    await expect(notifyEmailLoader({ request })).rejects.toThrow()
    expect(mockRedirect).toHaveBeenCalledWith(ROUTES.SIGNIN)
  })

  it('should redirect to signup when email format is invalid', async () => {
    // Arrange
    const invalidEmail = 'not-an-email'
    const request = new Request(`http://localhost:3000/notify-email?email=${invalidEmail}`)

    // Act & Assert
    await expect(notifyEmailLoader({ request })).rejects.toThrow()
    expect(mockRedirect).toHaveBeenCalledWith(ROUTES.SIGNIN)
  })

  it('should redirect to signup when email is incomplete', async () => {
    // Arrange
    const incompleteEmail = 'user@domain'
    const request = new Request(`http://localhost:3000/notify-email?email=${incompleteEmail}`)

    // Act & Assert
    await expect(notifyEmailLoader({ request })).rejects.toThrow()
    expect(mockRedirect).toHaveBeenCalledWith(ROUTES.SIGNIN)
  })
})
