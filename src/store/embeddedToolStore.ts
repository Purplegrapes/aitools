import { defineStore } from 'pinia'

export interface EmbeddedToolState {
  targetUrl: string
  traceId: string
  isEmbedded: boolean
  bridgeReady: boolean
  sessionReady: boolean
  enteredAt: number
  lastAuthError: string
}

export const useEmbeddedToolStore = defineStore('embedded-tool', {
  state: (): EmbeddedToolState => ({
    targetUrl: '',
    traceId: '',
    isEmbedded: false,
    bridgeReady: false,
    sessionReady: false,
    enteredAt: 0,
    lastAuthError: '',
  }),

  getters: {
    canEnterTool: state => state.sessionReady && !!state.targetUrl,
    needsReauth: state => state.isEmbedded && !state.sessionReady,
  },

  actions: {
    setLaunchContext(payload: { targetUrl: string, traceId: string, isEmbedded: boolean }) {
      this.targetUrl = payload.targetUrl
      this.traceId = payload.traceId
      this.isEmbedded = payload.isEmbedded
      this.enteredAt = Date.now()
      this.lastAuthError = ''
    },

    setSessionReady(ready: boolean) {
      this.sessionReady = ready
    },

    setBridgeReady(ready: boolean) {
      this.bridgeReady = ready
    },

    setAuthError(message: string) {
      this.lastAuthError = message
      this.sessionReady = false
    },

    clearContext() {
      this.targetUrl = ''
      this.traceId = ''
      this.isEmbedded = false
      this.bridgeReady = false
      this.sessionReady = false
      this.enteredAt = 0
      this.lastAuthError = ''
    },
  },
})
