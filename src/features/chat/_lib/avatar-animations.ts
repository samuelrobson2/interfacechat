import { buildCloudinaryUrl } from "@/shared/lib/cloudinary";

export type AvatarPhase = "idle" | "transition" | "thinking";

// Avatar clips live in Cloudinary (folder: chat-app/avatar). Delivery transform:
// - q_auto        -> automatic quality (smallest size at good visual quality)
// - f_auto:video  -> best codec per browser (VP9/WebM, AV1, HEVC, H.264 fallback);
//                    `:video` ensures a `<video>` without a file extension is
//                    served as video, not a single still frame.
// - c_limit,w_360 -> cap at 360px (2x the rendered size) without upscaling.
const AVATAR_TRANSFORMATION = "q_auto/f_auto:video/c_limit,w_360";

const buildAvatarClip = (publicId: string) =>
  buildCloudinaryUrl(publicId, {
    resourceType: "video",
    transformations: AVATAR_TRANSFORMATION,
  });

export const avatarAnimations: Record<AvatarPhase, string> = {
  idle: buildAvatarClip("Adaption_Avatar-Animation_Idle-Loop_p6psq6"),
  transition: buildAvatarClip("Adaption_Avatar-Animation_Transition_r1xlku"),
  thinking: buildAvatarClip("Adaption_Avatar-Animation_Thinking-Loop_mxtg1z"),
};
