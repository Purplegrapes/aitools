// Import the core alova instance
import alovaInstance from './core/instance'

// Export the global Apis object from the generated code
import { createApis, withConfigType } from './createApis'

export * as assetApi from './modules/asset'
// Export API modules
export * as etfApi from './modules/etf'
export * as userApi from './modules/user'

// Export the alova instance for direct use if needed
export { alovaInstance }

// Configure method options for specific APIs
export const $$userConfigMap = withConfigType({})

// Create the global Apis object
const Apis = createApis(alovaInstance, $$userConfigMap)

// Export both default and named export for AutoImport
export default Apis
export { Apis }
