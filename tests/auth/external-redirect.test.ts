import assert from 'node:assert/strict'
import test from 'node:test'

import { handleExternalRedirect } from '../../src/subPages/auth/utils/externalRedirect.js'

test('miniprogram external redirect sends host mini program to provided loginUrl', async () => {
  const redirectCalls: Array<{ url: string, fail?: () => void }> = []
  let confirmInvoked = false

  globalThis.useGlobalMessage = () => ({
    confirm: () => {
      confirmInvoked = true
    },
  })

  globalThis.wx = {
    miniProgram: {
      redirectTo(options: { url: string, fail?: () => void }) {
        redirectCalls.push(options)
      },
    },
  } as any

  await handleExternalRedirect('miniprogram', '/pages/login/index?from=h5')

  assert.equal(confirmInvoked, false)
  assert.deepEqual(redirectCalls, [
    {
      url: '/pages/login/index?from=h5',
      fail: redirectCalls[0]?.fail,
    },
  ])
})

test('miniprogram external redirect falls back to host index page when loginUrl is missing', async () => {
  const redirectCalls: Array<{ url: string, fail?: () => void }> = []

  globalThis.useGlobalMessage = () => ({
    confirm: () => {},
  })

  globalThis.wx = {
    miniProgram: {
      redirectTo(options: { url: string, fail?: () => void }) {
        redirectCalls.push(options)
      },
    },
  } as any

  await handleExternalRedirect('miniprogram')

  assert.deepEqual(redirectCalls, [
    {
      url: '/pages/index/index',
      fail: redirectCalls[0]?.fail,
    },
  ])
})
