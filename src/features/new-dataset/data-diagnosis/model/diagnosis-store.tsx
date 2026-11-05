import { createContext, useContext, useState } from "react";
import { createStore } from "zustand";
import { useStore } from "zustand";
import { immer } from "zustand/middleware/immer";

interface DiagnosisState {
  dataset_name: string;
  description: string;
}

type DiagnosisProps = DiagnosisState;

interface DiagnosisActions {
  setDatasetName: (dataset_name: string) => void;
  setDescription: (description: string) => void;
}

type DiagnosisStore = DiagnosisState & DiagnosisActions;

const DEFAULT_PROPS: DiagnosisProps = {
  dataset_name: "",
  description: "",
};

export const createDiagnosisStore = (initProps?: Partial<DiagnosisProps>) => {
  return createStore<DiagnosisStore>()(
    immer((set) => {
      const initialState = {
        ...DEFAULT_PROPS,
        ...initProps,
      };

      return {
        ...initialState,
        setDatasetName: (dataset_name) =>
          set((draft) => {
            draft.dataset_name = dataset_name;
          }),
        setDescription: (description) =>
          set((draft) => {
            draft.description = description;
          }),
      };
    }),
  );
};

export const DiagnosisContext = createContext<ReturnType<
  typeof createDiagnosisStore
> | null>(null);

export const useDiagnosisContext = <T,>(
  selector: (state: DiagnosisStore) => T,
): T => {
  const store = useContext(DiagnosisContext);
  if (!store) {
    throw new Error("Missing DiagnosisContext.Provider in the tree");
  }
  return useStore(store, selector);
};

type DiagnosisProviderProps = React.PropsWithChildren<Partial<DiagnosisProps>>;

export const DiagnosisProvider = ({
  children,
  ...props
}: DiagnosisProviderProps) => {
  const [store] = useState(() => createDiagnosisStore(props));
  return (
    <DiagnosisContext.Provider value={store}>
      {children}
    </DiagnosisContext.Provider>
  );
};
