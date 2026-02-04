/**
 * TAMP 子包 - 来源检测工具
 */

/**
 * 外部来源类型
 */
export type ExternalSourceType = 'miniprogram' | 'h5' | 'internal'

/**
 * 访问模式检测结果
 */
export interface AccessModeDetection {
  mode: 'external' | 'internal'
  source: ExternalSourceType
}

/**
 * 检测访问模式
 */
export function detectAccessMode(query: Record<string, any>): AccessModeDetection {
  // 小程序跳入
  if (query.from === 'miniapp')
    return { mode: 'external', source: 'miniprogram' }

  // H5跳入
  if (query.from === 'h5')
    return { mode: 'external', source: 'h5' }

  // 内部访问
  return { mode: 'internal', source: 'internal' }
}
