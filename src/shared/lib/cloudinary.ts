import { CONFIG } from "@/shared/model/config";

type CloudinaryResourceType = "image" | "video";

interface CloudinaryUrlOptions {
  resourceType?: CloudinaryResourceType;
  // Raw transformation string, e.g. "q_auto/f_auto/c_limit,w_360".
  transformations?: string;
}

const CLOUDINARY_BASE_URL = "https://res.cloudinary.com";

// Single place to build Cloudinary delivery URLs from a public ID.
export const buildCloudinaryUrl = (
  publicId: string,
  { resourceType = "image", transformations }: CloudinaryUrlOptions = {},
) => {
  const segments = [
    CLOUDINARY_BASE_URL,
    CONFIG.CLOUDINARY_CLOUD_NAME,
    resourceType,
    "upload",
    transformations,
    publicId,
  ].filter(Boolean);

  return segments.join("/");
};
