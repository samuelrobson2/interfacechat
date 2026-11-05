type ProbeOptions = {
  timeoutMs?: number;
  signal?: AbortSignal;
};

// Health-check a cross-origin generated preview URL. A Modal sandbox that has
// shut down returns ERR_EMPTY_RESPONSE, so a no-cors fetch rejects; a live
// sandbox responds (opaque) and resolves. We can only read reachability, not
// the HTTP status (the response is opaque).
export const probePreviewAlive = async (
  url: string,
  { timeoutMs = 8000, signal }: ProbeOptions = {},
): Promise<boolean> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const handleAbort = () => controller.abort();
  signal?.addEventListener("abort", handleAbort);

  try {
    await fetch(url, {
      method: "GET",
      mode: "no-cors",
      cache: "no-store",
      signal: controller.signal,
    });
    return true;
  } catch (error) {
    // Propagate external cancellation (e.g. React Query aborting the query) so
    // it is not mistaken for a dead sandbox. A timeout means the preview is dead.
    if (signal?.aborted) throw error;
    return false;
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener("abort", handleAbort);
  }
};
