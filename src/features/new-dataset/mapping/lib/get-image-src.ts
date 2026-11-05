import { fileTypeFromBuffer } from "file-type";

const isUrl = (value: string) =>
  value.startsWith("http://") ||
  value.startsWith("https://") ||
  value.startsWith("data:image/") ||
  value.startsWith("blob:") ||
  value.startsWith("file:") ||
  value.startsWith("/");

const looksLikeBase64 = (value: string) =>
  value.length % 4 === 0 && /^[A-Za-z0-9+/]+={0,2}$/.test(value);

const MAGIC_SIGNATURES: Array<{ mime: string; bytes: number[]; offset?: number; }> =
  [
    {
      mime: "image/png",
      bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
    },
    { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
    { mime: "image/gif", bytes: [0x47, 0x49, 0x46, 0x38] },
    { mime: "image/webp", bytes: [0x57, 0x45, 0x42, 0x50], offset: 8 },
  ];

const detectImageMimeBySignature = (bytes: Uint8Array): string | undefined => {
  for (const { mime, bytes: signature, offset = 0 } of MAGIC_SIGNATURES) {
    if (bytes.length < offset + signature.length) continue;
    const isMatch = signature.every(
      (byte, index) => bytes[offset + index] === byte,
    );
    if (isMatch) return mime;
  }
  return undefined;
};

const detectImageMime = async (
  bytes: Uint8Array,
): Promise<string | undefined> => {
  const fileType = await fileTypeFromBuffer(bytes);
  if (fileType?.mime?.startsWith("image/")) return fileType.mime;
  return detectImageMimeBySignature(bytes);
};

const parseBinaryStream = (value: string): Uint8Array | undefined => {
  const stripped = value.replace(/[\s,[\]]/g, "");
  if (!stripped || !/^[01]+$/.test(stripped) || stripped.length % 8 !== 0) {
    return undefined;
  }

  const bytes = Array.from(
    { length: stripped.length / 8 },
    (_, i) => Number.parseInt(stripped.slice(i * 8, i * 8 + 8), 2),
  );
  return Uint8Array.from(bytes);
};

const parseByteToken = (token: string, hexMode: boolean): number | undefined => {
  const value = token.trim();
  if (!value) return undefined;

  if (/^[01]{8}$/.test(value)) return Number.parseInt(value, 2);

  const parsed = /^0x[0-9a-fA-F]{1,2}$/.test(value)
    ? Number.parseInt(value.slice(2), 16)
    : hexMode && /^[0-9a-fA-F]{1,2}$/.test(value)
      ? Number.parseInt(value, 16)
      : /^\d+$/.test(value)
        ? Number.parseInt(value, 10)
        : Number.NaN;

  if (Number.isNaN(parsed) || parsed < 0 || parsed > 255) return undefined;
  return parsed;
};

const parseByteTokens = (tokens: string[]): Uint8Array | undefined => {
  if (!tokens.length) return undefined;
  const hexMode = tokens.some(
    (token) => /^0x[0-9a-fA-F]{1,2}$/.test(token) || /[a-fA-F]/.test(token),
  );

  const bytes: number[] = [];
  for (const token of tokens) {
    const parsed = parseByteToken(token, hexMode);
    if (parsed === undefined) return undefined;
    bytes.push(parsed);
  }
  return Uint8Array.from(bytes);
};

const parseBytesFromString = (value: string): Uint8Array | undefined => {
  const binary = parseBinaryStream(value);
  if (binary) return binary;

  const tokens = value
    .replaceAll("[", " ")
    .replaceAll("]", " ")
    .split(/[\s,]+/)
    .filter(Boolean);
  return parseByteTokens(tokens);
};

const parseBytes = (value: unknown): Uint8Array | undefined => {
  if (value instanceof Uint8Array) return value;
  if (typeof value === "string") return parseBytesFromString(value);
  if (!Array.isArray(value) || value.length === 0) return undefined;

  const tokens = value
    .map((item) => (typeof item === "number" ? String(item) : String(item ?? "")))
    .filter(Boolean);
  return parseByteTokens(tokens);
};

const bytesToBase64 = (bytes: Uint8Array) => {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
};

const toDataUrl = (bytes: Uint8Array, mimeType: string) =>
  `data:${mimeType};base64,${bytesToBase64(bytes)}`;

const parseDimensionsHint = (value: string): [number, number] | undefined => {
  const match = value.match(/(\d+)\s*x\s*(\d+)\s*(?:px)?/i);
  if (!match) return;

  const width = Number.parseInt(match[1]!, 10);
  const height = Number.parseInt(match[2]!, 10);
  if (width <= 0 || height <= 0) return;
  return [width, height];
};

const toMonochromeBitmapDataUrl = (
  bytes: Uint8Array,
  sourceHint?: string,
): string | undefined => {
  if (typeof document === "undefined" || bytes.length === 0) return;

  const hint = sourceHint ? parseDimensionsHint(sourceHint) : undefined;
  const widthCandidates = hint
    ? [hint[0], 128, 64, 32, 256]
    : [128, 64, 32, 256];

  const width = widthCandidates.find((candidate) => {
    const bytesPerRow = Math.ceil(candidate / 8);
    return bytesPerRow > 0 && bytes.length % bytesPerRow === 0;
  });
  if (!width) return;

  const bytesPerRow = Math.ceil(width / 8);
  const height = bytes.length / bytesPerRow;
  if (!Number.isInteger(height) || height <= 0) return;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return;

  const imageData = context.createImageData(width, height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const byteIndex = y * bytesPerRow + (x >> 3);
      const bitIndex = 7 - (x & 7);
      const isOn = ((bytes[byteIndex]! >> bitIndex) & 1) === 1;
      const i = (y * width + x) * 4;
      const pixelValue = isOn ? 0 : 255;

      imageData.data[i] = pixelValue;
      imageData.data[i + 1] = pixelValue;
      imageData.data[i + 2] = pixelValue;
      imageData.data[i + 3] = 255;
    }
  }

  context.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png");
};

export const getImageSrc = async (
  value: unknown,
): Promise<string | undefined> => {
  if (!value) return undefined;

  if (typeof value === "string") {
    const v = value.trim();
    if (!v) return undefined;

    if (looksLikeBase64(v)) return `data:image/png;base64,${v}`;
    if (isUrl(v)) return v;

    const bytesFromString = parseBytesFromString(v);
    if (bytesFromString) {
      const mimeType = await detectImageMime(bytesFromString);
      if (mimeType) return toDataUrl(bytesFromString, mimeType);
      return toMonochromeBitmapDataUrl(bytesFromString, v);
    }
    return v;
  }

  const bytes = parseBytes(value);
  if (bytes) {
    const mimeType = await detectImageMime(bytes);
    if (mimeType) return toDataUrl(bytes, mimeType);
    return toMonochromeBitmapDataUrl(bytes);
  }
  return undefined;
};
