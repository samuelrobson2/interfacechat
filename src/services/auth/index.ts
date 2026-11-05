import { setupFetchClient } from "./model/fetch-client-setup";

setupFetchClient();

export {
  protectedLoader,
  REDIRECT_AFTER_LOGIN_KEY,
} from "./model/protected-loader";
export { signinLoader } from "./model/signin-loader";
export { getUser, useSessionStore } from "./model/session-store";
export { useUpdateProfile } from "./model/use-update-profile";
export { PasswordInput } from "./ui/password-input";
export { PasswordStrengthChecker } from "./ui/password-strength-checker";
export { usePasswordStrengthCheck } from "./model/use-password-strength-check";
export { passwordSchema, PASSWORD_REQUIREMENTS } from "./lib/password-schema";
export { PHONE_REGEX } from "./lib/phone-regex";
export { useLogout } from "./model/use-logout";
export { getGoogleOAuthConnectUrl, connectGoogleOAuth } from "./model/google-oauth";
export {
  connectKaggleOAuth,
  useDisconnectKaggleOAuth,
  useKaggleOAuthCallback,
} from "./model/kaggle-oauth";
