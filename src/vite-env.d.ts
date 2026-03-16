/**
 * Vite 环境变量类型声明
 * 用于解决条件编译中的类型问题
 */

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_ASSET_API_BASE_URL: string
  readonly VITE_TAMP_API_BASE_URL: string
  readonly VITE_TOOLS_API_BASE_URL: string
  readonly VITE_ENV_NAME: string
  readonly MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
