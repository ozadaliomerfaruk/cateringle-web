module.exports = {
  // ...
  overrides: [
    {
      files: ["src/types/database.ts"],
      rules: {
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/ban-types": "off",
      },
    },
  ],
};
