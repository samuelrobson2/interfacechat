import { useSearchParams } from "react-router-dom";

/**
 * Generic hook for managing tabs state via URL search params
 * @param validTabs - Array of valid tab values
 * @param defaultTab - Default tab value to use when current tab is invalid
 * @param paramName - URL search param name (default: "tab")
 * @returns Current tab value and handler to change tab
 */
export function useSearchParamsTabs<T extends string>(
  validTabs: readonly T[],
  defaultTab: T,
  paramName: string = "tab"
) {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentTabParam = searchParams.get(paramName);
  
  // Check if current tab param is valid
  const isValidTab = (value: string | null): value is T => {
    return validTabs.includes(value as T);
  };

  const tab: T = isValidTab(currentTabParam) ? currentTabParam : defaultTab;

  // Handler to change tab
  const handleTabChange = (value: string) => {
    setSearchParams({ [paramName]: value as T });
  };

  return { tab, handleTabChange };
}

