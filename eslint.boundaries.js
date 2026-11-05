import boundaries from "eslint-plugin-boundaries";

export const eslintBoundariesConfig = {
  plugins: {
    boundaries,
  },
  settings: {
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
      },
    },

    "boundaries/elements": [
      {
        type: "app",
        pattern: "./src/app",
      },
      {
        type: "features",
        pattern: "./src/features/*",
      },
      {
        type: "services",
        pattern: "./src/services/*",
      },
      {
        type: "shared",
        pattern: "./src/shared/*",
      },
    ],
  },
  rules: {
    "boundaries/element-types": [
      2,
      {
        default: "allow",
        rules: [
          {
            from: "shared",
            disallow: ["app", "features", "services"],
            message:
              "Lower layer module (${file.type}) cannot import upper layer module (${dependency.type})",
          },
          {
            from: "services",
            disallow: ["app", "features"],
            message:
              "Lower layer module (${file.type}) cannot import upper layer module (${dependency.type})",
          },
          {
            from: "features",
            disallow: ["app"],
            message:
              "Lower layer module (${file.type}) cannot import upper layer module (${dependency.type})",
          },
        ],
      },
    ],
    "boundaries/entry-point": [
      2,
      {
        default: "disallow",
        message:
          "Module (${file.type}) must be imported through public API. Direct import from ${dependency.source} is not allowed",

        rules: [
          {
            target: ["app", "shared"],
            allow: "**",
          },
          {
            target: ["features"],
            allow: ["index.(ts|tsx)", "*.page.tsx"],
          },
          {
            target: ["services"],
            allow: ["index.(ts|tsx)"],
          },
        ],
      },
    ],
  },
};
