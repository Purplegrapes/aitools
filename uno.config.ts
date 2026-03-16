import { presetUni } from '@uni-helper/unocss-preset-uni'

import {
  defineConfig,
  presetIcons,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  theme: {
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
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
})
