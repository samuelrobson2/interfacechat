import { createContext, useContext, useState } from "react";
import { createStore } from "zustand";
import { useStore } from "zustand";
import { immer } from "zustand/middleware/immer";

/** Dataset + API column name for universal prompt preview (`mapping_universal_prompt` body field). */
export const UNIVERSAL_PROMPT_COLUMN_ID = "mapping_universal_prompt";

export const IMAGES_COLUMN_ID = "images";

export interface ColumnConfig {
  column: string | undefined;
  hasNoColumn: boolean;
  createColumn: boolean;
}
export interface ColumnActions {
  setColumn: (column: string | undefined) => void;
  setHasNo: (hasNo: boolean) => void;
  setCreate: (create: boolean) => void;
}

/** Prompt column: same idea as hasNoColumn + setHasNo — field + setter pairs. */
export interface PromptColumnFields {
  universalPrompt: string;
  showUniversalPrompt: boolean;
  createPrompt: boolean;
}

export interface PromptColumnActions extends ColumnActions {
  setUniversalPrompt: (value: string) => void;
  setShowUniversalPrompt: (value: boolean) => void;
}

export type PromptColumnState = ColumnConfig &
  PromptColumnFields &
  PromptColumnActions;

// Context column config allows multiple columns
export interface ContextColumnConfig {
  column: string[];
  hasNoColumn: boolean;
}
export interface ContextColumnActions {
  setColumn: (column: string[]) => void;
  addColumn: (column: string) => void;
  removeColumn: (column: string) => void;
  setHasNo: (hasNo: boolean) => void;
}

export type ColumnType = "prompt" | "context" | "completion" | "chat";

interface MappingState {
  prompt: ColumnConfig & PromptColumnFields;
  completion: ColumnConfig;
  context: ContextColumnConfig;
  chat: Omit<ColumnConfig, "createColumn">;
  selectedColumn: ColumnType | undefined;
}

type MappingProps = MappingState;

type MappingStore = {
  prompt: PromptColumnState;
  completion: ColumnConfig & ColumnActions;
  context: ContextColumnConfig & ContextColumnActions;
  chat: Omit<ColumnConfig, "createColumn"> & Omit<ColumnActions, "setCreate">;
  selectedColumn: ColumnType | undefined;
  setSelectedColumn: (column: ColumnType | undefined) => void;
};

const DEFAULT_PROPS: MappingProps = {
  selectedColumn: undefined,
  prompt: {
    column: undefined,
    hasNoColumn: false,
    createColumn: false,
    universalPrompt: "",
    showUniversalPrompt: false,
    createPrompt: false,
  },
  context: {
    column: [],
    hasNoColumn: false,
  },
  completion: {
    column: undefined,
    hasNoColumn: false,
    createColumn: false,
  },
  chat: {
    column: undefined,
    hasNoColumn: false,
  },
};

function setColumn(
  draft: MappingState,
  column: ColumnType,
  value: string | string[] | undefined,
) {
  draft[column].column = value;
  draft[column].hasNoColumn = false;
  if ("createColumn" in draft[column]) draft[column].createColumn = false;
  if (column === "prompt") {
    draft.prompt.showUniversalPrompt = false;
  }
}

const columnSelectionOrder: ColumnType[] = ["prompt", "completion", "context"];

function setHasNo(draft: MappingState, column: ColumnType, hasNo: boolean) {
  draft[column].hasNoColumn = hasNo;
  if ("createColumn" in draft[column]) {
    draft[column].createColumn = column === "prompt" ? !hasNo : hasNo;
  }
  if (hasNo) {
    const remainingColumns = columnSelectionOrder.filter(
      (col) => col !== column,
    );

    for (const col of remainingColumns) {
      if (
        (!draft[col].column || draft[col].column.length === 0) &&
        !draft[col].hasNoColumn
      ) {
        draft.selectedColumn = col;
        return;
      }
    }
    draft.selectedColumn = undefined;
  }
}

export const createMappingStore = (initProps?: Partial<MappingProps>) => {
  return createStore<MappingStore>()(
    immer((set) => {
      const initialState = {
        ...DEFAULT_PROPS,
        ...initProps,
      };

      return {
        prompt: {
          ...initialState.prompt,
          setColumn: (column) =>
            set((draft) => {
              setColumn(draft, "prompt", column);
            }),
          setHasNo: (hasNo) =>
            set((draft) => {
              setHasNo(draft, "prompt", hasNo);
            }),
          setCreate: (create) =>
            set((draft) => {
              draft.prompt.createColumn = create;
              if (create) draft.prompt.showUniversalPrompt = false;
            }),
          setUniversalPrompt: (value) =>
            set((draft) => {
              draft.prompt.universalPrompt = value;
            }),
          setShowUniversalPrompt: (value) =>
            set((draft) => {
              draft.prompt.showUniversalPrompt = value;
            }),
        },
        context: {
          ...initialState.context,
          setColumn: (column) =>
            set((draft) => {
              setColumn(draft, "context", column);
            }),
          addColumn: (column) =>
            set((draft) => {
              if (!draft.context.column.includes(column)) {
                draft.context.column.push(column);
              }
              draft.context.hasNoColumn = false;
            }),
          removeColumn: (column) =>
            set((draft) => {
              draft.context.column = draft.context.column.filter(
                (col) => col !== column,
              );
            }),
          setHasNo: (hasNo) =>
            set((draft) => {
              setHasNo(draft, "context", hasNo);
            }),
        },
        completion: {
          ...initialState.completion,
          setColumn: (column) =>
            set((draft) => {
              setColumn(draft, "completion", column);
            }),
          setHasNo: (hasNo) =>
            set((draft) => {
              setHasNo(draft, "completion", hasNo);
            }),
          setCreate: (create) =>
            set((draft) => {
              draft.completion.createColumn = create;
            }),
        },
        chat: {
          ...initialState.chat,
          setColumn: (column) =>
            set((draft) => {
              draft.chat.column = column;
              draft.chat.hasNoColumn = false;
              draft.prompt.createColumn = false;
              draft.completion.createColumn = false;
            }),
          setHasNo: (hasNo) =>
            set((draft) => {
              draft.chat.hasNoColumn = hasNo;
            }),
        },
        selectedColumn: initialState.selectedColumn,
        setSelectedColumn: (column) =>
          set((draft) => {
            draft.selectedColumn = column;
          }),
      };
    }),
  );
};

export const MappingContext = createContext<ReturnType<
  typeof createMappingStore
> | null>(null);

export const useMappingContext = <T,>(
  selector: (state: MappingStore) => T,
): T => {
  const store = useContext(MappingContext);
  if (!store) {
    throw new Error("Missing MappingContext.Provider in the tree");
  }
  return useStore(store, selector);
};

type MappingProviderProps = React.PropsWithChildren<Partial<MappingProps>>;

export const MappingProvider = ({
  children,
  ...props
}: MappingProviderProps) => {
  const [store] = useState(() => createMappingStore(props));
  return (
    <MappingContext.Provider value={store}>{children}</MappingContext.Provider>
  );
};

export const useIsMappingValid = () => {
  return useMappingContext((state) => {
    if (!state.prompt.universalPrompt) {
      return (
        !!state.prompt.column ||
        !!state.completion.column ||
        !!state.chat.column
      );
    } else {
      return (
        state.prompt.universalPrompt &&
        (state.context.column.length > 0 || !!state.completion.column)
      );
    }
  });
};
