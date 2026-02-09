<script setup lang="ts">
import type { AgencyConfigView, DisplayContentOption, MarketingPageView } from './api/marketing'
import { previewMarketingPage, queryMarketingPage } from './api/marketing'
import marketBg from './assets/images/market-bg.svg'
import marketHead from './assets/images/market-head.png'
import marketPlan from './assets/images/market-plan.png'
import marketRange from './assets/images/market-range.png'
import marketTime from './assets/images/market-time.png'

definePage({
  name: 'tamp-marketing',
  layout: 'default',
  style: {
    navigationBarTitleText: '产品介绍',
  },
})

const route = useRoute()
const store = useTampStore()
const shopId = computed(() => (route.query.shopId as string) || (store.externalInfo?.shopId as string) || '')
const portfolioCode = computed(() => (route.query.portfolioCode as string) || '')
const isPreview = computed(() => route.query.preview === '1')

const {
  data,
  loading,
  error,
} = useRequest(() => {
  const params = {
    shopId: shopId.value,
    portfolioCode: portfolioCode.value,
  }
  return isPreview.value
    ? previewMarketingPage(params)
    : queryMarketingPage(params)
}, { immediate: true })

const marketingInfo = computed<MarketingPageView | null>(() => {
  const result = data.value as any
  return result?.data || null
})

const displayContents = computed<DisplayContentOption[]>(() => {
  const info = marketingInfo.value
  if (!info)
    return []
  if (!info.selectedDisplayContents?.length)
    return info.displayContents || []
  return (info.displayContents || []).filter(item => info.selectedDisplayContents.includes(item.type))
})

const agencies = computed<AgencyConfigView[]>(() => marketingInfo.value?.agencies || [])
const filterByDirectAgency = computed(() =>
  agencies.value.filter(i => i.isDirectSale),
)
const filterByConsignmentAgency = computed(() =>
  agencies.value.filter(i => !i.isDirectSale),
)
const displayOrder = ['HOLD_TIME', 'ALLOCATION_PLAN', 'INVEST_PLAN'] as const
const orderedContents = computed(() => {
  const info = marketingInfo.value
  if (!info)
    return [] as DisplayContentOption[]

  const allMap = new Map((info.displayContents || []).map(item => [item.type, item]))
  const selected = info.selectedDisplayContents || []
  const selectedSet = new Set(selected)

  return displayOrder
    .map((type) => {
      const item = allMap.get(type)
      if (!item)
        return undefined
      if (selected.length === 0)
        return item
      if (type === 'HOLD_TIME')
        return item
      return selectedSet.has(type) ? item : undefined
    })
    .filter(Boolean) as DisplayContentOption[]
})

const investTargetDescription = computed(() => {
  const item = displayContents.value.find(it => it.type === 'INVEST_TARGET')
  return item?.description || '—'
})

const holdTimeDescription = computed(() => {
  const item = displayContents.value.find(it => it.type === 'HOLD_TIME')
  return item?.description || ''
})

const typeMeta: Record<string, { label: string, icon: string }> = {
  HOLD_TIME: { label: '组合建议持有时间', icon: marketTime },
  INVEST_TARGET: { label: '投资目标', icon: marketHead },
  ALLOCATION_PLAN: { label: '配置方案', icon: marketPlan },
  INVEST_PLAN: { label: '投资范围', icon: marketRange },
}

const showAgencyModal = ref(false)

function openAgencyModal() {
  showAgencyModal.value = true
}

function copyAgencyLink(url?: string) {
  if (!url)
    return
  uni.setClipboardData({
    data: url,
    success: () => {
      uni.showToast({ title: '已复制链接', icon: 'none' })
    },
  })
}
</script>

