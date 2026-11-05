import { UploadIcon } from "@/shared/assets/icons/outlined/Upload";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/kit/avatar";
import { Button } from "@/shared/ui/kit/button";
import { useRef } from "react";
import { useUploadProfileImage } from "../model/use-upload-profile-image";
import { useSessionStore } from "@/services/auth";
import { Text } from "@/shared/ui/kit/text";

export const ProfileAvatar = () => {
  const user = useSessionStore((state) => state.user);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadProfileImage, isPending, errorMessage } =
    useUploadProfileImage();

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    uploadProfileImage(file);
  };

  return (
    <div className="w-[196px] flex flex-col items-center justify-end gap-4">
      {/* Avatar */}
      <Avatar className="size-[100px] rounded-full">
        <AvatarImage
          src={user?.profile?.profile_photo ?? undefined}
          alt="User Avatar"
        />
        <AvatarFallback
          userName={user?.profile?.name}
          className="bg-blue-400 text-neutral-0 text-[48px] font-medium leading-[56px]"
        />
      </Avatar>

      {/* Upload button */}
      <Button
        variant="link"
        onClick={handleUploadClick}
        isLoading={isPending}
        className="gap-1"
        lottieClassName="-mt-3"
      >
        <UploadIcon
          svgClasses="size-5"
          pathProps={{ stroke: "currentColor" }}
        />
        Upload image
      </Button>

      {errorMessage && (
        <Text variant="label" color="error">
          {errorMessage}
        </Text>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};
