import createRollupConfig from "../../rollup.config";

export default createRollupConfig({
  input: "./src/index.ts",
  output: [
    {
      file: "dist/index.js",
      format: "esm",
    },
  ],
});
