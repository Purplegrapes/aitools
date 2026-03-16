// Import the core alova instance
import alovaInstance from './core/instance'

// Export the global Apis object from the generated code
import { createApis, withConfigType } from './createApis'

// Export API modules
// userApi 现在从 ETF 子包导出（父级导入优先）
export * as userApi from '../subPages/etf/api'
export * as toolsApi from '../subPages/tools/api'
export * as discoveryApi from './discovery'
// authApi 已移至 tamp 子包

// Export the alova instance for direct use if needed
export { alovaInstance }

// Configure method options for specific APIs
export const $$userConfigMap = withConfigType({})

// Create the global Apis object
const Apis = createApis(alovaInstance, $$userConfigMap)

// Export both default and named export for AutoImport
export default Apis
export { Apis }
