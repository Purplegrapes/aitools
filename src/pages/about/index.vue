<script setup lang="ts">
definePage({
  name: 'about',
  layout: 'tabbar',
  style: {
    navigationBarTitleText: '关于',
  },
})
</script>

<template>
  <view class="bg-gray-100 py-3 dark:bg-[var(--wot-dark-background)]">
    <!-- 头部介绍 -->
    <view class="mx-3 mb-3 flex flex-col gap-2">
      <text class="text-6 text-gray-800 font-bold dark:text-[var(--wot-dark-color)]">
        关于我们
      </text>
      <text class="text-3.5 text-gray-600 leading-snug dark:text-[var(--wot-dark-color2)]">
        我是不如摸鱼去，一个前端打工仔，我和我的小伙伴们正在致力于开发轻量、高效的uni-app组件库和高效、易用的uni-app快速开发模板。
      </text>
    </view>
  </view>
</template>
