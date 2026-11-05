import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";

// `useCombineDatasets` is a thin wrapper around `rqClient.useMutation`. The
// detail we want to assert is that *every* invocation sends a fresh
// `Idempotency-Key` header (overridable by the caller), so we mock the openapi
// client and inspect what the hook forwards.
const mutateAsync = vi.fn();

vi.mock("@/shared/api/instance", () => ({
  rqClient: {
    useMutation: () => ({
      mutateAsync,
      isPending: false,
      error: null,
      reset: vi.fn(),
    }),
  },
}));

import { useCombineDatasets } from "../use-combine-datasets";

beforeEach(() => {
  mutateAsync.mockReset();
  mutateAsync.mockResolvedValue({
    dataset_id: "merged-123",
    name: "Combined",
    sources: [],
  });
});

describe("useCombineDatasets", () => {
  it("sends a per-call crypto.randomUUID() as the Idempotency-Key header by default", async () => {
    const randomSpy = vi
      .spyOn(crypto, "randomUUID")
      .mockReturnValue("00000000-0000-4000-8000-000000000001");

    const { result } = renderHook(() => useCombineDatasets());

    await result.current.combineDatasets({
      dataset_ids: ["a", "b"],
      name: "Combined",
    });

    expect(randomSpy).toHaveBeenCalledTimes(1);
    expect(mutateAsync).toHaveBeenCalledWith({
      params: {
        header: {
          "Idempotency-Key": "00000000-0000-4000-8000-000000000001",
        },
      },
      body: { dataset_ids: ["a", "b"], name: "Combined" },
    });
  });

  it("uses the caller-supplied idempotencyKey when provided", async () => {
    const randomSpy = vi.spyOn(crypto, "randomUUID");

    const { result } = renderHook(() => useCombineDatasets());

    await result.current.combineDatasets({
      dataset_ids: ["a", "b"],
      name: "Combined",
      idempotencyKey: "explicit-key-from-retry",
    });

    expect(randomSpy).not.toHaveBeenCalled();
    expect(mutateAsync.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        params: {
          header: { "Idempotency-Key": "explicit-key-from-retry" },
        },
      }),
    );
  });

  it("generates a different Idempotency-Key for each combine attempt", async () => {
    vi.spyOn(crypto, "randomUUID")
      .mockReturnValueOnce("11111111-1111-4111-8111-111111111111")
      .mockReturnValueOnce("22222222-2222-4222-8222-222222222222");

    const { result } = renderHook(() => useCombineDatasets());

    await result.current.combineDatasets({
      dataset_ids: ["a", "b"],
      name: "First",
    });
    await result.current.combineDatasets({
      dataset_ids: ["a", "b"],
      name: "Second",
    });

    const callOne = mutateAsync.mock.calls[0]?.[0] as {
      params: { header: { "Idempotency-Key": string } };
    };
    const callTwo = mutateAsync.mock.calls[1]?.[0] as {
      params: { header: { "Idempotency-Key": string } };
    };
    expect(callOne.params.header["Idempotency-Key"]).toBe(
      "11111111-1111-4111-8111-111111111111",
    );
    expect(callTwo.params.header["Idempotency-Key"]).toBe(
      "22222222-2222-4222-8222-222222222222",
    );
    expect(callOne.params.header["Idempotency-Key"]).not.toBe(
      callTwo.params.header["Idempotency-Key"],
    );
  });

  it("does not generate an Idempotency-Key for the validate path (separate hook)", () => {
    // Sanity: `useCombineDatasets` only exposes the combine mutation; validate
    // lives in `useCombineValidate` (no idempotency header). This guards
    // against accidental coupling between the two.
    const { result } = renderHook(() => useCombineDatasets());
    expect(result.current).toEqual(
      expect.objectContaining({
        combineDatasets: expect.any(Function),
        isPending: false,
      }),
    );
    expect(result.current).not.toHaveProperty("validateCombine");
  });
});
