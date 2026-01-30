<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import { LineChart } from 'echarts/charts'
import { DatasetComponent, GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'

defineProps<{
  option: EChartsOption
  customClass: string
}>()

echarts.use([
  GridComponent,
  LegendComponent,
  TooltipComponent,
  DatasetComponent,
  LineChart,
  CanvasRenderer,
])
</script>

<template>
  <uni-echarts :custom-class="customClass" :option="option" />
</template>
