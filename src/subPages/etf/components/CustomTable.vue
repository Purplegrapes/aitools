<script setup lang="ts">
/**
 * 自定义表格组件 - 深色金融科技风格
 * 用于展示 ETF 数据列表
 */
import { valuationStatus } from '../design-system'

interface Column {
  props: string
  label?: string
  width?: number
  fixed?: boolean
  align?: string
  show?: boolean
  format?: (value: any) => string
}

interface Props {
  columns: Column[]
  tableData: Record<string, any>[]
  loading?: boolean
  rowClick?: (row: any) => void
  optionalClick?: (row: any) => void
  scrollLeft?: number
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  scrollLeft: 0,
})

const emit = defineEmits<{
  (e: 'row-click', row: any): void
  (e: 'optional-click', row: any): void
  (e: 'update:scrollLeft', value: number): void
}>()

/**
 * 滚动位置
 */
const currentScrollLeft = ref(0)

/**
 * 可见的列
 */
const visibleColumns = computed(() => {
  return props.columns.filter(col => col.show !== false)
})

/**
 * 固定列额外宽度（用于阴影和遮挡）
 */
const FIXED_COLUMN_EXTRA_WIDTH = 32

/**
 * 计算固定列的 left 偏移量
 */
const fixedColumnsOffset = computed(() => {
  const offsets: Record<string, number> = {}
  let accumulatedWidth = 0

  for (const col of visibleColumns.value) {
    if (col.fixed) {
      offsets[col.props] = accumulatedWidth
      accumulatedWidth += (col.width ? col.width * 2 : 100) + FIXED_COLUMN_EXTRA_WIDTH
    }
  }

  return offsets
})

/**
 * 获取固定列的 left 样式值
 */
function getFixedLeftStyle(column: Column): string | undefined {
  if (column.fixed) {
    return `${fixedColumnsOffset.value[column.props] || 0}rpx`
  }
  return undefined
}

/**
 * 表格总宽度
 */
const tableWidth = computed(() => {
  return visibleColumns.value.reduce((sum, col) => {
    const width = col.width ? col.width * 2 : 100
    return sum + (col.fixed ? width + FIXED_COLUMN_EXTRA_WIDTH : width)
  }, 0)
})

/**
 * 处理滚动事件
 */
function handleScroll(e: any) {
  emit('update:scrollLeft', e.detail.scrollLeft)
}

/**
 * 滚动到指定位置
 */
function scrollTo(scrollLeft: number) {
  currentScrollLeft.value = scrollLeft
}

/**
 * 暴露方法给父组件
 */
defineExpose({
  scrollTo,
})

/**
 * 处理行点击
 */
function handleRowClick(row: any) {
  if (props.rowClick) {
    props.rowClick(row)
  }
  else {
    emit('row-click', row)
  }
}

/**
 * 处理自选按钮点击
 */
function handleOptionalClick(row: any, event: any) {
  event.stopPropagation()
  if (props.optionalClick) {
    props.optionalClick(row)
  }
  else {
    emit('optional-click', row)
  }
}

/**
 * 格式化单元格值
 */
function formatValue(row: any, column: Column): string {
  const value = row[column.props]
  if (value === null || value === undefined)
    return '-'
  if (column.format)
    return column.format(value)
  return String(value)
}

/**
 * 获取单元格对齐方式
 */
function getAlign(column: Column): string {
  return column.align || 'flex-start'
}

/**
 * 获取单元格颜色 - 浅色主题
 */
function getCellColor(row: any, column: Column): string {
  const value = row[column.props]
  if (column.props === 'priceChangeRatio' || column.props === 'premiumRate') {
    if (value > 0)
      return '#FF4D4F'
    if (value < 0)
      return '#00C853'
  }
  return '#1F2937'
}

/**
 * 获取单元格宽度
 */
function getColumnWidth(column: Column): string {
  if (column.fixed) {
    const baseWidth = column.width ? column.width * 2 : 100
    return `${baseWidth + FIXED_COLUMN_EXTRA_WIDTH}rpx`
  }
  return column.width ? `${column.width * 2}rpx` : 'auto'
}

/**
 * 获取单元格样式
 */
function getCellStyle(column: Column) {
  const style: Record<string, string> = {
    width: getColumnWidth(column),
    justifyContent: getAlign(column),
  }

  if (column.fixed) {
    style.left = getFixedLeftStyle(column)!
  }

  return style
}

/**
 * 获取行背景样式 - 深色主题
 */
function getRowStyle(row: any): Record<string, string> | null {
  const config = getValuationConfig(row)
  return config ? { backgroundColor: config.bg } : null
}

/**
 * 获取估值状态配置
 */
function getValuationConfig(row: any) {
  const status = row.valuation_status
  if (status === 1)
    return valuationStatus.low
  if (status === 2)
    return valuationStatus.medium
  if (status === 3)
    return valuationStatus.high
  return null
}

/**
 * 判断是否是最后一个固定列
 */
