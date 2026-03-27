<script setup lang="ts">
import type { FlashNewsItem } from '../types'

import { formatFlashNewsFullTime, getFlashNewsScoreTone } from '../utils'

const props = defineProps<{
  item: FlashNewsItem
  featured?: boolean
}>()

const expanded = ref(false)

const publishedFullTime = computed(() => formatFlashNewsFullTime(props.item.pubDate))
const scoreToneClass = computed(() => getFlashNewsScoreTone(props.item.score))
const cardClass = computed(() => props.featured ? 'flash-news-card flash-news-card-featured' : 'flash-news-card')

function toggleExpanded() {
  expanded.value = !expanded.value
}
</script>

<template>
  <view class="group relative">
    <view class="rounded-card px-[24rpx] py-[22rpx]" :class="cardClass">
      <view class="flex items-start justify-between gap-[18rpx]">
        <view class="min-w-0 flex-1">
          <view class="flex items-center gap-[10rpx] text-[20rpx] text-secondary">
            <view class="i-carbon-flash-filled text-[20rpx] text-red" />
            发布时间：{{ publishedFullTime }}
          </view>
        </view>
      </view>

      <view class="flash-news-summary mt-[18rpx] rounded-panel px-[20rpx] py-[18rpx]">
        <view class="flex items-center gap-[8rpx] text-sm text-orange font-500">
          <view class="i-carbon-ai-results" />
          <text>AI 摘要</text>
        </view>
        <text class="mt-[20rpx] block text-sm text-regular">
          {{ item.title }}
        </text>
      </view>

      <view v-if="item.tags.length" class="mt-[16rpx] flex flex-wrap gap-[10rpx]">
        <wd-tag
          v-for="tag in item.tags"
          :key="tag"
          round
          size="small"
          custom-class="rounded-[10rpx]! border-none!  bg-[#fff]! text-xs! text-secondary!"
        >
          #{{ tag }}
        </wd-tag>
      </view>

      <view v-if="expanded" class="border-t border-line/60 pt-[18rpx]">
        <view class="rounded-panel bg-page px-[20rpx] py-[18rpx]">
          <rich-text class="text-xs text-secondary leading-[1.8]" :nodes="item.description" />
        </view>
      </view>

      <view class="mt-[18rpx] flex items-center justify-between border-t border-line/60 pt-[18rpx]">
        <view class="flex items-center gap-[8rpx] text-[20rpx]" :class="scoreToneClass">
          <view class="i-carbon-chart-line-smooth" />
          <text>热度 {{ Math.round(item.score) }}</text>
        </view>

        <view class="flex items-center gap-[8rpx]" @click="toggleExpanded">
          <text class="text-[20rpx] text-brand font-500">
            {{ expanded ? '收起详情' : '查看详情' }}
          </text>
          <wd-icon :name="expanded ? 'arrow-up' : 'arrow-down'" size="12" custom-class="text-brand!" />
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.flash-news-card {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(245, 248, 255, 0.96));
  box-shadow: 0 16rpx 42rpx rgba(17, 37, 62, 0.05);
}

.flash-news-summary {
  background:
    linear-gradient(135deg, rgba(245, 248, 255, 0.94), rgba(255, 255, 255, 0.9));
  box-shadow: inset 0 0 0 1rpx rgba(148, 176, 220, 0.18);
}

.flash-news-tag,
.flash-news-tag-important,
.flash-news-action {
  margin: 0;
}

.flash-news-action {
  border: 0;
}

@keyframes flashNewsFeaturedIn {
  0% {
    opacity: 0;
    transform: translateY(10rpx) scale(0.985);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
