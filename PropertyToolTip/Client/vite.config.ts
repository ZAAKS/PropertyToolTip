import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Plugin, PreRenderedChunk } from "vite";
import { defineConfig } from "vite";

const rootDir = dirname(fileURLToPath(import.meta.url));

const manifestOutPath = resolve(rootDir, "../wwwroot/App_Plugins/PropertyToolTip/umbraco-package.json");

/** Unique per Vite run — applied to entry + shared chunk filenames; manifest entry URLs are patched to match. */
function shortBuildSuffix(): string {
  // 6 chars, mixed [0-9a-z], stable for one build run.
  // Generate extra entropy, then strip to alnum and trim.
  const token = randomBytes(12)
    .toString("base64url")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
  return (token.length >= 6 ? token.slice(0, 6) : `${token}000000`.slice(0, 6));
}
const buildSuffix = shortBuildSuffix();

function isSettingsSharedChunk(chunk: PreRenderedChunk): boolean {
  if (chunk.name === "settings") return true;
  const facade = chunk.facadeModuleId?.replace(/\\/g, "/");
  if (facade?.includes("/src/settings")) return true;
  return false;
}

/**
 * Rewrites manifest script paths so they match Rollup output:
 * `property-tooltip-<suffix>.js`, `property-tooltip-dashboard-<suffix>.js`.
 */
function manifestEntrySuffixPlugin(): Plugin {
  return {
    name: "property-tooltip-manifest-entry-suffix",
    closeBundle() {
      const raw = readFileSync(manifestOutPath, "utf8");
      const manifest = JSON.parse(raw) as {
        extensions?: Array<{ js?: string; element?: string }>;
      };

      const rewrite = (url: string | undefined): string | undefined => {
        if (typeof url !== "string") return url;
        const [pathOnly] = url.split("?");
        if (pathOnly.endsWith("/property-tooltip.js")) {
          return `${pathOnly.slice(0, -"property-tooltip.js".length)}property-tooltip-${buildSuffix}.js`;
        }
        if (pathOnly.endsWith("/property-tooltip-dashboard.js")) {
          return `${pathOnly.slice(0, -"property-tooltip-dashboard.js".length)}property-tooltip-dashboard-${buildSuffix}.js`;
        }
        return url;
      };

      for (const ext of manifest.extensions ?? []) {
        if (ext.js) ext.js = rewrite(ext.js) ?? ext.js;
        if (ext.element) ext.element = rewrite(ext.element) ?? ext.element;
      }

      writeFileSync(manifestOutPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
    },
  };
}

export default defineConfig({
  plugins: [manifestEntrySuffixPlugin()],
  build: {
    lib: {
      entry: {
        "property-tooltip": resolve(rootDir, "src/entrypoint.ts"),
        "property-tooltip-dashboard": resolve(rootDir, "src/dashboard.ts"),
      },
      formats: ["es"],
      fileName: (_format, entryName) => {
        if (entryName === "property-tooltip" || entryName === "property-tooltip-dashboard") {
          return `${entryName}-${buildSuffix}.js`;
        }
        return `${entryName}.js`;
      },
    },
    outDir: "../wwwroot/App_Plugins/PropertyToolTip",
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      external: [/^@umbraco/],
      output: {
        chunkFileNames(chunkInfo) {
          if (isSettingsSharedChunk(chunkInfo)) {
            return `settings-${buildSuffix}.js`;
          }
          return "[name]-[hash].js";
        },
      },
    },
  },
});
