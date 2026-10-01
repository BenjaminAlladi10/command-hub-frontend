/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the Command Hub backend. Empty in the browser = Vite proxy to localhost:3000. */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
