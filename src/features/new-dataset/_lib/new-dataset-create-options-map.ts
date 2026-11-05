import type { ApiSchemas } from "@/shared/api/schema";

export function createOptionsMap(options: ApiSchemas["Field"]["options"]) {
  return options?.reduce(
    (acc, option) => {
      acc[option.key] = option.title;
      return acc;
    },
    {} as Record<string, string>,
  );
}
