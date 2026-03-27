<script setup lang="ts">
// z-paging 当前包未提供该 .vue 入口的模块声明，这里先按项目现有接入方式忽略类型告警。
// @ts-expect-error z-paging vue entry has no typed module declaration
import ZPaging from 'z-paging/components/z-paging/z-paging.vue'

interface BasePagingProps<T = unknown> {
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
  (e: 'update:list', value: unknown[]): void
  (e: 'query', pageNo: number, pageSize: number, from: ZPagingEnums.QueryFrom): void
}>()

const pagingRef = ref<ZPagingRef<unknown> | null>(null)

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
        <view class="py-8 text-center text-sm text-secondary">
          {{ emptyText }}
        </view>
      </slot>
    </template>
  </ZPaging>
</template>