<template>
  <view class="min-h-screen bg-[#eaf1ff] text-slate-900">
    <view v-if="loading" class="min-h-screen flex flex-col items-center justify-center gap-4">
      <wd-loading />
      <text class="text-sm text-slate-500">
        加载中...
      </text>
    </view>

    <view v-else-if="error" class="min-h-screen flex flex-col items-center justify-center gap-4">
      <text class="text-sm text-red-500">
        加载失败，请重试
      </text>
    </view>

    <view v-else class="px-4 pb-24 pt-4" :style="{ backgroundImage: `url(${marketBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }">
      <view
        class="pt-8"
      >
        <view class="market-title absolute top-20 line-clamp-2 pr-[300rpx] text-[40rpx] text-[46rpx] text-[46rpx] text-[#1F37C4] tracking-[2rpx]">
          {{ marketingInfo?.portfolioName || '产品组合' }}
        </view>

        <image :src="marketHead" class="absolute right-0 top-0 h-[294rpx] w-[416rpx]" mode="aspectFit" />
      </view>

      <view class="mt-6 flex flex-col gap-4 pt-20">
        <text class="text-[#1D2129]0 text-[28rpx]">
          {{ investTargetDescription }}
        </text>
        <view
          v-for="item in orderedContents"
          :key="item.type"
          class="rounded-[24rpx] bg-white/90 px-2 py-4 shadow-[0_12rpx_24rpx_rgba(30,64,175,0.08)]"
        >
          <view class="flex items-center gap-3">
            <view class="h-[56rpx] w-[56rpx]">
              <image
                :src="typeMeta[item.type]?.icon"
                class="h-full w-full"
                mode="aspectFit"
              />
            </view>
            <text class="text-[28rpx] text-#1678ff font-semibold">
              {{ typeMeta[item.type]?.label || item.type }}
            </text>
            <view v-if="item.type === 'HOLD_TIME'" class="flex items-center justify-between">
              <text class="text-[26rpx] text-slate-600">
                {{ holdTimeDescription }}
              </text>
            </view>
          </view>
          <view v-if="item.type !== 'HOLD_TIME'" class="mt-3 text-[28rpx] text-[#1D2129]">
            <text>
              {{ item.description }}
            </text>
          </view>
        </view>
      </view>

      <view class="mt-8 text-center text-[22rpx] text-slate-400">
        投资有风险，入市需谨慎
      </view>
    </view>

    <view class="fixed bottom-0 left-0 right-0 bg-[#eaf1ff] px-0">
      <view class="rounded-[22rpx] px-4 py-4 shadow-[0_12rpx_24rpx_rgba(15,23,42,0.08)]">
        <wd-button
          type="primary"
          size="large"
          class="w-full rounded-full bg-[linear-gradient(90deg,_#4e8dff,_#1e6bff)] py-3 text-[30rpx] text-white font-semibold shadow-[0_12rpx_24rpx_rgba(30,107,255,0.25)]"
          @click="openAgencyModal"
        >
          查看销售机构
        </wd-button>
      </view>
    </view>

    <wd-popup v-model="showAgencyModal" root-portal position="bottom" closeable close-icon custom-style="border-radius: 24rpx 24rpx 0 0;">
      <view class="agency-scroll max-h-[1000rpx] min-h-[300rpx] px-[30rpx] py-[40rpx]">
        <view v-if="filterByConsignmentAgency.length">
          <text class="text-[36rpx] text-[#1D2129] font-medium">
            合作机构
          </text>
          <view
            v-for="item in filterByConsignmentAgency"
            :key="item.agencyCode"
            :class="{
              'pointer-events-none': isPreview,
            }"
            class="h-[94rpx] flex items-center justify-between"
          >
            <text class="text-[30rpx] text-[#4E5969]">
              {{ item.agencyName }}
            </text>
            <wd-button
              size="small"
              plain
              hairline
              @click="
                () => copyAgencyLink(item.jumpUrl)
              "
            >
              复制链接
            </wd-button>
          </view>
        </view>
        <view v-if="filterByDirectAgency.length" class="pt-[40rpx]">
          <text class="text-[36rpx] text-[#1D2129] font-500 font-medium">
            本机构
          </text>
          <view
            v-for="item in filterByDirectAgency"
            :key="item.agencyCode"
            class="h-[94rpx] flex items-center justify-between"
          >
            <text class="text-[30rpx] text-[#4E5969]">
              华宝证券
            </text>
            <view class="disable-block relative">
              <view
                class="disable-tooltip absolute right-0 top-[-10rpx] w-[320rpx] rounded-[8rpx] bg-black px-[5rpx] py-[20rpx] text-center text-[24rpx] text-white font-normal leading-[24rpx] opacity-80 -translate-y-full"
              >
                用户可以在移动端直接购买
              </view>
              <wd-button
                :class="{
                  'pointer-events-none': isPreview,
                  'bg-[#1678ff33]': isPreview,
                }"
                size="small"
                @tap="toInvestmentDetail(portfolioCode)"
              >
                立即购买
              </wd-button>
            </view>
          </view>
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<style lang="scss" scoped>
.market-title::after {
  content: '';
  display: block;
  width: 8rpx;
  height: 8rpx;
  background: #1678ff;
  transform: rotate(45deg);
  position: absolute;
  bottom: -19rpx;
  transform-origin: center center;
  margin-bottom: -4rpx;
}

.market-title::before {
  content: '';
  display: block;
  width: 100%;
  height: 1px;
  background: linear-gradient(to right, #1678ff, #4f75cd00);
  margin-left: 28rpx;
  position: absolute;
  bottom: -19rpx;
  margin-bottom: -0.5rpx;
}
</style>
