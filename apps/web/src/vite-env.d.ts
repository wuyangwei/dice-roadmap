/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_MODE?: 'mobile' | 'display' | 'admin';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
