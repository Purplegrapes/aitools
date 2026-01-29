<script setup lang="ts">
/**
 * 自定义表格组件
 * 用于展示 ETF 数据列表
 */
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
 * 计算固定列的 left 偏移量
 */
const fixedColumnsOffset = computed(() => {
  const offsets: Record<string, number> = {}
  let accumulatedWidth = 0

  for (const col of visibleColumns.value) {
    if (col.fixed) {
      offsets[col.props] = accumulatedWidth
      accumulatedWidth += col.width ? col.width * 2 : 100
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
    return sum + (col.width ? col.width * 2 : 100)
  }, 0)
})

/**
 * 监听外部滚动位置变化
 */
// watch(() => props.scrollLeft, (newVal) => {
//   currentScrollLeft.value = newVal
// })

/**
 * 处理滚动事件
 */
function handleScroll(e: any) {
  console.log('handleScroll', e.detail.scrollLeft)
  // currentScrollLeft.value = e.detail.scrollLeft
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
 * 获取单元格颜色
 */
function getCellColor(row: any, column: Column): string {
  const value = row[column.props]
  if (column.props === 'priceChangeRatio' || column.props === 'premiumRate') {
    if (value > 0)
      return '#ff3b30'
    if (value < 0)
      return '#28cd41'
  }
  return '#333'
}

/**
 * 获取单元格宽度
 */
function getColumnWidth(column: Column): string {
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
 * 获取行背景样式
 */
function getRowStyle(row: any): Record<string, string> | null {
  const config = getValuationConfig(row)
  return config ? { backgroundColor: config.bgColor } : null
}

/**
 * 估值状态配置
 */
const VALUATION_STATUS_CONFIG: Record<
  string,
  { label: string, bgColor: string, textColor: string, rgbaColor: string }
> = {
  1: { label: '低估', bgColor: '#61B335', textColor: '#fff', rgbaColor: '#03914A' },
  2: { label: '适中', bgColor: '#FF9E43', textColor: '#fff', rgbaColor: '#F07000' },
  3: { label: '高估', bgColor: '#cf1322', textColor: '#fff', rgbaColor: '#cf1322' },
}

/**
 * 获取估值状态配置
 */
function getValuationConfig(row: any) {
  return VALUATION_STATUS_CONFIG[row.valuation_status]
}
</script>

<template>
  <view class="overflow-hidden bg-white">
    <!-- 加载状态 -->
    <view v-if="loading" class="flex justify-center py-10">
      <wd-loading />
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
      :style="{ height: 'calc(100vh - 350rpx)' }"
      @scroll="handleScroll"
    >
      <view class="flex flex-col" :style="{ width: `${tableWidth}rpx` }">
        <!-- 表头 -->
        <view class="sticky top-0 z-10 flex border-b border-gray-200 bg-gray-50">
          <view
            v-for="column in visibleColumns"
            :key="column.props"
            class="box-border flex flex-shrink-0 items-center bg-gray-50 px-3 py-2 text-24rpx text-gray-600 font-bold"
            :class="[column.fixed ? 'sticky z-15 bg-inherit' : '']"
            :style="getCellStyle(column)"
          >
            <text class="break-all leading-normal">
              {{ column.label || '' }}
            </text>
          </view>
        </view>

        <!-- 表格内容 -->
        <view>
          <view
            v-for="(row, index) in tableData"
            :key="index"
            class="flex border-b border-gray-100 transition-colors duration-200 active:bg-gray-50"
            :bg-color="getValuationConfig(row)?.bgColor"
            :style="getRowStyle(row)"
            @click="handleRowClick(row)"
          >
            <view
              v-for="column in visibleColumns"
              :key="column.props"
              class="box-border flex flex-shrink-0 items-center px-3 py-2 text-24rpx"
              :class="[column.fixed ? 'sticky z-5 bg-inherit' : '']"
              :style="getCellStyle(column)"
            >
              <!-- 自选列 -->
              <template v-if="column.props === 'optional'">
                <wd-icon
                  name="star-on"
                  :color="row.watchList ? '#ffd700' : '#999'"
                  size="20px"
                  @click="handleOptionalClick(row, $event)"
                />
              </template>
              <!-- 名称列（带 tag） -->
              <template v-else-if="column.props === 'name'">
                <view class="flex flex-wrap items-center gap-2">
                  <text class="break-all leading-normal" :style="{ color: getCellColor(row, column) }">
                    {{ formatValue(row, column) }}
                  </text>
                  <wd-tag
                    v-if="getValuationConfig(row)"
                    :color="getValuationConfig(row)!.textColor"
                    :bg-color="getValuationConfig(row)!.rgbaColor"
                    custom-class="valuation-tag"
                  >
                    {{ getValuationConfig(row)!.label }}
                  </wd-tag>
                </view>
              </template>
              <!-- 普通列 -->
              <template v-else>
                <text
                  class="break-all leading-normal"
                  :style="{ color: getCellColor(row, column) }"
                >
                  {{ formatValue(row, column) }}
                </text>
              </template>
            </view>
          </view>

          <!-- 空状态 -->
          <view v-if="!loading && tableData.length === 0" class="flex items-center justify-center py-20">
            暂无数据
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>
