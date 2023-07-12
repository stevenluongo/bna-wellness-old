const config = {
  plugins: ["@typescript-eslint"],
  extends: ["plugin:@typescript-eslint/recommended", "next"],
  parser: "@typescript-eslint/parser",
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      parserOptions: {
        project: ["./tsconfig.json"],
      },
    },
  ],
  rules: {
    "@typescript-eslint/no-explicit-any": "error",
    "import/no-extraneous-dependencies": "off",
    "jsx-a11y/media-has-caption": "off",
    "no-console": "off",
    "import/extensions": "off",
    "react/function-component-definition": "off",
    "react/jsx-props-no-spreading": "off",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "off",
  },
};

module.exports = config;
