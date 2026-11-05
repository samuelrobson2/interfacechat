import { CONFIG } from "@/shared/model/config";

export function useGoogleAuth() {
  const getGoogleAuthUrl = () => {
    return `${CONFIG.API_BASE_URL}/auth/login/google`;
  }

  return {
    getGoogleAuthUrl,
  };
}
