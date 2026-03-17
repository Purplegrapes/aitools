<script setup lang="ts">
withDefaults(defineProps<{
  height?: string
  width?: string
  rounded?: string
}>(), {
  height: '24rpx',
  width: '100%',
  rounded: '20rpx',
})
</script>

<template>
  <view
    class="animate-pulse bg-surfaceSubtle"
    :style="{ height, width, borderRadius: rounded }"
  />
</template>
