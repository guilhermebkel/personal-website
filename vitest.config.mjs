import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Why: same alias as `paths` in tsconfig.json; Vite reads this one when bundling.
const alias = {
  "@": fileURLToPath(new URL("src", import.meta.url)),
  "@components": fileURLToPath(new URL("components", import.meta.url)),
};

// Why: the Playwright specs run under `playwright test`, not under vitest.
const EXCLUDE = ["**/node_modules/**", "e2e/**", "out/**", ".next/**"];

export default defineConfig({
  resolve: { alias },
  test: {
    exclude: EXCLUDE,
    unstubGlobals: true,
    unstubEnvs: true,
  },
});
