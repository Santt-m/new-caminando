// Fallback mínimo para evitar errores si no están instalados los tipos de Vite.
// Reemplazar por los tipos oficiales de Vite cuando se ejecute npm install.

declare module 'vite/client' {
  interface ImportMetaEnv {
    readonly VITE_API_URL?: string;
    [key: string]: string | boolean | number | undefined;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
