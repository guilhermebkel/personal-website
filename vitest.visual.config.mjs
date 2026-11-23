import { fileURLToPath } from "node:url";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

// Why: same alias as vitest.config.mjs; the throwaway renders import components through it.
const alias = {
  "@": fileURLToPath(new URL("src", import.meta.url)),
  "@components": fileURLToPath(new URL("components", import.meta.url)),
  "@hooks": fileURLToPath(new URL("hooks", import.meta.url)),
  "@styles": fileURLToPath(new URL("styles", import.meta.url)),
};

// Why: the renders are throwaway files in test-results/ (gitignored), so this config is not part of `pnpm test`; it runs only from `pnpm visual:component`.
export default defineConfig({
  resolve: { alias },
  test: {
    include: ["test-results/visual-renders/**/*.tsx"],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
    },
  },
});
