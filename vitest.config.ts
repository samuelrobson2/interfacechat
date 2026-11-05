import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import viteTsconfigPaths from "vite-tsconfig-paths";

// Vitest configuration for React Testing
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    viteTsconfigPaths(),
    tailwindcss(),
  ],
  test: {
    // Use jsdom environment for DOM testing
    environment: "jsdom",

    // Enable global test APIs (describe, it, expect, etc.)
    globals: true,

    // Setup file to run before all tests
    setupFiles: ["./src/app/vitest.setup.ts"],

    // Enable CSS processing in tests
    css: true,

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/test/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/index.ts",
        "**/*.test.{ts,tsx}",
        "**/_tests_/**",
      ],
    },

    // Test file patterns
    include: ["src/**/*.{test,spec}.{ts,tsx}"],

    // Clear mocks automatically between tests
    clearMocks: true,
    restoreMocks: true,
  },
});
