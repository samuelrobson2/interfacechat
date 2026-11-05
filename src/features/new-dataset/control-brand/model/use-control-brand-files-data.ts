import type { ApiSchemas } from "@/shared/api/schema";
import { parseNewDatasetValue } from "../../_lib/new-dataset-parse-values";

function convertBrandFilesToFiles(
  brand_files: ApiSchemas["BrandFileDto"][],
): Map<string, File> {
  const filesMap = new Map<string, File>();

  brand_files.forEach((brandFile) => {
    const fileName = brandFile.file_name ?? "";
    const fileExtension = brandFile.file_extension ?? "";
    const fullFileName =
      fileName && fileExtension && !fileName.endsWith(`.${fileExtension}`)
        ? `${fileName}.${fileExtension}`
        : fileName;

    if (!fullFileName) return;

    const content = brandFile.content ?? "";
    const file = new File([content], fullFileName, {
      type: "application/octet-stream",
      lastModified: 0,
    });
    const fileKey = `${file.name}-${file.size}`;

    filesMap.set(fileKey, file);
  });

  return filesMap;
}

export function useControlBrandFilesData(fields?: ApiSchemas["Step"]["fields"]) {
  const brand_files_original = (parseNewDatasetValue(
    fields?.brand_files,
  ) ?? []) as ApiSchemas["BrandFileDto"][];

  return {
    brand_files: convertBrandFilesToFiles(brand_files_original),
  };
}
