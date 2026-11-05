import { verifyEmailloader } from "../verify-email-loader";
import { publicFetchClient } from "@/shared/api/instance";
import { ROUTES } from "@/shared/model/routes";
import { redirect } from "react-router-dom";

// Mock dependencies
vi.mock("@/shared/api/instance");
vi.mock("react-router-dom", () => ({
  redirect: vi.fn(),
}));

describe("verifyEmailloader", () => {
  const createMockRequest = (url: string) => ({
    url,
  } as Request);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should redirect to signup when no verification token provided", async () => {
    const mockRequest = createMockRequest("https://example.com/verify");

    await expect(
      verifyEmailloader({ request: mockRequest })
    ).rejects.toThrow();

    expect(redirect).toHaveBeenCalledWith(ROUTES.SIGNIN);
  });

  it("should call API with verification token and return data on success", async () => {
    const verificationToken = "test-token-123";
    const mockRequest = createMockRequest(
      `https://example.com/verify?verificationToken=${verificationToken}`
    );
    const mockResponseData = {
      access_token: "token123",
      user: { id: "1", email: "test@example.com" },
    };

    vi.mocked(publicFetchClient.POST).mockResolvedValue({
      data: mockResponseData,
      response: {} as Response,
    });

    const result = await verifyEmailloader({ request: mockRequest });

    expect(publicFetchClient.POST).toHaveBeenCalledWith("/auth/verify", {
      params: {
        query: {
          verificationToken,
        },
      },
    });
    expect(result).toBe(mockResponseData);
  });

  it("should return null when API call fails", async () => {
    const verificationToken = "invalid-token";
    const mockRequest = createMockRequest(
      `https://example.com/verify?verificationToken=${verificationToken}`
    );

    vi.mocked(publicFetchClient.POST).mockRejectedValue(new Error("API Error"));

    const result = await verifyEmailloader({ request: mockRequest });

    expect(publicFetchClient.POST).toHaveBeenCalledWith("/auth/verify", {
      params: {
        query: {
          verificationToken,
        },
      },
    });
    expect(result).toBe(null);
  });

  it("should handle empty verification token", async () => {
    const mockRequest = createMockRequest("https://example.com/verify?verificationToken=");

    await expect(
      verifyEmailloader({ request: mockRequest })
    ).rejects.toThrow();

    expect(redirect).toHaveBeenCalledWith(ROUTES.SIGNIN);
  });
});
