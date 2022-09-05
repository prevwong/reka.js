module.exports = {
  extends: ["turbo", "prettier"],
  rules: {
    "no-console": 1,
    "import/no-unresolved": 2,
    "import/order": [
      "error",
      {
        alphabetize: { order: "asc" },
        "newlines-between": "always",
        groups: ["builtin", "external", "internal", "sibling", "index"],
        pathGroups: [{ pattern: "*", group: "external" }],
      },
    ],
  },
};
