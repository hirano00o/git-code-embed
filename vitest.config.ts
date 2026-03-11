import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["test/**/*.test.ts"],
  },
  define: {
    __THEME__: JSON.stringify("light"),
  },
});
