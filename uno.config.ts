import { presetUni } from '@uni-helper/unocss-preset-uni'

import {
  defineConfig,
  presetIcons,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  theme: {
    borderRadius: {
      card: '16rpx',
      panel: '16rpx',
    },
    colors: {
      primary: '#1D2129',
      regular: '#4E5969',
      secondary: '#8A95A1',
      tertiary: '#BBBFCB',
      disabled: '#C9CDD4',
      inverse: '#FFFFFF',
      page: '#F5F7FA',
      surface: '#FFFFFF',
      surfaceMuted: '#F2F5FA',
      surfaceSubtle: '#F8FAFD',
      line: '#E5EAF1',
      brand: '#1678FF',
      brandMuted: '#E8F1FF',
      info: '#1890FF',
      success: '#1AAE52',
      warning: '#FF7A00',
      danger: '#F02D30',
      blue: '#1890FF',
      red: '#F02D30',
      green: '#1AAE52',
      tag: '#7894da',
      rdGold: '#C78A31',
      rdHeroBlack: '#121212',
    },
  },
  presets: [
    presetUni({
      attributify: false,
    }),
    presetIcons({
      scale: 1.2,
      warn: true,
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
      // HBuilderX 必须针对要使用的 Collections 做异步导入
      // collections: {
      //   carbon: () => import('@iconify-json/carbon/icons.json').then(i => i.default),
      // },
    }),
  ],
  shortcuts: {
    'vt-action-bar': 'fixed inset-x-0 bottom-0 z-20 bg-surface/96 vt-page-x pb-[calc(env(safe-area-inset-bottom)+20rpx)] pt-[16rpx] shadow-[0_-8rpx_30rpx_rgba(17,37,62,0.06)] backdrop-blur-[20rpx]',
    'vt-action-primary': 'h-[88rpx] flex items-center justify-center gap-[12rpx] rounded-[20rpx] bg-brand px-[24rpx] text-[26rpx] text-inverse font-600 shadow-[0_16rpx_34rpx_rgba(22,120,255,0.24)]',
    'vt-action-secondary': 'h-[88rpx] flex items-center justify-center gap-[10rpx] rounded-[20rpx] bg-surfaceSubtle px-[22rpx] text-[24rpx] text-primary font-600',
    'vt-action-secondary-weak': 'h-[88rpx] flex flex-col items-center justify-center gap-[6rpx] rounded-[20rpx] bg-surfaceSubtle/78 px-[12rpx] text-[20rpx] text-secondary font-500 leading-[1.2]',
    'vt-risk-note': 'px-[8rpx] py-[8rpx] text-center',
    'vt-risk-note-text': 'block text-[22rpx] text-secondary leading-[36rpx] text-center',
    'vt-page-shell': 'px-[24rpx] pt-[24rpx]',
    'vt-page-x': 'px-[30rpx]',
    'vt-top-card': 'border border-line/70 rounded-[20rpx] bg-surface shadow-[0_20rpx_48rpx_rgba(17,37,62,0.06)]',
    'vt-card': 'rounded-card px-[24rpx] py-[24rpx]',
    'vt-card-tight': 'rounded-card px-[24rpx] py-[20rpx]',
    'vt-panel': 'rounded-panel px-[24rpx] py-[24rpx]',
    'vt-panel-tight': 'rounded-panel px-[22rpx] py-[22rpx]',
    'rd-page-shell': 'relative px-[20rpx] pb-[80rpx] pt-[18rpx]',
    'rd-card': 'rounded-[34rpx] bg-surface px-[24rpx] py-[24rpx] shadow-[0_14rpx_30rpx_rgba(17,37,62,0.04)]',
    'rd-panel': 'rounded-[38rpx] bg-surface px-[24rpx] py-[24rpx] shadow-[0_16rpx_36rpx_rgba(17,37,62,0.04)]',
    'rd-panel-soft': 'rounded-[36rpx] bg-surface px-[28rpx] py-[28rpx] shadow-[0_18rpx_38rpx_rgba(17,37,62,0.05)]',
    'rd-chip': 'rounded-full bg-[#F3EFE8] px-[14rpx] py-[8rpx] text-xs text-secondary',
    'rd-chip-hero': 'rounded-full bg-white/16 px-[14rpx] py-[8rpx] text-xs text-white',
    'rd-tag-gold': 'rounded-full bg-[#F5EDE0] px-[18rpx] py-[8rpx] text-sm text-[#C78A31] font-600',
    'rd-cta-card': 'border border-[#EDE7DE] rounded-[30rpx] bg-surface px-[24rpx] py-[22rpx] shadow-[0_16rpx_34rpx_rgba(42,34,23,0.04)]',
  },
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
})
