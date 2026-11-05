//import { PhoneFilledIcon } from "@/shared/assets/icons/general/PhoneFilled";
import GoogleImage from "@/shared/assets/images/google.svg";
import { cn } from "@/shared/lib/css";
//import { ROUTES } from "@/shared/model/routes";
import { LockIcon } from "@/shared/assets/icons/general/Lock";
import { LogoIcon } from "@/shared/assets/icons/Logo";
import { LogoTextIcon } from "@/shared/assets/icons/LogoText";
import { WEBSITE_LINK } from "@/shared/model/routes";
import { Button } from "@/shared/ui/kit/button";
import { Separator } from "@/shared/ui/kit/separator";
import { Text } from "@/shared/ui/kit/text";
import { Link } from "react-router-dom";
import { useGoogleAuth } from "../google/use-google-auth";

export function AuthLayout({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col md:gap-12 gap-6 items-center justify-center min-h-screen py-17 md:py-0",
        className,
      )}
      {...props}
    />
  );
}

export function AuthHeader({
  className,
  title,
  subtitle,
  useLogoIcon,
  useLockIcon,
  ...props
}: React.ComponentProps<"div"> & {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  useLogoIcon?: boolean;
  useLockIcon?: boolean;
}) {
  return (
    <div
      className={cn("flex flex-col gap-8 md:gap-12 text-center", className)}
      {...props}
    >
      {useLogoIcon && (
        <Link
          to={WEBSITE_LINK}
          className="mx-auto flex gap-2.5"
          aria-label="adaption home"
        >
          <LogoIcon svgClasses="w-[21px] h-fit shrink-0" />
          <LogoTextIcon svgClasses="w-[111px] h-auto shrink-0" />
        </Link>
      )}
      {useLockIcon && <LockIcon className="mx-auto size-10" />}
      <Text variant="h1">{title}</Text>
      {subtitle && <Text variant="body">{subtitle}</Text>}
    </div>
  );
}

// White card that wraps the auth block. Use only on pages that render the
// gradient background
export function AuthCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex w-[calc(100%-2rem)] max-w-[458px] flex-col items-center gap-6 rounded-[8px]",
        "bg-background-primary px-8 py-12 md:gap-12 md:px-4",
        className,
      )}
      {...props}
    />
  );
}

export function AuthContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "w-full max-w-[426px] p-[16px] flex flex-col gap-10",
        className,
      )}
      {...props}
    />
  );
}

export function AuthAlternativeLogin({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { getGoogleAuthUrl } = useGoogleAuth();

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      {/* INFO: Phone auth is not supported yet
      <Button variant="secondary" className="w-full" asChild>
        <Link to={ROUTES.PHONE_AUTH}>
          <PhoneFilledIcon pathClasses="stroke-icon-primary fill-icon-primary" />
          Continue with phone
        </Link>
      </Button>
      */}

      <Button variant="secondary" className="w-full" asChild>
        <Link to={getGoogleAuthUrl()}>
          <img src={GoogleImage} alt="Google" />
          Continue with Google
        </Link>
      </Button>
    </div>
  );
}

export function AuthLinks({
  footerText,
  actionButton,
  ...props
}: React.ComponentProps<"div"> & {
  footerText: string;
  actionButton?: React.ReactNode;
}) {
  return (
    <div className="text-center" {...props}>
      <Text className="inline-block">{footerText}</Text> {actionButton}
    </div>
  );
}

export function AuthBackButton({ className }: { className?: string }) {
  return (
    <Link
      to={WEBSITE_LINK}
      aria-label="Back to home"
      className={cn(
        "absolute left-6 top-8 z-20 flex items-center gap-6 md:left-12 md:top-10",
        className,
      )}
    >
      <span className="text-gray-1">&lt;</span>
      <Text className="text-gray-1">Home</Text>
    </Link>
  );
}

export function AuthOrDivider({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex items-center gap-6", className)} {...props}>
      <Separator className="flex-1" />
      <Text>OR</Text>
      <Separator className="flex-1" />
    </div>
  );
}
