import path from "path";
import { defineConfig } from "tsup";

// All paths are absolute via __dirname so this config works from any cwd
export default defineConfig({
  entry: {
    index: path.resolve(__dirname, "index.ts"),
  },
  outDir: path.resolve(__dirname, "dist"),
  format: ["esm", "cjs"],
  tsconfig: path.resolve(__dirname, "tsconfig.json"),
  // Selectively inline types from packages that don't export them properly (e.g. sonner's PromiseExternalToast)
  dts: { resolve: ["sonner"] },
  clean: true,
  sourcemap: true,
  treeshake: true,
  // clsx, tailwind-merge, class-variance-authority are bundled to reduce peer dep surface
  external: [
    "react",
    "react/jsx-runtime",
    "react-dom",
    "@radix-ui/react-accordion",
    "@radix-ui/react-avatar",
    "@radix-ui/react-checkbox",
    "@radix-ui/react-collapsible",
    "@radix-ui/react-dialog",
    "@radix-ui/react-dropdown-menu",
    "@radix-ui/react-label",
    "@radix-ui/react-popover",
    "@radix-ui/react-progress",
    "@radix-ui/react-radio-group",
    "@radix-ui/react-scroll-area",
    "@radix-ui/react-select",
    "@radix-ui/react-separator",
    "@radix-ui/react-slider",
    "@radix-ui/react-slot",
    "@radix-ui/react-switch",
    "@radix-ui/react-tabs",
    "@radix-ui/react-tooltip",
    "lucide-react",
    "lottie-react",
    "cmdk",
    "embla-carousel-react",
    "input-otp",
    "react-day-picker",
    "react-dropzone",
    "recharts",
    "sonner",
    "date-fns",
    "next-themes",
    "@base-ui/react",
  ],
  esbuildOptions(options) {
    options.alias = {
      // Resolves @/ to app/src/ — same as tsconfig paths
      "@": path.resolve(__dirname, "../../.."),
    };
  },
  loader: {
    // Inline lottie JSON animation files
    ".json": "json",
  },
});
