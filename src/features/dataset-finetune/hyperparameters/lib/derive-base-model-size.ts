/**
 * Derives API `base_model_size` (e.g. "8B", "70B") from a Hugging Face–style model id.
 */
export function deriveBaseModelSizeFromModelId(modelId: string): string {
  const tail = modelId.split(/[/:]/).pop() ?? modelId;
  const re = /(\d+)([bBmM])\b/;
  const fromTail = tail.match(re);
  const fromFull = fromTail ?? modelId.match(re);
  if (!fromFull) return "8B";
  const digits = fromFull[1];
  const suffix = fromFull[2];
  if (!digits || !suffix) return "8B";
  return `${digits}${suffix.toUpperCase()}`;
}
