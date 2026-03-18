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
  <view class="vt-card bg-surface">
    <view class="flex items-center gap-[18rpx]">
      <view class="h-[56rpx] w-[56rpx] flex items-center justify-center text-tertiary">
        <view class="i-carbon-search text-[34rpx]" />
      </view>
      <input
        :value="props.modelValue"
        :placeholder="props.placeholder || '输入基金全称或代码'"
        class="min-w-0 flex-1 text-[28rpx] text-primary font-500"
        confirm-type="search"
        placeholder-style="color:#BBBFCB;"
        @input="handleInput"
        @confirm="handleSubmit"
      >
      <wd-button
        custom-class="!h-[70rpx] !rounded-[20rpx] !border-none !bg-brand !px-[34rpx] !text-[26rpx] !font-500"
        size="small"
        type="primary"
        @click="handleSubmit"
      >
        {{ props.buttonText || '查询' }}
      </wd-button>
    </view>
  </view>
</template>
