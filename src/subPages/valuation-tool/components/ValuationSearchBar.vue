<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  placeholder?: string
  buttonText?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'submit': []
}>()

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement | null
  emit('update:modelValue', target?.value || '')
}

function handleSubmit() {
  emit('submit')
}
</script>

<template>
  <view class="border border-line/70 rounded-[32rpx] bg-surface px-[18rpx] py-[18rpx] shadow-[0_18rpx_50rpx_rgba(17,37,62,0.08)]">
    <view class="flex items-center gap-[18rpx]">
      <view class="h-[70rpx] w-[70rpx] flex items-center justify-center rounded-[22rpx] bg-page text-brand">
        <view class="i-carbon-search text-[30rpx]" />
      </view>
      <input
        :value="props.modelValue"
        :placeholder="props.placeholder || '输入基金全称或代码'"
        class="min-w-0 flex-1 text-[26rpx] text-primary font-500 placeholder:text-secondary"
        confirm-type="search"
        @input="handleInput"
        @confirm="handleSubmit"
      >
      <wd-button
        custom-class="!h-[70rpx] !rounded-[22rpx] !border-none !bg-brand !px-[24rpx] !text-[24rpx] !font-600 shadow-[0_14rpx_34rpx_rgba(22,120,255,0.22)]"
        size="small"
        type="primary"
        @click="handleSubmit"
      >
        {{ props.buttonText || '查询' }}
      </wd-button>
    </view>
  </view>
</template>
