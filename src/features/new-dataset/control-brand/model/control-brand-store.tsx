import { createContext, useContext, useState } from "react";
import { createStore } from "zustand";
import { useStore } from "zustand";
import { immer } from "zustand/middleware/immer";

interface ControlBrandState {
  brand_length: string;
  brand_safety: Set<string>;
  brand_custom_settings: string;
  hallucination_mitigation: string;
}

type ControlBrandProps = ControlBrandState;

interface ControlBrandActions {
  setBrandLength: (brand_length: string) => void;
  setBrandSafety: (brand_safety: Set<string>) => void;
  setBrandSettings: (brand_settings: string) => void;
  addBrandSafety: (safety: string) => void;
  removeBrandSafety: (safety: string) => void;
  setHallucinationMitigation: (hallucination_mitigation: string) => void;
}

type ControlBrandStore = ControlBrandState & ControlBrandActions;

const DEFAULT_PROPS: ControlBrandProps = {
  brand_length: "",
  brand_safety: new Set<string>(),
  brand_custom_settings: "",
  hallucination_mitigation: "",
};

export const createControlBrandStore = (initProps?: Partial<ControlBrandProps>) => {
  return createStore<ControlBrandStore>()(
    immer((set) => {
      const initialState = {
        ...DEFAULT_PROPS,
        ...initProps,
      };

      return {
        ...initialState,
        setBrandLength: (brand_length) =>
          set((draft) => {
            draft.brand_length = brand_length;
          }),
        setBrandSafety: (brand_safety) =>
          set((draft) => {
            draft.brand_safety = brand_safety;
          }),
        addBrandSafety: (safety) =>
          set((draft) => {
            draft.brand_safety.add(safety);
          }),
        removeBrandSafety: (safety) =>
          set((draft) => {
            draft.brand_safety.delete(safety);
          }),
        setBrandSettings: (brand_settings) =>
          set((draft) => {
            draft.brand_custom_settings = brand_settings;
          }),
        setHallucinationMitigation: (hallucination_mitigation) =>
          set((draft) => {
            draft.hallucination_mitigation = hallucination_mitigation;
          }),
      };
    }),
  );
};

export const ControlBrandContext = createContext<ReturnType<
  typeof createControlBrandStore
> | null>(null);

export const useControlBrandContext = <T,>(selector: (state: ControlBrandStore) => T): T => {
  const store = useContext(ControlBrandContext);
  if (!store) {
    throw new Error("Missing ControlBrandContext.Provider in the tree");
  }
  return useStore(store, selector);
};

type ControlBrandProviderProps = React.PropsWithChildren<Partial<ControlBrandProps>>;

export const ControlBrandProvider = ({ children, ...props }: ControlBrandProviderProps) => {
  const [store] = useState(() => createControlBrandStore(props));
  return (
    <ControlBrandContext.Provider value={store}>
      {children}
    </ControlBrandContext.Provider>
  );
};

