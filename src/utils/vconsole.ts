// #ifdef H5
import VConsole from 'vconsole'
// #endif

/**
 * 初始化 VConsole（仅 H5 环境）
 */
export function initVConsole() {
  // #ifdef H5
  if (import.meta.env.MODE === 'development') {
    // eslint-disable-next-line no-new
    new VConsole()
    console.log('[VConsole] 已启用')
  }
  // #endif
}
