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
      <wd-tag round type="primary">
        <text class="text-xs">
          {{ item.todayTag }}
        </text>
      </wd-tag>
    </view>

    <view class="mt-3 flex flex-wrap gap-2">
      <wd-tag
        v-for="tag in item.tags"
        :key="tag"
        round
        type="default"
      >
        <text class="text-xs">
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
