<script setup lang="ts">
defineProps<{
  watchlisted: boolean
  holding?: boolean
  deletingHolding?: boolean
}>()

const emit = defineEmits<{
  toggle: []
  openWatchlist: []
  openMineScan: []
  removeHolding: []
}>()
</script>

<template>
  <view class="vt-action-bar">
    <view class="w-full">
      <view class="flex items-center gap-[16rpx]">
        <view
          class="vt-action-secondary-weak w-[132rpx] shrink-0"
          @click="emit('openWatchlist')"
        >
          <view class="i-carbon-list text-[26rpx] text-secondary" />
          <text class="whitespace-nowrap leading-[1.2]">
            自选列表
          </text>
        </view>

        <view
          class="vt-action-secondary-weak w-[132rpx] shrink-0"
          @click="emit('openMineScan')"
        >
          <view class="i-carbon-warning-hex-filled text-[26rpx] text-secondary" />
          <text class="whitespace-nowrap leading-[1.2]">
            基金诊断
          </text>
        </view>

        <view
          v-if="holding"
          class="vt-action-secondary-weak w-[132rpx] shrink-0 text-danger"
          @click="emit('removeHolding')"
        >
          <view class="i-carbon-trash-can text-[26rpx] text-danger" />
          <text class="whitespace-nowrap leading-[1.2]">
            {{ deletingHolding ? '删除中' : '删除持有' }}
          </text>
        </view>

        <view
          class="min-w-0 vt-action-primary flex flex-1"
          @click="emit('toggle')"
        >
          <view :class="watchlisted ? 'i-carbon-star-filled text-[30rpx] text-[#FFE082]' : 'i-carbon-star text-[30rpx] text-inverse'" />
          <text>
            {{ watchlisted ? '取消自选' : '加自选' }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>
