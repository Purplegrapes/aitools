<script setup lang="ts">
import { computed } from 'vue'

interface SummaryItem {
  label: string
  value: string
  accent?: 'positive' | 'negative' | 'neutral'
}

interface Props {
  title: string
  code: string
  updateDate: string
  description: string
  descriptionExpanded: boolean
  descriptionExpandable: boolean
  currentPrice: string
  priceDelta: string
  riseFall: string
  riseFallValue?: number | null
  summaryItems: SummaryItem[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'toggle-description'): void
}>()

const priceToneClass = computed(() => {
  if (!props.riseFallValue)
    return 'text-[#8A95A1]'
  return props.riseFallValue > 0 ? 'text-[#F02D30]' : 'text-[#00A870]'
})

function getSummaryClass(accent?: SummaryItem['accent']) {
  if (accent === 'positive')
    return 'text-[#F02D30]'
  if (accent === 'negative')
    return 'text-[#00A870]'
  return 'text-[#1D2129]'
}
</script>

<template>
  <view class="relative overflow-hidden bg-[linear-gradient(180deg,#cfe1ff_0%,#e9f1ff_55%,#f5f7fa_78%,rgba(245,247,250,0)_100%)] px-[32rpx] pb-[64rpx] pt-[40rpx] text-[#1D2129]">
    <view class="relative space-y-[40rpx]">
      <view class="space-y-[16rpx]">
        <view class="text-xl font-600 leading-none">
          {{ title }}
        </view>
        <view class="flex flex-wrap items-center gap-x-[16rpx] gap-y-[8rpx] text-sm text-[#7F8A96]">
          <text>{{ code || '--' }}</text>
          <text class="text-[#B6C0CB]">
            |
          </text>
          <text>数据更新日：{{ updateDate }}</text>
        </view>
        <view class="text-sm text-[#4E5969] leading-[1.65]">
          <text>{{ description }}</text>
          <text
            v-if="descriptionExpandable"
            class="ml-[8rpx] inline-block text-[#8A95A1]"
            @tap="emit('toggle-description')"
          >
            {{ descriptionExpanded ? '收起' : '展开' }}
          </text>
        </view>
      </view>

      <view class="flex items-start gap-[32rpx]">
        <view class="min-w-0 flex-1">
          <view class="text-base font-500 leading-none tracking-[-0.03em]" :class="priceToneClass">
            {{ currentPrice }}
          </view>
          <view class="mt-[24rpx] flex items-center gap-[24rpx] text-sm" :class="priceToneClass">
            <text>{{ priceDelta }}</text>
            <text>{{ riseFall }}</text>
          </view>
        </view>

        <view class="grid grid-cols-3 min-w-0 flex-[1.45] gap-[24rpx]">
          <view
            v-for="item in summaryItems"
            :key="item.label"
            class="min-w-0"
          >
            <view class="mb-[16rpx] text-xs text-[#5D6773]">
              {{ item.label }}
            </view>
            <view class="truncate text-xs font-500 leading-none" :class="getSummaryClass(item.accent)">
              {{ item.value }}
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
