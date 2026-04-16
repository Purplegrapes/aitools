<script setup lang="ts">
import type { RedDividendCategory, RedDividendCategoryCode } from '../types'

const props = defineProps<{
  items: RedDividendCategory[]
  current: RedDividendCategoryCode
}>()

const emit = defineEmits<{
  select: [categoryCode: RedDividendCategoryCode]
}>()

const tabRefs = ref<HTMLElement[]>([])

const currentIndex = computed(() => {
  const index = props.items.findIndex(item => item.categoryCode === props.current)
  return index >= 0 ? index : 0
})

function focusTab(index: number) {
  tabRefs.value[index]?.focus()
}

function selectByIndex(index: number) {
  const nextItem = props.items[index]
  if (!nextItem)
    return
  emit('select', nextItem.categoryCode)
  nextTick(() => focusTab(index))
}

function handleKeydown(event: KeyboardEvent, index: number) {
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    event.preventDefault()
    selectByIndex((index + 1) % props.items.length)
    return
  }

  if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    event.preventDefault()
    selectByIndex((index - 1 + props.items.length) % props.items.length)
    return
  }

  if (event.key === 'Home') {
    event.preventDefault()
    selectByIndex(0)
    return
  }

  if (event.key === 'End') {
    event.preventDefault()
    selectByIndex(props.items.length - 1)
    return
  }

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    emit('select', props.items[index].categoryCode)
  }
}
</script>

<template>
  <view class="w-full" role="tablist" aria-label="红利策略分类切换">
    <view class="flex gap-[8rpx] border border-rdLine rounded-[30rpx] bg-[#F7F3EC] px-[8rpx] py-[8rpx] shadow-[0_12rpx_26rpx_rgba(61,46,28,0.06)]">
      <view
        v-for="(item, index) in props.items"
        :key="item.categoryCode"
        :ref="(el) => { if (el) tabRefs[index] = el as HTMLElement }"
        class="min-h-[52rpx] flex flex-1 items-center justify-center rounded-full px-[12rpx] py-[12rpx] text-center text-sm font-600 rd-focus-ring"
        :class="item.categoryCode === props.current
          ? 'border border-[#E7D9BF] bg-[#FFF6E7] text-[#7A4B00] shadow-[0_12rpx_22rpx_rgba(140,103,42,0.16)]'
          : 'border border-transparent bg-transparent text-secondary opacity-72'"
        role="tab"
        :aria-selected="item.categoryCode === props.current"
        :tabindex="index === currentIndex ? 0 : -1"
        @tap="emit('select', item.categoryCode)"
        @keydown="handleKeydown($event, index)"
      >
        {{ item.categoryName }}
      </view>
    </view>
  </view>
</template>
