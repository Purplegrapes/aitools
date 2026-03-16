<script setup lang="ts">
interface MetricCard {
  label: string
  value: string
  tone?: 'primary' | 'warning' | 'success' | 'neutral'
  hint?: string
}

defineProps<{
  cards: MetricCard[]
}>()

function getToneClass(tone?: MetricCard['tone']) {
  if (tone === 'primary')
    return 'text-[#1678FF]'
  if (tone === 'warning')
    return 'text-[#FF7A00]'
  if (tone === 'success')
    return 'text-[#00A870]'
  return 'text-[#1D2129]'
}
</script>

<template>
  <view class="grid grid-cols-2 gap-[24rpx]">
    <view
      v-for="card in cards"
      :key="card.label"
      class="rounded-[18rpx] bg-[#F2F5FA] px-2 py-2"
    >
      <view class="text-xs text-[#5D6773] leading-[1.5]">
        {{ card.label }}
      </view>
      <view class="mt-[16rpx] text-sm font-600 leading-none" :class="getToneClass(card.tone)">
        {{ card.value }}
      </view>
      <view v-if="card.hint" class="mt-[16rpx] text-xs text-[#8A95A1]">
        {{ card.hint }}
      </view>
    </view>
  </view>
</template>
