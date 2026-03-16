import type { Method } from 'alova'
import AdapterUniapp from '@alova/adapter-uniapp'
import { createAlova } from 'alova'
import vueHook from 'alova/vue'
import { handleAlovaError, handleAlovaResponse } from './core/handlers'
import mockAdapter from './mock/mockAdapter'

const DISCOVERY_BASE_URL = 'https://ai.firstindex.cn'
const DISCOVERY_API_KEY = 'BA-48f9db36-6667-4244-8148-294292142d1c'
const DISCOVERY_PROXY_PREFIX = '/discovery-api'

function createDiscoveryPath(path: string) {
  return `${DISCOVERY_PROXY_PREFIX}${path}`
}

const discoveryAlova = createAlova({
  baseURL: '',
  ...AdapterUniapp({
    mockRequest: mockAdapter,
  }),
  statesHook: vueHook,
  beforeRequest: (method: Method) => {
    if (method.url.startsWith(DISCOVERY_PROXY_PREFIX)) {
      // #ifndef H5
      method.url = `${DISCOVERY_BASE_URL}${method.url.replace(DISCOVERY_PROXY_PREFIX, '')}`
      // #endif
    }

    method.config.headers['X-API-Key'] = DISCOVERY_API_KEY

    if (method.type === 'GET' && CommonUtil.isObj(method.config.params)) {
      method.config.params._t = Date.now()
    }

    if (import.meta.env.MODE === 'development') {
      console.log(`[Discovery API] ${method.type} ${method.url}`, method.config.params)
    }
  },
  responded: {
    onSuccess: handleAlovaResponse,
    onError: handleAlovaError,
  },
  timeout: 60000,
  cacheFor: null,
})

export interface DiscoveryEndpoint {
  name: string
  description: string
  path: string
}

export interface DiscoveryCatalog {
  name: string
  description_for_model: string
  endpoints: DiscoveryEndpoint[]
}

export interface FundValuationPayload {
  code: string
  name: string
  offChangeNetValue: number
  valuation: number
  ratio: number
}

export function getDiscoveryCatalog() {
  return discoveryAlova.Get<DiscoveryCatalog>(createDiscoveryPath('/api/discovery'))
}

export function getFundValuation(code: string) {
  return discoveryAlova.Get<FundValuationPayload>(createDiscoveryPath(`/api/fund/valuation/${code}`))
}
