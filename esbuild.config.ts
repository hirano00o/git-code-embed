import * as esbuild from "esbuild";

esbuild
  .build({
    entryPoints: ["src/main.ts"],
    bundle: true,
    minify: true,
    format: "iife",
    outfile: "dist/git-code-embed.min.js",
    target: ["es2020", "chrome80", "firefox78", "safari14"],
    platform: "browser",
  })
  .then(() => {
    console.log("Build complete: dist/git-code-embed.min.js");
  })
  .catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  });
