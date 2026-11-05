import { redirect } from 'react-router-dom'
import { ROUTES } from '@/shared/model/routes'
import { phoneOTPLoader } from '../phone-otp-loader'

// Mock redirect function
vi.mock('react-router-dom', () => ({
  redirect: vi.fn(),
}))

describe('phoneOTPLoader', () => {
  const mockRedirect = vi.mocked(redirect)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return phone when valid phone number is provided in query params', async () => {
    // Arrange
    const validPhone = '+1234567890'
    const request = new Request(`http://localhost:3000/phone-otp?phone=${encodeURIComponent(validPhone)}`)

    // Act
    const result = await phoneOTPLoader({ request })

    // Assert
    expect(result).toBe(validPhone)
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('should redirect to phone auth when phone is missing', async () => {
    // Arrange
    const request = new Request('http://localhost:3000/phone-otp')

    // Act & Assert
    await expect(phoneOTPLoader({ request })).rejects.toThrow()
    expect(mockRedirect).toHaveBeenCalledWith(ROUTES.PHONE_AUTH)
  })

  it('should redirect to phone auth when phone is empty string', async () => {
    // Arrange
    const request = new Request('http://localhost:3000/phone-otp?phone=')

    // Act & Assert
    await expect(phoneOTPLoader({ request })).rejects.toThrow()
    expect(mockRedirect).toHaveBeenCalledWith(ROUTES.PHONE_AUTH)
  })

  it('should redirect to phone auth when phone format is invalid', async () => {
    // Arrange
    const invalidPhone = 'not-a-phone'
    const request = new Request(`http://localhost:3000/phone-otp?phone=${encodeURIComponent(invalidPhone)}`)

    // Act & Assert
    await expect(phoneOTPLoader({ request })).rejects.toThrow()
    expect(mockRedirect).toHaveBeenCalledWith(ROUTES.PHONE_AUTH)
  })
})

