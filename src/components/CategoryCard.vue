<template>
  <details :open="isOpen" class="bg-white rounded-xl p-4">
    <!-- === CategoryCard.vue 修改后的 summary === -->
    <summary
      class="list-none flex flex-col gap-1 cursor-pointer select-none"
      @click.prevent="isOpen = !isOpen"
    >
      <!-- ① 头部行：图标 + 标题 + 百分比 -->
      <div class="flex items-center gap-3">
        <!-- 图标 -->
        <img :src="icon" alt="" class="w-7 h-7 shrink-0" />

        <!-- 类别标题 & 目标/当前 -->
        <div class="flex-1">
          <h3 class="font-bold">{{ cat }}</h3>
          <p class="text-xs text-gray-500">
            Target: {{ target }}{{ unit }} &nbsp; Current: {{ current }}{{ unit }}
          </p>
        </div>

        <!-- 百分比 -->
        <span class="text-sm text-gray-500">{{ percent }}%</span>
      </div>

      <!-- ② 进度条：始终可见 -->
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div
          class="h-full rounded-full bg-orange-400 transition-all"
          :style="{ width: Math.min(percent, 100) + '%' }"
        ></div>
      </div>
    </summary>



    <!-- 展开内容：食物记录列表 -->
    <ul
      v-if="isOpen"
      class="mt-2 text-sm divide-y divide-gray-100 max-h-48 overflow-y-auto pr-1"
    >
      <li v-for="log in logsByCat" :key="log.id" class="flex items-center py-2">
        <!-- 餐次点 -->
        <span :class="['w-2 h-2 rounded-full mr-2', mealDot(log.meal)]" />
        <!-- 食物名称 -->
        <span class="flex-1 capitalize">{{ log.foodName }}</span>
        <!-- 克重 -->
        <span class="w-16 text-right">{{ log.quantity }}{{ unit }}</span>
        <!-- 热量 -->
        <span class="w-20 text-right">{{ kcal(log) }}Kcal</span>
        <!-- 时间 -->
        <span class="w-16 text-right text-gray-500 text-xs">
          {{ time(log.timestamp) }}
        </span>
      </li>
    </ul>
  </details>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useIntake } from '@/composables/useIntake'

const props = defineProps<{
  cat: 'Grains' | 'Veg&Fruit' | 'Protein' | 'Fats' | 'Water'
  target: number
  icon: string
}>()

const isOpen = ref(false)
const { state } = useIntake()

const unit = props.cat === 'Water' ? 'ml' : 'g'
const current = computed(() => state.total[props.cat] || 0)
const percent = computed(() =>
  Math.round((current.value / props.target) * 100)
)

const logsByCat = computed(() =>
  state.logs.filter((l) => l.WheelGroup === props.cat)
)

const kcal = (l: any) =>
  ((l.nutrPer100g.Calories || 0) * l.quantity / 100).toFixed(0)

const mealDot = (meal: string) =>
  ({
    Breakfast: 'bg-green-500',
    Lunch: 'bg-yellow-500',
    Dinner: 'bg-red-500',
    Extra: 'bg-blue-500'
  }[meal] || 'bg-gray-400')

const time = (iso: string) =>
  new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })
</script>

<style scoped lang="postcss">
summary::-webkit-details-marker {
  display: none;
}
</style>