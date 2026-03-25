import assert from 'node:assert/strict'
import test from 'node:test'

import {
  AUTH_GATEWAY_PATH,
  buildAuthGatewayRouteFromTarget,
  buildGatewayPassthroughQuery,
  buildLegacyGatewayRedirectRoute,
  hasRequiredGatewayParams,
  LEGACY_TAMP_GATEWAY_PATH,
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
    referrer: encodeURIComponent('https://example.com/tools/demo?foo=1'),
    loginUrl: encodeURIComponent('https://example.com/login'),
    shopId: 'shop-1',
    transferH5Ticket: 'transfer-ticket',
    appId: 'should-be-dropped',
  })

  assert.deepEqual(result, {
    from: 'miniapp',
    referrer: encodeURIComponent('https://example.com/tools/demo?foo=1'),
    loginUrl: encodeURIComponent('https://example.com/login'),
    shopId: 'shop-1',
    transferH5Ticket: 'transfer-ticket',
  })
})

test('legacy tamp gateway redirect only forwards passthrough query to auth gateway', () => {
  const result = buildLegacyGatewayRedirectRoute({
    from: 'miniapp',
    referrer: encodeURIComponent('https://example.com/tools/demo?foo=1'),
    loginUrl: encodeURIComponent('https://example.com/login'),
    shopId: 'shop-1',
    transferH5Ticket: 'transfer-ticket',
    appId: 'should-be-dropped',
  })

  assert.deepEqual(result, {
    navType: 'replace',
    path: AUTH_GATEWAY_PATH,
    query: {
      from: 'miniapp',
      referrer: encodeURIComponent('https://example.com/tools/demo?foo=1'),
      loginUrl: encodeURIComponent('https://example.com/login'),
      shopId: 'shop-1',
      transferH5Ticket: 'transfer-ticket',
    },
  })
})

test('miniapp external subPages target builds auth gateway route with encoded referrer', () => {
  const result = buildAuthGatewayRouteFromTarget('/subPages/valuation-tool/index', {
    from: 'miniapp',
    foo: 'bar',
  })

  assert.deepEqual(result, {
    navType: 'replace',
    path: AUTH_GATEWAY_PATH,
    query: {
      from: 'miniapp',
      foo: 'bar',
      referrer: encodeURIComponent('/subPages/valuation-tool/index?foo=bar'),
    },
  })
})

test('tools targets keep targetUrl when wrapped by auth gateway route builder', () => {
  const result = buildAuthGatewayRouteFromTarget('/subPages/tools/demo', {
    from: 'miniapp',
    traceId: 'trace-1',
  })

  assert.deepEqual(result, {
    navType: 'replace',
    path: AUTH_GATEWAY_PATH,
    query: {
      from: 'miniapp',
      traceId: 'trace-1',
      referrer: encodeURIComponent('/subPages/tools/demo?traceId=trace-1'),
      targetUrl: '/subPages/tools/demo?traceId=trace-1',
    },
  })
})

test('auth gateway target referrer strips transient auth handoff query fields', () => {
  const result = buildAuthGatewayRouteFromTarget('/subPages/valuation-tool/holdings', {
    from: 'miniapp',
    transferH5Ticket: 'ticket-1',
    loginUrl: encodeURIComponent('https://example.com/login'),
    shopId: 'shop-1',
    appId: 'wx123',
    foo: 'bar',
  })

  assert.deepEqual(result.query.referrer, encodeURIComponent('/subPages/valuation-tool/holdings?foo=bar'))
})

test('gateway referrer accepts full website urls without project-page validation', () => {
  assert.equal(
    normalizeGatewayReferer(encodeURIComponent('https://example.com/tools/demo?foo=1')),
    'https://example.com/tools/demo?foo=1',
  )
})

test('gateway requires referrer and transferH5Ticket', () => {
  assert.equal(hasRequiredGatewayParams({
    referrer: encodeURIComponent('https://example.com/tools/demo?foo=1'),
    transferH5Ticket: 'transfer-ticket',
  }), true)

  assert.equal(hasRequiredGatewayParams({
    referrer: encodeURIComponent('https://example.com/tools/demo?foo=1'),
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
  assert.equal(shouldExchangeTransferTicket('miniprogram', 'token-1'), false)
  assert.equal(shouldExchangeTransferTicket('h5'), false)
  assert.equal(shouldExchangeTransferTicket('internal'), false)
})
