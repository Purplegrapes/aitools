import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildPortfolioDeleteConfirmMessage,
  getPortfolioDeleteErrorMessage,
  isPortfolioDeleteSuccess,
} from '../../src/subPages/valuation-tool/position-actions.js'

test('portfolio delete treats code 0 as successful response', () => {
  assert.equal(isPortfolioDeleteSuccess({ code: 0 }), true)
  assert.equal(isPortfolioDeleteSuccess({ code: 200 }), false)
})

test('portfolio delete confirm message includes fund name', () => {
  assert.equal(
    buildPortfolioDeleteConfirmMessage('中证红利ETF'),
    '确认删除“中证红利ETF”这条持仓吗？删除后需要重新同步或手动录入才能恢复。',
  )
})

test('portfolio delete prefers backend message when building error text', () => {
  assert.equal(
    getPortfolioDeleteErrorMessage({ message: '持仓不存在' }),
    '持仓不存在',
  )
  assert.equal(
    getPortfolioDeleteErrorMessage({ msg: '删除失败' }),
    '删除失败',
  )
  assert.equal(
    getPortfolioDeleteErrorMessage({}),
    '删除持仓失败，请稍后再试。',
  )
})
