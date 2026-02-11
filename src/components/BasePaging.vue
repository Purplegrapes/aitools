<script setup lang="ts">
import ZPaging from 'z-paging/components/z-paging/z-paging.vue'

interface BasePagingProps<T = any> {
  list: T[]
  fixed?: boolean
  auto?: boolean
  pageSize?: number
  usePageScroll?: boolean
  emptyText?: string
}

const props = withDefaults(defineProps<BasePagingProps>(), {
  fixed: true,
  auto: true,
  pageSize: 10,
  usePageScroll: false,
  emptyText: '暂无数据',
})

const emit = defineEmits<{
  (e: 'update:list', value: any[]): void
  (e: 'query', pageNo: number, pageSize: number, from: ZPagingEnums.QueryFrom): void
}>()

const pagingRef = ref<ZPagingRef<any> | null>(null)

const pagingList = computed({
  get: () => props.list,
  set: value => emit('update:list', value),
})

function handleQuery(pageNo: number, pageSize: number, from: ZPagingEnums.QueryFrom) {
  emit('query', pageNo, pageSize, from)
}

function reload(animate = false) {
  return pagingRef.value?.reload(animate)
}

defineExpose({
  pagingRef,
  reload,
})
</script>

<template>
  <ZPaging
    ref="pagingRef"
    v-model="pagingList"
    :fixed="fixed"
    :auto="auto"
    :default-page-size="pageSize"
    :use-page-scroll="usePageScroll"
    :empty-view-text="emptyText"
    @query="handleQuery"
  >
    <slot />
    <template #empty>
      <slot name="empty">
        <view class="py-8 text-center text-sm text-#9ca3af">
          {{ emptyText }}
        </view>
      </slot>
    </template>
  </ZPaging>
</template>
