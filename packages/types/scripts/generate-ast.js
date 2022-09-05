#!/usr/bin/env node
const esbuild = require("esbuild");
const { execSync } = require("child_process");
const { rmdirSync } = require("fs");

esbuild
  .build({
    entryPoints: ["./scripts/generator/index.js"],
    external: ["mobx"],
    bundle: true,
    outfile: "./scripts/generator/dist/index.js",
    format: "cjs",
    target: ["esnext"],
    platform: "node",
  })
  .then(() => {
    execSync("node ./scripts/generator/dist/index.js");
    rmdirSync("./scripts/generator/dist/", { recursive: true });
    console.info("Schema types generated successfully!");
  })
  .catch(() => {
    console.error("Failed to generate Schema types");
    process.exit(1);
  });
