<template>
  <div class="min-h-screen bg-white px-4 pb-24 max-w-sm mx-auto select-none">
    <!-- 日期头部 -->
    <header class="text-center pt-6">
      <h1 class="text-2xl font-bold">Today</h1>
      <p class="text-gray-500 text-sm mt-1">{{ todayStr }}</p>
    </header>

    <!-- 卡路里圆环 + 五轮状态 -->
    <section class="bg-white rounded-xl shadow p-4 mt-4 flex items-center gap-4">
      <!-- 卡路里半圆 -->
      <svg viewBox="-110 -110 220 220" class="w-36 h-36">
        <path d="M0,0 m-90,0 a90,90 0 1 1 180,0" fill="none" stroke="#e5e7eb" stroke-width="18"
          stroke-linecap="round" />
        <path :d="arcPath" fill="none" stroke="#f4a300" stroke-width="18" stroke-linecap="round"
          :stroke-dasharray="arcLen" :stroke-dashoffset="arcLen - arcLen * kcalPct"
          style="transition: stroke-dashoffset 0.5s" />
        <text x="0" y="-35" text-anchor="middle" class="fill-gray-800 font-bold text-2xl">{{ eatenKcal }}</text>
        <text x="0" y="-15" text-anchor="middle" class="fill-gray-600 text-m">kcal Eaten</text>
        <text x="0" y="6" text-anchor="middle" class="fill-gray-400 text-s">{{ remainingKcal }} kcal remains</text>
      </svg>

      <!-- 各类状态 -->
      <ul class="flex-1 space-y-1 text-xs leading-snug">
        <li v-for="c in categoryInfo" :key="c.key" class="flex items-center gap-2">
          <span :class="['inline-block w-3 h-3 rounded-full border',
            c.done ? 'bg-orange-400 border-orange-400' : 'border-gray-400']" />
          <span>
            <template v-if="c.done">{{ c.label }} completed</template>
            <template v-else>{{ c.remain }}{{ c.unit }} {{ c.label }} remains</template>
          </span>
        </li>
      </ul>
    </section>

    <!-- 分类进度卡片 -->
    <CategoryCard v-for="cat in order" :key="cat" :cat="cat" :target="targets[cat]" :icon="icons[cat]"
      class="mt-4 shadow" />

    <!-- 添加按钮（复用你的逻辑） -->
    <button @click="showSelector = true" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50
             w-16 h-16 rounded-full bg-orange-400 text-white
             flex items-center justify-center text-3xl shadow-lg
             active:scale-95 transition">
      +
    </button>

    <!-- 添加弹窗（使用你已有的 AddFoodDialog.vue） -->
    <AddFoodDialog v-if="showSelector" @close="showSelector = false" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import CategoryCard from '@/components/CategoryCard.vue'
import AddFoodDialog from '@/components/AddFoodDialog.vue'
import { useIntake } from '@/composables/useIntake'

/* 日期 */
const todayStr = new Date().toLocaleDateString('en-US', {
  month: 'short', day: 'numeric', year: 'numeric'
})

/* 数据 */
const { state } = useIntake()

/* 总卡路里计算 */
const kcalGoal = 2500
const eatenKcal = computed(() =>
  state.logs.reduce((s, l) => s + (l.nutrPer100g.Calories || 0) * l.quantity / 100, 0).toFixed(0)
)
const remainingKcal = computed(() => Math.max(kcalGoal - +eatenKcal.value, 0).toFixed(0))
const kcalPct = computed(() => Math.min(+eatenKcal.value / kcalGoal, 1))

/* 半圆路径 */
const R = 90
const arcLen = Math.PI * R
const arcPath = `M0,0 m-${R},0 a${R},${R} 0 1 1 ${R * 2},0`

/* 每类五轮 */
const order = ['Grains', 'Veg&Fruit', 'Protein', 'Fats', 'Water'] as const
const targets = {
  Grains: 450, 'Veg&Fruit': 600, Protein: 750, Fats: 50, Water: 1500
}
const categoryInfo = computed(() =>
  order.map(k => {
    const cur = state.total[k] || 0
    const tgt = targets[k]
    return {
      key: k,
      label: k,
      remain: (tgt - cur > 0) ? (tgt - cur).toFixed(0) : 0,
      unit: k === 'Water' ? 'ml' : 'g',
      done: cur >= tgt
    }
  })
)

/* 图标路径（你可以换成你自己的图） */
const icons = {
  Grains: '/pic/Grains.svg',
  'Veg&Fruit': '/pic/Veg&Fruit.svg',
  Protein: '/pic/Proteins.svg',
  Fats: '/pic/Fat&Oils.svg',
  Water: '/pic/Water.svg'
}

/* 控制添加弹窗 */
const showSelector = ref(false)
</script>

<style scoped>
/* 视觉细节样式在组件内设置，这里可以留空或自定义字体等 */
</style>