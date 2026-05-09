// Filesystem alias reference — documents the import aliases configured in vite.config.js.
// This file is informational; Vite resolves aliases at build time, not at runtime.
//
// Alias map:
//   @/           → src/
//   @/app        → src/app/
//   @/config     → src/config/
//   @/shared     → src/shared/
//   @/features   → src/features/
//   @/styles     → src/styles/
//   @/lib        → src/lib/
//
// Legacy aliases (preserved for backwards compatibility):
//   @layout      → src/layout/
//   @components  → src/components/
//   @pages       → src/pages/
//   @routes      → src/routes/
//   @data        → src/data/
//   @utils       → src/utils/
//   @context     → src/context/

export const PATH_ALIASES = {
  "@/":         "src/",
  "@/app":      "src/app/",
  "@/config":   "src/config/",
  "@/shared":   "src/shared/",
  "@/features": "src/features/",
  "@/styles":   "src/styles/",
  "@/lib":      "src/lib/",
};
