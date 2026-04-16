<script setup lang="ts">
import type { RedDividendCategory } from '../types'

const props = defineProps<{
  strategy: RedDividendCategory
}>()

const emit = defineEmits<{
  select: [categoryCode: RedDividendCategory['categoryCode']]
}>()

function handleSelect() {
  emit('select', props.strategy.categoryCode)
}

function handleSelectByKeyboard(event: KeyboardEvent) {
  if (event.key !== 'Enter' && event.key !== ' ')
    return

  event.preventDefault()
  handleSelect()
}
</script>

<template>
  <view
    class="overflow-hidden rd-soft-card rd-focus-ring"
    role="button"
    :aria-label="`查看${props.strategy.categoryName}详情`"
    tabindex="0"
    @click="handleSelect"
    @keydown="handleSelectByKeyboard"
  >
    <view class="relative h-[206rpx] overflow-hidden" :style="{ backgroundImage: props.strategy.coverImage }">
      <view class="rd-poster-overlay" />
      <view class="absolute inset-x-0 top-[88rpx] h-[42rpx] bg-white/18" />
      <view class="absolute left-[50%] top-[66rpx] h-[64rpx] w-[64rpx] rounded-full bg-black/66 shadow-[0_8rpx_20rpx_rgba(0,0,0,0.18)] -translate-x-[50%]" />
      <view class="absolute left-[50%] top-[52rpx] h-[14rpx] w-[14rpx] rounded-full bg-[#C88A38] -translate-x-[50%]" />
      <view class="absolute left-[50%] top-[24rpx] h-[132rpx] w-[22rpx] rounded-full bg-[#B7772B] -translate-x-[50%]" />
      <view class="absolute right-[22rpx] top-[26rpx] h-[72rpx] w-[72rpx] rounded-full bg-[#FFF1CB]/38 blur-[16rpx]" />
      <view class="absolute right-[16rpx] top-[16rpx] rd-hero-tag">
        {{ props.strategy.shortTag }}
      </view>
    </view>
    <view class="bg-rdPaper/84 px-[22rpx] py-[20rpx]">
      <text class="block text-sm text-primary font-700">
        {{ props.strategy.categoryName }}
      </text>
      <text class="mt-[10rpx] block text-xs text-secondary leading-[1.7]">
        {{ props.strategy.description }}
      </text>
    </view>
  </view>
</template>
