export const readSseStream = async <T>(
  body: ReadableStream<Uint8Array<ArrayBuffer>>,
  onEvent: (event: T) => void,
  signal?: AbortSignal,
) => {
  const reader = body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  let isAborted = false;

  const abortHandler = () => {
    isAborted = true;
    void reader.cancel().catch(() => undefined);
  };

  if (signal) {
    if (signal.aborted) {
      abortHandler();
    } else {
      signal.addEventListener("abort", abortHandler, { once: true });
    }
  }

  try {
    while (true) {
      if (isAborted || signal?.aborted) {
        throw new DOMException("The operation was aborted", "AbortError");
      }

      const { done, value } = await reader.read();
      if (done) break;

      buffer += value;
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;

        const raw = line.slice(6).trim();
        if (!raw) continue;

        const event = JSON.parse(raw) as T;
        onEvent(event);
      }
    }
  } finally {
    if (signal) {
      signal.removeEventListener("abort", abortHandler);
    }
    reader.releaseLock();
  }
};
