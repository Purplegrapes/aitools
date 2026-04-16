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
    class="overflow-hidden rd-soft-card-lg rd-focus-ring"
    role="button"
    :aria-label="`查看${props.strategy.categoryName}详情`"
    tabindex="0"
    @click="handleSelect"
    @keydown="handleSelectByKeyboard"
  >
    <view class="relative h-[284rpx] overflow-hidden" :style="{ backgroundImage: props.strategy.coverImage }">
      <view class="rd-poster-overlay" />
      <view class="absolute inset-x-0 top-[120rpx] h-[56rpx] bg-white/18" />
      <view class="absolute left-[50%] top-[94rpx] h-[92rpx] w-[92rpx] rounded-full bg-black/68 shadow-[0_8rpx_20rpx_rgba(0,0,0,0.18)] -translate-x-[50%]" />
      <view class="absolute left-[50%] top-[72rpx] h-[18rpx] w-[18rpx] rounded-full bg-[#C88A38] -translate-x-[50%]" />
      <view class="absolute left-[50%] top-[42rpx] h-[188rpx] w-[30rpx] rounded-full bg-[#B7772B] -translate-x-[50%]" />
      <view class="absolute right-[72rpx] top-[30rpx] h-[92rpx] w-[92rpx] rounded-full bg-[#F6E1A7]/54 blur-[22rpx]" />
      <view class="absolute right-[20rpx] top-[20rpx] rd-hero-tag">
        {{ props.strategy.homeTagLabel }}
      </view>
    </view>
    <view class="bg-rdPaper/82 px-[24rpx] py-[20rpx]">
      <text class="block text-sm text-primary font-700">
        {{ props.strategy.categoryName }}
      </text>
      <text class="mt-[8rpx] block text-xs text-secondary leading-[1.7]">
        {{ props.strategy.description }}
      </text>
    </view>
  </view>
</template>
