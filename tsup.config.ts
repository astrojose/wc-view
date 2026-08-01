import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    "bin/wc-view": "src/cli/index.ts",
    "server/index": "src/server/index.ts",
    "client/main": "src/client/main.ts"
  },
  format: ["esm"],
  target: "node18",
  clean: true,
  dts: false,
  sourcemap: true,
  minify: false,
  noExternal: ["marked", "mermaid"]
});
