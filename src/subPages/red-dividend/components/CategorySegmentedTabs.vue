<script setup lang="ts">
import type { RedDividendCategory, RedDividendCategoryCode } from '../types'

defineProps<{
  items: RedDividendCategory[]
  current: RedDividendCategoryCode
}>()

const emit = defineEmits<{
  select: [categoryCode: RedDividendCategoryCode]
}>()
</script>

<template>
  <view class="w-full">
    <view class="flex gap-[8rpx] rounded-[30rpx] bg-black px-[8rpx] py-[8rpx]">
      <view
        v-for="item in items"
        :key="item.categoryCode"
        class="flex-1 rounded-full px-[12rpx] py-[14rpx] text-center text-sm font-600"
        :class="item.categoryCode === current ? 'bg-surface text-primary shadow-[0_8rpx_18rpx_rgba(24,24,24,0.05)]' : 'bg-transparent text-secondary'"
        @tap="emit('select', item.categoryCode)"
      >
        {{ item.categoryName }}
      </view>
    </view>
  </view>
</template>
