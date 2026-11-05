import { describe, it, expect, beforeEach, vi } from 'vitest'
import { googleCallbackLoader } from '../google-callback-loader'
import { useSessionStore } from '@/services/auth'
import { ROUTES } from '@/shared/model/routes'
import { redirect } from 'react-router-dom'
import { redirectAfterLogin } from '../../_model/navigate-after-login'

// Mock dependencies
vi.mock('@/services/auth')
vi.mock('react-router-dom', () => ({
  redirect: vi.fn(),
}))
vi.mock('../../_model/navigate-after-login')

describe('googleCallbackLoader', () => {
  const createMockRequest = (url: string) => ({
    url,
  } as Request)

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    profile: {
      name: 'Test User',
    },
  }

  const mockLogin = vi.fn()
  const mockGetState = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default mock for useSessionStore.getState
    mockGetState.mockReturnValue({
      login: mockLogin,
      logout: vi.fn(),
      updateUser: vi.fn(),
      getToken: vi.fn(),
      refreshToken: vi.fn(),
      user: null,
    })
    
    // Mock useSessionStore with getState method
    vi.mocked(useSessionStore).getState = mockGetState
  })

  it('should redirect to signin when no access token provided', async () => {
    const mockRequest = createMockRequest('https://example.com/callback')

    await expect(
      googleCallbackLoader({ request: mockRequest })
    ).rejects.toThrow()

    expect(redirect).toHaveBeenCalledWith(ROUTES.SIGNIN)
  })

  it('should redirect to signin when access token is empty', async () => {
    const mockRequest = createMockRequest('https://example.com/callback?token=')

    await expect(
      googleCallbackLoader({ request: mockRequest })
    ).rejects.toThrow()

    expect(redirect).toHaveBeenCalledWith(ROUTES.SIGNIN)
  })

  it('should successfully login and redirect after login when token is valid', async () => {
    const accessToken = 'valid-token-123'
    const mockRequest = createMockRequest(
      `https://example.com/callback?token=${accessToken}`
    )
    const mockRedirectResponse = redirect(ROUTES.HOME)

    mockLogin.mockResolvedValue(mockUser)
    vi.mocked(redirectAfterLogin).mockReturnValue(mockRedirectResponse)

    const result = await googleCallbackLoader({ request: mockRequest })

    expect(mockLogin).toHaveBeenCalledWith(accessToken)
    expect(redirectAfterLogin).toHaveBeenCalledWith(mockUser)
    expect(result).toBe(mockRedirectResponse)
  })

  it('should redirect to signin when login returns null user', async () => {
    const accessToken = 'invalid-token-123'
    const mockRequest = createMockRequest(
      `https://example.com/callback?token=${accessToken}`
    )

    mockLogin.mockResolvedValue(null)

    await expect(
      googleCallbackLoader({ request: mockRequest })
    ).rejects.toThrow()

    expect(mockLogin).toHaveBeenCalledWith(accessToken)
    expect(redirect).toHaveBeenCalledWith(ROUTES.SIGNIN)
  })

  it('should redirect to signin when login throws an error', async () => {
    const accessToken = 'error-token-123'
    const mockRequest = createMockRequest(
      `https://example.com/callback?token=${accessToken}`
    )

    mockLogin.mockRejectedValue(new Error('Login failed'))

    await expect(
      googleCallbackLoader({ request: mockRequest })
    ).rejects.toThrow()

    expect(mockLogin).toHaveBeenCalledWith(accessToken)
    expect(redirect).toHaveBeenCalledWith(ROUTES.SIGNIN)
  })
})
