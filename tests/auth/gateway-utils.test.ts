import assert from 'node:assert/strict'
import test from 'node:test'

import {
  AUTH_GATEWAY_PATH,
  LEGACY_TAMP_GATEWAY_PATH,
  buildAuthGatewayRouteFromTarget,
  buildLegacyGatewayRedirectRoute,
  buildGatewayPassthroughQuery,
  hasRequiredGatewayParams,
  normalizeGatewayReferer,
  shouldExchangeTransferTicket,
  shouldWrapMiniProgramExternalAccess,
} from '../../src/subPages/auth/utils/gateway.js'

test('auth gateway constants expose the new and legacy entry paths', () => {
  assert.equal(AUTH_GATEWAY_PATH, '/subPages/auth/gateway')
  assert.equal(LEGACY_TAMP_GATEWAY_PATH, '/subPages/tamp/index')
})

test('gateway passthrough query strips appId while preserving required parameters', () => {
  const result = buildGatewayPassthroughQuery({
    from: 'miniapp',
    referer: encodeURIComponent('https://example.com/tools/demo?foo=1'),
    loginUrl: encodeURIComponent('https://example.com/login'),
    shopId: 'shop-1',
    transferH5Ticket: 'transfer-ticket',
    appId: 'should-be-dropped',
  })

  assert.deepEqual(result, {
    from: 'miniapp',
    referer: encodeURIComponent('https://example.com/tools/demo?foo=1'),
    loginUrl: encodeURIComponent('https://example.com/login'),
    shopId: 'shop-1',
    transferH5Ticket: 'transfer-ticket',
  })
})

test('legacy tamp gateway redirect only forwards passthrough query to auth gateway', () => {
  const result = buildLegacyGatewayRedirectRoute({
    from: 'miniapp',
    referer: encodeURIComponent('https://example.com/tools/demo?foo=1'),
    loginUrl: encodeURIComponent('https://example.com/login'),
    shopId: 'shop-1',
    transferH5Ticket: 'transfer-ticket',
    appId: 'should-be-dropped',
  })

  assert.deepEqual(result, {
    path: AUTH_GATEWAY_PATH,
    query: {
      from: 'miniapp',
      referer: encodeURIComponent('https://example.com/tools/demo?foo=1'),
      loginUrl: encodeURIComponent('https://example.com/login'),
      shopId: 'shop-1',
      transferH5Ticket: 'transfer-ticket',
    },
  })
})

test('miniapp external subPages target builds auth gateway route with encoded referer', () => {
  const result = buildAuthGatewayRouteFromTarget('/subPages/valuation-tool/index', {
    from: 'miniapp',
    foo: 'bar',
  })

  assert.deepEqual(result, {
    path: AUTH_GATEWAY_PATH,
    query: {
      from: 'miniapp',
      foo: 'bar',
      referer: encodeURIComponent('/subPages/valuation-tool/index?from=miniapp&foo=bar'),
    },
  })
})

test('tools targets keep targetUrl when wrapped by auth gateway route builder', () => {
  const result = buildAuthGatewayRouteFromTarget('/subPages/tools/demo', {
    from: 'miniapp',
    traceId: 'trace-1',
  })

  assert.deepEqual(result, {
    path: AUTH_GATEWAY_PATH,
    query: {
      from: 'miniapp',
      traceId: 'trace-1',
      referer: encodeURIComponent('/subPages/tools/demo?from=miniapp&traceId=trace-1'),
      targetUrl: '/subPages/tools/demo?from=miniapp&traceId=trace-1',
    },
  })
})

test('gateway referer accepts full website urls without project-page validation', () => {
  assert.equal(
    normalizeGatewayReferer(encodeURIComponent('https://example.com/tools/demo?foo=1')),
    'https://example.com/tools/demo?foo=1',
  )
})

test('gateway requires referer and transferH5Ticket', () => {
  assert.equal(hasRequiredGatewayParams({
    referer: encodeURIComponent('https://example.com/tools/demo?foo=1'),
    transferH5Ticket: 'transfer-ticket',
  }), true)

  assert.equal(hasRequiredGatewayParams({
    referer: encodeURIComponent('https://example.com/tools/demo?foo=1'),
  }), false)

  assert.equal(hasRequiredGatewayParams({
    transferH5Ticket: 'transfer-ticket',
  }), false)
})

test('miniapp wrapper skips auth gateway itself to avoid redirect loops', () => {
  assert.equal(shouldWrapMiniProgramExternalAccess('/subPages/valuation-tool/index', {
    from: 'miniapp',
  }), true)

  assert.equal(shouldWrapMiniProgramExternalAccess(AUTH_GATEWAY_PATH, {
    from: 'miniapp',
  }), false)

  assert.equal(shouldWrapMiniProgramExternalAccess(LEGACY_TAMP_GATEWAY_PATH, {
    from: 'miniapp',
  }), false)
})

test('transferH5Ticket exchange is only required for miniapp external flow', () => {
  assert.equal(shouldExchangeTransferTicket('miniprogram'), true)
  assert.equal(shouldExchangeTransferTicket('h5'), false)
  assert.equal(shouldExchangeTransferTicket('internal'), false)
})
