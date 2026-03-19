<script setup lang="ts">
defineProps<{
  title: string
  description: string
  actionText: string
}>()

const emit = defineEmits<{
  action: []
}>()
</script>

<template>
  <view class="vt-top-card p-5">
    <view class="h-12 w-12 flex items-center justify-center rounded-full bg-brand-muted text-brand">
      <view class="i-carbon-information text-xl" />
    </view>
    <text class="mt-4 block text-lg text-primary font-600">
      {{ title }}
    </text>
    <text class="mt-2 block text-sm text-regular leading-6">
      {{ description }}
    </text>
    <view class="mt-5">
      <wd-button block size="large" type="primary" @click="emit('action')">
        {{ actionText }}
      </wd-button>
    </view>
  </view>
</template>
