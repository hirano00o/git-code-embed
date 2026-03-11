import * as esbuild from "esbuild";

const dark = process.argv.includes("--dark");
const theme = dark ? "dark" : "light";
const outfile = dark
  ? "dist/git-code-embed-dark.min.js"
  : "dist/git-code-embed.min.js";

esbuild
  .build({
    entryPoints: ["src/main.ts"],
    bundle: true,
    minify: true,
    format: "iife",
    outfile,
    target: ["es2020", "chrome80", "firefox78", "safari14"],
    platform: "browser",
    define: {
      __THEME__: JSON.stringify(theme),
    },
  })
  .then(() => {
    console.log(`Build complete: ${outfile}`);
  })
  .catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  });
