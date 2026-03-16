<script setup lang="ts">
import type { SearchResultViewModel } from '../types'

defineProps<{
  item: SearchResultViewModel
}>()

const emit = defineEmits<{
  select: [code: string]
}>()
</script>

<template>
  <view class="rounded-4 bg-surface p-4 shadow-sm">
    <view class="flex items-start justify-between gap-3">
      <view class="min-w-0 flex-1">
        <text class="block text-base text-primary font-600">
          {{ item.name }}
        </text>
        <text class="mt-1 block text-xs text-secondary">
          {{ item.code }}
        </text>
      </view>
      <wd-tag bg-color="rgba(22,120,255,0.12)" custom-class="!rounded-full !border-none !px-2">
        <text class="text-xs text-brand">
          {{ item.todayTag }}
        </text>
      </wd-tag>
    </view>

    <view class="mt-3 flex flex-wrap gap-2">
      <wd-tag
        v-for="tag in item.tags"
        :key="tag"
        bg-color="rgba(29,33,41,0.06)"
        custom-class="!rounded-full !border-none !px-2"
      >
        <text class="text-xs text-regular">
          {{ tag }}
        </text>
      </wd-tag>
    </view>

    <text class="mt-4 block text-sm text-regular leading-6">
      {{ item.summary }}
    </text>

    <view class="mt-4 flex justify-end">
      <wd-button size="small" type="primary" @click="emit('select', item.code)">
        看详情
      </wd-button>
    </view>
  </view>
</template>
