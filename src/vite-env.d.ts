/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the Command Hub backend. Empty = same origin. */
  readonly VITE_API_BASE_URL?: string;
  /** "false" to call the real backend; anything else uses the isolated mock layer. */
  readonly VITE_USE_MOCK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
