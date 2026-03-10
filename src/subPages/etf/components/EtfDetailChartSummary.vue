<script setup lang="ts">
interface SummaryItem {
  label: string
  value: string
  color?: string
}

defineProps<{
  dateText: string
  items: SummaryItem[]
}>()
</script>

<template>
  <view class="rounded-[28rpx] bg-[#F2F5FA] px-[28rpx] py-[24rpx]">
    <view class="text-xs text-[#A0A9B4] leading-none">
      {{ dateText }}
    </view>
    <view class="mt-[16rpx] flex flex-wrap gap-x-[48rpx] gap-y-[16rpx]">
      <view
        v-for="item in items"
        :key="item.label"
        class="flex items-center gap-[16rpx] text-xs text-[#5D6773]"
      >
        <view
          v-if="item.color"
          class="h-[12rpx] w-[24rpx] rounded-full"
          :style="{ backgroundColor: item.color }"
        />
        <text>{{ item.label }}</text>
        <text class="text-xs text-[#1D2129] font-500">
          {{ item.value }}
        </text>
      </view>
    </view>
  </view>
</template>
