import { useMemo } from "react";

type ReturnType<T, K extends keyof T> = Record<
  T[K] extends string | number ? T[K] : string,
  T
>;

export function useOptionsMap<T, K extends keyof T>(
  options: T[] | undefined,
  key: K,
): ReturnType<T, K> {
  const optionsMap = useMemo(
    () =>
      options?.reduce(
        (acc, option) => {
          const mapKey = option[key];
          if (mapKey !== null && mapKey !== undefined) {
            acc[mapKey as T[K] extends string | number ? T[K] : string] =
              option;
          }
          return acc;
        },
        {} as ReturnType<T, K>,
      ),
    [options, key],
  );

  return optionsMap || ({} as ReturnType<T, K>);
}
