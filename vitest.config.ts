import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: [resolve(__dirname, "./src/setup-tests.ts")],
    alias: {
      "~": resolve(__dirname, "./src"),
    },
  },
});
