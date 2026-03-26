import assert from 'node:assert/strict'
import test from 'node:test'

import { createPinia, setActivePinia } from 'pinia'
import { useEtfUserStore } from '../../src/store/etfUserStore.js'

test('shared auth store writes token and login state consistently', () => {
  setActivePinia(createPinia())
  const store = useEtfUserStore()

  store.setAuthTokens('access-token', 'refresh-token')
  store.setUserInfo({ id: 'user-1', nickname: 'Tester' })

  assert.equal(store.token, 'access-token')
  assert.equal(store.refreshToken, 'refresh-token')
  assert.equal(store.isLogin, true)
  assert.deepEqual(store.userInfo, { id: 'user-1', nickname: 'Tester' })
})

test('logout clears shared auth state for subsequent guarded access', () => {
  setActivePinia(createPinia())
  const store = useEtfUserStore()

  store.setAuthTokens('access-token', 'refresh-token')
  store.setUserInfo({ id: 'user-1', nickname: 'Tester' })
  store.logout()

  assert.equal(store.token, '')
  assert.equal(store.refreshToken, '')
  assert.equal(store.isLogin, false)
  assert.equal(store.userInfo, null)
})
