/** What's being written in Chat's input: one draft, wherever the input is. */
export type ComposerDraft = { text: string; attached: string[] };

export const EMPTY_DRAFT: ComposerDraft = { text: "", attached: [] };
