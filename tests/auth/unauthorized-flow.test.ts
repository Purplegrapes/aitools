import assert from 'node:assert/strict'
import test from 'node:test'

import { resolveUnauthorizedFollowUp } from '../../src/api/core/unauthorized-flow.js'

test('refresh failure after mini program launch redirects back to host mini program', () => {
  const result = resolveUnauthorizedFollowUp({
    methodUrl: '/api/assets/list',
    errorMessage: '登录已过期，请重新登录！',
    isExternal: true,
    source: 'miniprogram',
    loginUrl: '/pages/login/index?from=h5',
  })

  assert.deepEqual(result, {
    shouldToast: true,
    externalRedirect: {
      source: 'miniprogram',
      loginUrl: '/pages/login/index?from=h5',
    },
  })
})

test('valuation and tools requests skip duplicate toast even when login expires', () => {
  const result = resolveUnauthorizedFollowUp({
    methodUrl: '/valuation-api/positions',
    errorMessage: '登录已过期，请重新登录！',
    isExternal: false,
    source: 'internal',
    loginUrl: '',
  })

  assert.deepEqual(result, {
    shouldToast: false,
    externalRedirect: null,
  })
})
