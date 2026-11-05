import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";
import viteTsconfigPaths from "vite-tsconfig-paths";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-themes"],
  framework: "@storybook/react-vite",
  viteFinal: async (config) => {
    config.plugins = [
      ...(config.plugins ?? []),
      tailwindcss(),
      viteTsconfigPaths(),
    ];
    return config;
  },
};

export default config;
