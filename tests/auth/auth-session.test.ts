import assert from 'node:assert/strict'
import test from 'node:test'

import {
  extractAuthSessionPayload,
  extractAuthUserProfile,
} from '../../src/subPages/auth/utils/authSession.js'

const transformTicketVerifyResponse = {
  user: {
    id: '71150907380727808',
    wechat_open_id: 'oz8lK1_xvZ3qucaVyfX14M5xxn94',
    nickname: '琼2',
    avatar_url: 'data:image/jpeg;base64,test',
    wechat_union_id: 'ojDTS6wtbE0ueMXpoOZxtuALG7gY',
    phone: null,
    has_binding: false,
  },
  user_id: '71150907380727808',
  system_key: 'shixi_guid',
  expires_at: '2026-03-26T04:00:02.303128+00:00',
  access_token: 'access-token-value',
  refresh_token: 'refresh-token-value',
  token_type: 'Bearer',
  expires_in: 604800,
}

test('extractAuthSessionPayload reads auth session from transform-ticket verify response', () => {
  const result = extractAuthSessionPayload(transformTicketVerifyResponse)

  assert.deepEqual(result, {
    token: 'access-token-value',
    refreshToken: 'refresh-token-value',
    tokenType: 'Bearer',
    expiresIn: 604800,
    userInfo: transformTicketVerifyResponse.user,
  })
})

test('extractAuthUserProfile reads nested user profile from transform-ticket verify response', () => {
  const result = extractAuthUserProfile(transformTicketVerifyResponse)

  assert.deepEqual(result, transformTicketVerifyResponse.user)
})
