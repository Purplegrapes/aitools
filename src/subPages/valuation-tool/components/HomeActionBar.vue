<script setup lang="ts">
const props = withDefaults(defineProps<{
  current?: 'watchlist' | 'holdings' | 'news'
}>(), {
  current: undefined,
})

const emit = defineEmits<{
  openWatchlist: []
  openHoldings: []
  openNews: []
}>()

function handleOpenWatchlist() {
  if (props.current === 'watchlist')
    return
  emit('openWatchlist')
}

function handleOpenHoldings() {
  if (props.current === 'holdings')
    return
  emit('openHoldings')
}
</script>

<template>
  <view class="vt-action-bar">
    <view class="flex items-center gap-[16rpx]">
      <view
        class="min-w-0 flex flex-1"
        :class="current === 'watchlist' ? 'vt-action-primary' : 'vt-action-secondary'"
        @click="handleOpenWatchlist"
      >
        <view class="text-[28rpx]" :class="current === 'watchlist' ? 'i-carbon-star-filled text-inverse' : 'i-carbon-star text-brand'" />
        <text>
          自选
        </text>
      </view>

      <view
        class="min-w-0 flex flex-1"
        :class="current === 'holdings' ? 'vt-action-primary' : 'vt-action-secondary'"
        @click="handleOpenHoldings"
      >
        <view class="i-carbon-wallet text-[28rpx]" :class="current === 'holdings' ? 'text-inverse' : 'text-brand'" />
        <text>
          持有
        </text>
      </view>
    </view>
  </view>
</template>
