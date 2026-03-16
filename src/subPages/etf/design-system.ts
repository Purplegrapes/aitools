/**
 * ETF 金融科技设计系统 - 浅色主题
 * 简约高级的金融数据展示规范
 */

/**
 * 颜色系统
 */
export const colors = {
  // 主色调 - 深空蓝系列
  primary: {
    50: '#E6F0FF',
    100: '#B3D1FF',
    200: '#80B0FF',
    300: '#4D90FF',
    400: '#1A70FF',
    500: '#0A4FE5', // 主色
    600: '#0840B8',
    700: '#06318A',
    800: '#04225C',
    900: '#02132E',
  },

  // 强调色 - 科技青
  accent: {
    light: '#2DF5D7',
    DEFAULT: '#00D4AA',
    dark: '#00A888',
  },

  // 品牌金 - 用于 VIP/重要数据
  gold: {
    light: '#FFE566',
    DEFAULT: '#FFD700',
    dark: '#CCAC00',
  },

  // 涨跌色
  rise: '#FF4D4F',
  fall: '#00C853',
  neutral: '#8A95A1',

  // 背景色 - 浅色主题
  bg: {
    primary: '#FFFFFF', // 白色主背景
    secondary: '#F8FAFC', // 浅灰次级背景
    card: '#FFFFFF', // 卡片白色背景
    elevated: '#FFFFFF', // 悬浮背景
  },

  // 文字色 - 浅色主题
  text: {
    primary: '#1F2937', // 深灰主文字
    secondary: '#64748B', // 中灰次要文字
    tertiary: '#94A3B8', // 浅灰提示文字
    inverse: '#FFFFFF',
  },

  // 边框色 - 浅色主题
  border: {
    subtle: 'rgba(0, 0, 0, 0.04)',
    default: 'rgba(0, 0, 0, 0.08)',
    strong: 'rgba(0, 0, 0, 0.12)',
  },
} as const

/**
 * 渐变色
 */
export const gradients = {
  // 主渐变
  primary: 'linear-gradient(135deg, #0A4FE5 0%, #00D4AA 100%)',
  gold: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)',
  rise: 'linear-gradient(135deg, #FF6B6B 0%, #FF4D4F 100%)',
  fall: 'linear-gradient(135deg, #00E676 0%, #00C853 100%)',

  // 玻璃态背景 - 浅色主题
  glass: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.95) 100%)',
  glassLight: 'linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.4) 100%)',

  // 图表渐变
  chart: {
    blue: 'linear-gradient(180deg, rgba(10, 79, 229, 0.3) 0%, rgba(10, 79, 229, 0) 100%)',
    gold: 'linear-gradient(180deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 215, 0, 0) 100%)',
    rise: 'linear-gradient(180deg, rgba(255, 77, 79, 0.3) 0%, rgba(255, 77, 79, 0) 100%)',
    fall: 'linear-gradient(180deg, rgba(0, 200, 83, 0.3) 0%, rgba(0, 200, 83, 0) 100%)',
  },
} as const

/**
 * 阴影系统 - 浅色主题
 */
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',

  // 发光效果
  glow: {
    blue: '0 0 20px rgba(10, 79, 229, 0.3)',
    gold: '0 0 20px rgba(255, 215, 0, 0.3)',
    accent: '0 0 20px rgba(0, 212, 170, 0.3)',
  },
} as const

/**
 * 圆角系统
 */
export const borderRadius = {
  sm: '8rpx',
  DEFAULT: '12rpx',
  md: '16rpx',
  lg: '24rpx',
  xl: '32rpx',
  full: '9999rpx',
} as const

/**
 * 间距系统
 */
export const spacing = {
  'xs': '8rpx',
  'sm': '12rpx',
  'md': '16rpx',
  'lg': '24rpx',
  'xl': '32rpx',
  '2xl': '48rpx',
} as const

/**
 * 字体大小
 */
export const fontSize = {
  'xs': '20rpx',
  'sm': '24rpx',
  'base': '28rpx',
  'md': '32rpx',
  'lg': '36rpx',
  'xl': '40rpx',
  '2xl': '48rpx',
  '3xl': '56rpx',
} as const

/**
 * 动画时长
 */
export const duration = {
  fast: '150ms',
  base: '200ms',
  slow: '300ms',
} as const

/**
 * UnoCSS 工具类映射 - 浅色主题
 */
export const ui = {
  // 卡片样式
  card: 'bg-white rounded-2xl border border-black/[0.08] shadow-sm',
  cardElevated: 'bg-white rounded-2xl border border-black/[0.08] shadow-md',

  // 文字样式
  textPrimary: 'text-[#1F2937]',
  textSecondary: 'text-[#64748B]',
  textTertiary: 'text-[#94A3B8]',

  // 数据样式
  dataValue: 'font-["SF_Mono", "Monaco", "Consolas", monospace] tabular-nums',

  // 涨跌色
  textRise: 'text-[#FF4D4F]',
  textFall: 'text-[#00C853]',

  // 渐变文字
  gradientText: 'bg-gradient-to-r from-[#0A4FE5] to-[#00D4AA] bg-clip-text text-transparent',
  gradientTextGold: 'bg-gradient-to-r from-[#FFD700] to-[#FF8C00] bg-clip-text text-transparent',

  // 玻璃态 - 浅色主题
  glass: 'bg-white/80 backdrop-blur-xl border border-black/[0.08]',
  glassStrong: 'bg-white/90 backdrop-blur-xl border border-black/[0.12]',
} as const

/**
 * 图表配色
 */
export const chartColors = {
  primary: '#0A4FE5',
  accent: '#00D4AA',
  gold: '#FFD700',
  rise: '#FF4D4F',
  fall: '#00C853',

  // 多系列配色
  series: [
    '#0A4FE5',
    '#00D4AA',
    '#FFD700',
    '#FF6B6B',
    '#4ECDC4',
    '#A78BFA',
    '#F472B6',
  ],
} as const

/**
 * 估值状态配色 - 浅色主题优化
 */
export const valuationStatus = {
  low: {
    label: '低估',
    bg: 'rgba(0, 200, 83, 0.1)',
    text: '#00C853',
    border: 'rgba(0, 200, 83, 0.2)',
  },
  medium: {
    label: '适中',
    bg: 'rgba(255, 193, 7, 0.1)',
    text: '#F59E0B',
    border: 'rgba(255, 193, 7, 0.2)',
  },
  high: {
    label: '高估',
    bg: 'rgba(255, 77, 79, 0.1)',
    text: '#FF4D4F',
    border: 'rgba(255, 77, 79, 0.2)',
  },
} as const

/**
 * 辅助函数：获取涨跌颜色
 */
export function getRiseFallColor(value: number | null | undefined): string {
  if (value === null || value === undefined)
    return colors.neutral
  if (value > 0)
    return colors.rise
  if (value < 0)
    return colors.fall
  return colors.neutral
}

/**
 * 辅助函数：获取涨跌 UnoCSS 类
 */
export function getRiseFallClass(value: number | null | undefined): string {
  const color = getRiseFallColor(value)
  if (color === colors.rise)
    return 'text-[#FF4D4F]'
  if (color === colors.fall)
    return 'text-[#00C853]'
  return 'text-[#8A95A1]'
}
