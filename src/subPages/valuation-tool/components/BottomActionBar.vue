<script setup lang="ts">
defineProps<{
  secondaryText?: string
  primaryText: string
}>()

const emit = defineEmits<{
  secondary: []
  primary: []
}>()
</script>

<template>
  <view class="vt-action-bar">
    <view class="flex items-center gap-[16rpx]">
      <view
        v-if="secondaryText"
        class="min-w-0 vt-action-secondary flex flex-1"
        @click="emit('secondary')"
      >
        {{ secondaryText }}
      </view>
      <view
        class="min-w-0 vt-action-primary flex flex-1"
        @click="emit('primary')"
      >
        {{ primaryText }}
      </view>
    </view>
  </view>
</template>
