import type { PortfolioRecognitionDraft, PortfolioRecognitionState } from '../types'

interface PortfolioRecognitionSession {
  selectedImageNames: string[]
  drafts: PortfolioRecognitionDraft[]
  recognitionState: Exclude<PortfolioRecognitionState, 'recognizing' | 'idle'>
  recognitionError: string
}

const recognitionSessionState = shallowRef<PortfolioRecognitionSession | null>(null)
const PORTFOLIO_RECOGNITION_SESSION_KEY = 'valuationToolRecognitionSession'

export function setPortfolioRecognitionSession(session: PortfolioRecognitionSession) {
  recognitionSessionState.value = session
  uni.setStorageSync(PORTFOLIO_RECOGNITION_SESSION_KEY, session)
}

export function consumePortfolioRecognitionSession() {
  const memorySession = recognitionSessionState.value
  recognitionSessionState.value = null
  if (memorySession) {
    uni.removeStorageSync(PORTFOLIO_RECOGNITION_SESSION_KEY)
    return memorySession
  }

  const storedSession = uni.getStorageSync(PORTFOLIO_RECOGNITION_SESSION_KEY)
  if (!storedSession || typeof storedSession !== 'object')
    return null

  uni.removeStorageSync(PORTFOLIO_RECOGNITION_SESSION_KEY)
  return storedSession as PortfolioRecognitionSession
}
