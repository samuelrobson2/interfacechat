import { createContext, useContext, useState } from "react";
import { createStore } from "zustand";
import { useStore } from "zustand";
import { immer } from "zustand/middleware/immer";

interface GrowState {
  expansion_languages: Set<string>;
  expansion_countries: Set<string>;
  expansion_languages_percent: number;
  expansion_countries_percent: number;
}

type GrowProps = GrowState;

interface GrowActions {
  setLanguages: (languages: Set<string>) => void;
  setCountries: (countries: Set<string>) => void;
  addLanguage: (language: string) => void;
  removeLanguage: (language: string) => void;
  addCountry: (country: string) => void;
  removeCountry: (country: string) => void;
  setLanguagesPercent: (languagesPercent: number) => void;
  setCountriesPercent: (countriesPercent: number) => void;
}

type GrowStore = GrowState & GrowActions;

const DEFAULT_PROPS: GrowProps = {
  expansion_languages: new Set<string>(),
  expansion_countries: new Set<string>(),
  expansion_languages_percent: 0,
  expansion_countries_percent: 0,
};

export const createGrowStore = (initProps?: Partial<GrowProps>) => {
  return createStore<GrowStore>()(
    immer((set) => {
      const initialState = {
        ...DEFAULT_PROPS,
        ...initProps,
      };

      return {
        ...initialState,
        setLanguages: (languages) =>
          set((draft) => {
            draft.expansion_languages = languages;
          }),
        addLanguage: (language) =>
          set((draft) => {
            draft.expansion_languages.add(language);
          }),
        removeLanguage: (language) =>
          set((draft) => {
            draft.expansion_languages.delete(language);
          }),
        setCountries: (countries) =>
          set((draft) => {
            draft.expansion_countries = countries;
          }),
        addCountry: (country) =>
          set((draft) => {
            draft.expansion_countries.add(country);
          }),
        removeCountry: (country) =>
          set((draft) => {
            draft.expansion_countries.delete(country);
          }),
        setLanguagesPercent: (languagesPercent) =>
          set((draft) => {
            draft.expansion_languages_percent = languagesPercent;
          }),
        setCountriesPercent: (countriesPercent) =>
          set((draft) => {
            draft.expansion_countries_percent = countriesPercent;
          }),
      };
    }),
  );
};

export const GrowContext = createContext<ReturnType<
  typeof createGrowStore
> | null>(null);

export const useGrowContext = <T,>(selector: (state: GrowStore) => T): T => {
  const store = useContext(GrowContext);
  if (!store) {
    throw new Error("Missing GrowContext.Provider in the tree");
  }
  return useStore(store, selector);
};

type GrowProviderProps = React.PropsWithChildren<Partial<GrowProps>>;

export const GrowProvider = ({ children, ...props }: GrowProviderProps) => {
  const [store] = useState(() => createGrowStore(props));
  return (
    <GrowContext.Provider value={store}>
      {children}
    </GrowContext.Provider>
  );
};
