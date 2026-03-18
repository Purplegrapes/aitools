<script setup lang="ts">
defineProps<{
  text: string
}>()
</script>

<template>
  <view class="vt-risk-note">
    <text class="vt-risk-note-text">
      {{ text }}
    </text>
  </view>
</template>
