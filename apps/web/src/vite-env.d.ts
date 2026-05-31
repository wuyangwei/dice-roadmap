/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_MODE?: 'display' | 'all';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
