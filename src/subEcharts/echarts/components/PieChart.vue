<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import { PieChart } from 'echarts/charts'
import { DatasetComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'

defineProps<{
  option: EChartsOption
  customClass: string
}>()

echarts.use([
  LegendComponent,
  TooltipComponent,
  DatasetComponent,
  PieChart,
  CanvasRenderer,
])
</script>

<template>
  <uni-echarts :custom-class="customClass" :option="option" />
</template>
