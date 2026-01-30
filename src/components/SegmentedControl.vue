<script setup lang="ts">
/**
 * 通用分段器组件
 * 使用 UnoCSS 实现的现代化分段选择器
 * 自动从主题 store 中获取主题色
 */
import { useManualThemeStore } from '@/store/manualThemeStore'

interface SegmentOption {
  label: string
  value: string
  disabled?: boolean
}

interface Props {
  /** 选项列表 */
  options: Array<string | SegmentOption>
  /** 当前选中的值 */
  modelValue: string
  /** 是否禁用 */
  disabled?: boolean
  /** 自定义激活状态颜色（不传则使用主题色） */
  activeColor?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  activeColor: undefined,
})

const emit = defineEmits<Emits>()

// 从主题 store 获取主题色
const themeStore = useManualThemeStore()

// 当前主题色（优先使用 prop，否则使用 store 中的主题色）
const currentActiveColor = computed(() => {
  if (props.activeColor) {
    return props.activeColor
  }
  return themeStore.themeVars.colorTheme || themeStore.currentThemeColor.primary || '#4D7FFF'
})

// 规范化选项为统一格式
const normalizedOptions = computed<SegmentOption[]>(() => {
  return props.options.map((option) => {
    if (typeof option === 'string') {
      return { label: option, value: option }
    }
    return option
  })
})

// 当前选中的索引
const currentIndex = computed(() => {
  return normalizedOptions.value.findIndex(item => item.value === props.modelValue)
})

// 激活状态的动态样式
const activeStyle = computed(() => {
  const color = currentActiveColor.value
  return {
    backgroundColor: color,
    boxShadow: `0 4px 12px ${color}40`,
  }
})

/**
 * 处理选项点击
 */
function handleItemClick(option: SegmentOption) {
  if (props.disabled || option.disabled) {
    return
  }
  emit('update:modelValue', option.value)
  emit('change', option.value)
}
</script>

<template>
  <view
    class="flex items-center gap-2 overflow-x-auto rounded-xl bg-white/80 p-1.5 shadow-sm backdrop-blur-sm"
    :class="{ 'opacity-50 pointer-events-none': disabled }"
  >
    <view
      v-for="(option, index) in normalizedOptions"
      :key="option.value"
      class="flex-1 whitespace-nowrap rounded-lg px-4 py-2 text-center text-sm transition-all duration-200 active:scale-95"
      :class="
        currentIndex === index
          ? 'font-semibold text-white'
          : 'text-slate-600 hover:bg-slate-100'
      "
      :style="currentIndex === index ? activeStyle : undefined"
      @tap="handleItemClick(option)"
    >
      {{ option.label }}
    </view>
  </view>
</template>

<style scoped>
/* 隐藏滚动条但保留滚动功能 */
.overflow-x-auto {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.overflow-x-auto::-webkit-scrollbar {
  display: none;
}
</style>
