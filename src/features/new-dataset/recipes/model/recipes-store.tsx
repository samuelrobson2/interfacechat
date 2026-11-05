import { createContext, useContext, useState } from "react";
import { createStore } from "zustand";
import { useStore } from "zustand";
import { immer } from "zustand/middleware/immer";

interface RecipesState {
  fields: Record<string, string>;
}

type RecipesProps = RecipesState;

interface RecipesActions {
  setFields: (fields: Record<string, string>) => void;
  setField: (key: string, value: string) => void;
  setFieldWithRelation: (key: string, value: string, relationKey?: string | null) => void;
}

type RecipesStore = RecipesState & RecipesActions;

const DEFAULT_PROPS: RecipesProps = {
  fields: {},
};

export const createRecipesStore = (initProps?: Partial<RecipesProps>) => {
  return createStore<RecipesStore>()(
    immer((set) => {
      const initialState = {
        ...DEFAULT_PROPS,
        ...initProps,
      };

      return {
        ...initialState,
        setField: (key, value) =>
          set((draft) => {
            draft.fields[key] = value;
          }),
        setFields: (fields) =>
          set((draft) => {
            draft.fields = fields;
          }),
        setFieldWithRelation: (key, value, relationKey) =>
          set((draft) => {
            draft.fields[key] = value;
            // If enabling current field and it has relation, disable the related field
            if (value && relationKey) {
              draft.fields[relationKey] = "false";
            }
          }),
      };
    }),
  );
};

export const RecipesContext = createContext<ReturnType<
  typeof createRecipesStore
> | null>(null);

export const useRecipesContext = <T,>(
  selector: (state: RecipesStore) => T,
): T => {
  const store = useContext(RecipesContext);
  if (!store) {
    throw new Error("Missing RecipesContext.Provider in the tree");
  }
  return useStore(store, selector);
};

type RecipesProviderProps = React.PropsWithChildren<Partial<RecipesProps>>;

export const RecipesProvider = ({
  children,
  ...props
}: RecipesProviderProps) => {
  const [store] = useState(() => createRecipesStore(props));
  return (
    <RecipesContext.Provider value={store}>
      {children}
    </RecipesContext.Provider>
  );
};
