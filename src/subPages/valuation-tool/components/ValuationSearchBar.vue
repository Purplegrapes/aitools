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
  const nextValue = (event as InputEvent).detail?.value
    ?? (event.target as HTMLInputElement | null)?.value
    ?? ''
  emit('update:modelValue', nextValue)
}

function handleSubmit() {
  emit('submit')
}
</script>

<template>
  <view class="border border-line/70 rounded-card border-solid bg-surface px-[20rpx] py-[18rpx] shadow-[0_12rpx_28rpx_rgba(17,37,62,0.05)]">
    <view class="flex items-center gap-[14rpx]">
      <view class="h-[48rpx] w-[48rpx] flex items-center justify-center text-tertiary">
        <wd-icon name="search" />
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
        size="small"
        type="primary"
        @click="handleSubmit"
      >
        {{ props.buttonText || '查询' }}
      </wd-button>
    </view>
  </view>
</template>
