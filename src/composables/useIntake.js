import { reactive, computed } from 'vue'

/* 1. 推荐摄入量 */
const recommended = {
  Grains: 450, 'Veg&Fruit': 600,
  Protein: 750, Fats: 50,  Water: 1500,
}

/* 2. 全局响应式状态 */
const state = reactive({
  total: { Grains: 0, 'Veg&Fruit': 0, Protein: 0, Fats: 0, Water: 0 },
  currentMeal: 'Breakfast',     // Breakfast | Lunch | Dinner | Snack
  logs: [],                     // 操作日志
})

/* 3. 五轮摄入百分比 */
const percent = computed(() =>
  Object.fromEntries(
    Object.entries(state.total).map(
      ([k, v]) => [k, Math.round((v / recommended[k]) * 100)],
    ),
  ),
)

/* 4. 类别映射 */
function normalize(raw) {
  const map = { Carbs: 'Grains', 'Fats and Oils': 'Fats', Drinks: 'Water' }
  return map[raw] || raw
}

/* 5. 计算每 100 g 营养 */
function per100(item) {
  const q = item.quantity || 0
  if (!q) return {}
  const f = n => (n != null ? +(n * 100 / q).toFixed(2) : undefined)
  return {
    Calories: f(item.Calories), Protein: f(item.Protein),
    Fat: f(item.Fat),           Carbs: f(item.Carbs),
  }
}

/* 6. 修改函数 */
function setMeal(meal) { state.currentMeal = meal }

function add(item) {
  const g = normalize(item.WheelGroup || item.estimatedCategory)
  if (state.total[g] != null) state.total[g] += item.quantity

  state.logs.push({
    id: Date.now(),
    timestamp: new Date().toISOString(),
    meal: state.currentMeal,
    foodName: item.foodName,
    quantity: item.quantity,
    unit: item.unit,
    WheelGroup: g,
    NEVO_matched: item.NEVO_matched ?? null,
    nutrPer100g: per100(item),
  })
}

/* 7. 导出 */
export function useIntake() {
  return { state, percent, add, setMeal }
}