function isLastFixedColumn(index: number): boolean {
  for (let i = index + 1; i < visibleColumns.value.length; i++) {
    if (visibleColumns.value[i].fixed === true)
      return false
  }
  return visibleColumns.value[index].fixed === true
}
</script>

<template>
  <view class="custom-table overflow-hidden bg-[#F8FAFC]">
    <!-- 加载状态 -->
    <view v-if="loading" class="flex justify-center py-10">
      <wd-loading type="spinner" size="24px" color="#00D4AA" />
    </view>

    <!-- 可滚动的表格容器 -->
    <scroll-view
      class="w-full"
      enable-flex
      enhanced
      using-sticky
      :bounces="false"
      :show-scrollbar="false"
      enable-passive
      scroll-anchoring
      scroll-x
      scroll-y
      :scroll-left="currentScrollLeft"
      :style="{ height: 'calc(100vh - 380rpx)' }"
      @scroll="handleScroll"
    >
      <view class="flex flex-col" :style="{ width: `${tableWidth}rpx` }">
        <!-- 表头 -->
        <view class="sticky top-0 z-10 flex border-b border-black/[0.08] bg-white/95 backdrop-blur-xl">
          <view
            v-for="(column, colIndex) in visibleColumns"
            :key="column.props"
            class="box-border flex flex-shrink-0 items-center px-3 py-3 text-xs text-[#64748B] font-medium"
            :class="[
              column.fixed ? 'sticky z-15 bg-white/95' : '',
              column.fixed && currentScrollLeft > 0 && isLastFixedColumn(colIndex) ? 'fixed-column-shadow' : '',
            ]"
            :style="getCellStyle(column)"
          >
            <text class="leading-tight">
              {{ column.label || '' }}
            </text>
          </view>
        </view>

        <!-- 表格内容 -->
        <view :class="{ 'mt-2': tableData.length > 0 }">
          <view
            v-for="(row, index) in tableData"
            :key="index"
            class="relative flex border-b border-black/[0.04] bg-white transition-all duration-200 active:scale-[0.99] active:bg-[#F1F5F9]"
            :class="{ 'rounded-t-xl': index === 0, 'rounded-b-xl': index === tableData.length - 1 }"
            :style="getRowStyle(row)"
            @click="handleRowClick(row)"
          >
            <view
              v-for="(column, colIndex) in visibleColumns"
              :key="column.props"
              class="box-border flex flex-shrink-0 items-center px-3 py-3 text-sm"
              :class="[
                column.fixed ? 'sticky z-5' : '',
                column.fixed && currentScrollLeft > 0 && isLastFixedColumn(colIndex) ? 'fixed-column-shadow' : '',
              ]"
              :style="{
                ...getCellStyle(column),
                ...(column.fixed ? { backgroundColor: getRowStyle(row)?.backgroundColor || '#FFFFFF' } : {}),
              }"
            >
              <!-- 自选列 -->
              <template v-if="column.props === 'optional'">
                <wd-icon
                  name="star-on"
                  :color="row.watchList ? '#FFD700' : '#CBD5E1'"
                  size="20px"
                  custom-class="transition-transform active:scale-125"
                  @click="(e) => handleOptionalClick(row, e)"
                />
              </template>
              <!-- 名称列（带 tag） -->
              <template v-else-if="column.props === 'name'">
                <view class="flex flex-wrap items-center gap-2">
                  <text class="font-medium leading-tight" :style="{ color: getCellColor(row, column) }">
                    {{ formatValue(row, column) }}
                  </text>
                  <view
                    v-if="getValuationConfig(row)"
                    class="border rounded-md px-2 py-0.5 text-xs font-medium"
                    :style="{
                      backgroundColor: getValuationConfig(row)!.bg,
                      color: getValuationConfig(row)!.text,
                      borderColor: getValuationConfig(row)!.border,
                    }"
                  >
                    {{ getValuationConfig(row)!.label }}
                  </view>
                </view>
              </template>
              <!-- 普通列 -->
              <template v-else>
                <text
                  class="font-medium leading-tight tabular-nums"
                  :style="{ color: getCellColor(row, column) }"
                >
                  {{ formatValue(row, column) }}
                </text>
              </template>
            </view>
          </view>

          <!-- 空状态 -->
          <view v-if="!loading && tableData.length === 0" class="flex flex-col items-center justify-center py-20">
            <view class="mb-3 h-16 w-16 flex items-center justify-center rounded-full bg-black/[0.03]">
              <text class="text-3xl">
                📊
              </text>
            </view>
            <text class="text-sm text-[#94A3B8]">
              暂无数据
            </text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<style scoped>
.fixed-column-shadow {
  box-shadow: 4px 0 16px rgba(0, 0, 0, 0.08);
}

/* 确保固定列有正确的背景 */
:deep(.wd-tabs) {
  background-color: transparent !important;
}

/* 自定义滚动条样式 */
::-webkit-scrollbar {
  display: none;
}
</style>
