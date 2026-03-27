<script setup lang="ts">
import type { FlashNewsItem } from '../types'

import { formatFlashNewsFullTime, getFlashNewsScoreTone, isFlashNewsHot } from '../utils'

const props = defineProps<{
  item: FlashNewsItem
  featured?: boolean
}>()

const expanded = ref(false)

const hot = computed(() => isFlashNewsHot(props.item.score))
const publishedFullTime = computed(() => formatFlashNewsFullTime(props.item.pubDate))
const scoreToneClass = computed(() => getFlashNewsScoreTone(props.item.score))
const cardClass = computed(() => props.featured ? 'flash-news-card flash-news-card-featured' : 'flash-news-card')

function toggleExpanded() {
  expanded.value = !expanded.value
}
</script>

<template>
  <view class="group relative pl-[52rpx]">
    <view class="absolute bottom-0 left-[19rpx] top-0 w-[4rpx] bg-line/70 group-last:bg-transparent" />
    <view
      class="absolute left-0 top-[10rpx] h-[42rpx] w-[42rpx] flex items-center justify-center border-[6rpx] border-white rounded-full shadow-[0_8rpx_20rpx_rgba(17,37,62,0.08)]"
      :class="hot ? 'bg-danger text-white' : 'bg-surfaceSubtle text-secondary'"
    >
      <view :class="hot ? 'i-carbon-flash-filled text-[20rpx]' : 'i-carbon-time text-[20rpx]'" />
    </view>

    <view class="rounded-card px-[24rpx] py-[22rpx]" :class="cardClass">
      <view class="flex items-start justify-between gap-[18rpx]">
        <view class="min-w-0 flex-1">
          <view class="flex items-center gap-[10rpx] text-[20rpx] text-secondary">
            发布时间：{{ publishedFullTime }}
          </view>
        </view>
      </view>

      <view class="flash-news-summary mt-[18rpx] rounded-panel px-[20rpx] py-[18rpx]">
        <view class="flex items-center gap-[8rpx] text-xs text-secondary font-600">
          <view class="i-carbon-ai-results text-xs text-brand" />
          <text>AI 摘要</text>
        </view>
        <text class="mt-[10rpx] block text-xs text-regular">
          {{ item.summary }}
        </text>
      </view>

      <view v-if="item.tags.length" class="mt-[16rpx] flex flex-wrap gap-[10rpx]">
        <wd-tag
          v-for="tag in item.tags"
          :key="tag"
          round
          size="small"
          custom-class="rounded-[10rpx]! border-none! bg-surfaceSubtle! text-xs! text-secondary!"
        >
          #{{ tag }}
        </wd-tag>
      </view>

      <view v-if="expanded" class="mt-[18rpx] border-t border-line/60 pt-[18rpx]">
        <view class="rounded-panel bg-page px-[20rpx] py-[18rpx]">
          <rich-text class="text-xs text-regular leading-[1.8]" :nodes="item.description" />
        </view>
      </view>

      <view class="mt-[18rpx] flex items-center justify-between border-t border-line/60 pt-[18rpx]">
        <view class="flex items-center gap-[8rpx] text-xs" :class="scoreToneClass">
          <view class="i-carbon-chart-line-smooth text-[20rpx]" />
          <text>热度 {{ Math.round(item.score) }}</text>
        </view>

        <view class="flex items-center gap-[8rpx]" @click="toggleExpanded">
          <text class="text-xs text-brand font-500">
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
  border: 1px solid rgba(208, 219, 238, 0.82);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(245, 248, 255, 0.96));
  box-shadow: 0 16rpx 42rpx rgba(17, 37, 62, 0.05);
}

.flash-news-card-featured {
  border-color: rgba(22, 120, 255, 0.22);
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.99), rgba(238, 245, 255, 0.98));
  box-shadow:
    0 24rpx 52rpx rgba(17, 37, 62, 0.08),
    inset 0 0 0 1rpx rgba(22, 120, 255, 0.08);
  transform-origin: center top;
  animation: flashNewsFeaturedIn 420ms ease-out;
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
