import { RefreshIcon } from "@/shared/assets/icons/outlined/Refresh";
import { useCountdown } from "@/shared/lib/react/use-countdown";
import { Button } from "@/shared/ui/kit/button";
import { Text } from "@/shared/ui/kit/text";
import { usePhoneStore } from "../model/phone-store";
import { usePhoneLogin } from "../model/use-phone-login";

export function ResendOTP({
  phone,
  duration,
}: {
  phone: string;
  duration: number;
}) {
  const isVerifyStarted = usePhoneStore(
    (state) => state.isVerifyStarted[phone],
  );
  const setIsVerifyStarted = usePhoneStore((state) => state.setIsVerifyStarted);
  const { start, isStarted, timeLeft } = useCountdown({
    key: phone,
    duration,
    instantStart: !isVerifyStarted,
    onStart: () => setIsVerifyStarted(phone, true),
  });
  const { phoneLoginAsync, isPending } = usePhoneLogin();

  const handleResend = async () => {
    try {
      await phoneLoginAsync({ phone });
      start();
    } catch (error) {
      console.error(error);
    }
  };

  return isStarted ? (
    <div className="flex items-center gap-2">
      <RefreshIcon className="size-5" pathClasses="stroke-icon-primary" />
      <Text>Resend code: {timeLeft} sec</Text>
    </div>
  ) : (
    <Button
      variant="link"
      disabled={isPending}
      onClick={handleResend}
      className="self-start group"
      type="button"
    >
      <RefreshIcon pathClasses="transition-colors stroke-current" />
      Resend code
    </Button>
  );
}
