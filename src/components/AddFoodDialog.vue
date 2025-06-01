<template>
  <div class="relative w-full h-full select-none">

    <!-- ✅ 最终推荐版本 -->
    <button @click="showSelector = true" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50
            w-16 h-16 rounded-full bg-orange-400 text-white
            flex items-center justify-center text-3xl shadow-lg
            active:scale-95 transition" aria-label="Add food">
      +
    </button>

    <!-- 1. 餐次选择 Bottom-Sheet 半框 -->
    <div v-if="showSelector" @click.self="showSelector = false"
      class="fixed inset-0 z-40 flex flex-col justify-end bg-black/40 backdrop-blur-sm">
      <!-- bottom sheet body -->
      <div class="bg-white rounded-t-3xl pt-3 pb-8 px-6 space-y-6
               shadow-[0_-8px_32px_rgba(0,0,0,0.12)]">
        <!-- drag handle -->
        <div class="w-12 h-1.5 bg-gray-300 rounded-full mx-auto" />

        <h3 class="text-lg font-semibold text-center">
          Which meal you wat to add？
        </h3>

        <!-- 四宫格按钮 -->
        <div class="grid grid-cols-2 gap-4">
          <button v-for="meal in meals" :key="meal" class="aspect-square rounded-xl border border-gray-200
                   shadow-sm flex flex-col items-center justify-center space-y-2
                   active:scale-95 transition" @click="gotoMeal(meal)">
            <div class="w-10 h-10 rounded-full bg-primary text-white
                     flex items-center justify-center text-2xl">
              +
            </div>
            <span class="text-sm font-medium text-gray-700">{{ meal }}</span>
          </button>
        </div>

        <button class="w-full text-center text-sm text-gray-500 underline" @click="showSelector = false">
          取消
        </button>
      </div>
    </div>

    <!-- 2. 食物输入（Breakfast / Lunch … 页面） -->
    <div v-if="inInputMode" class="fixed inset-0 z-50 bg-white p-6 overflow-auto space-y-6">
      <!-- 顶部导航栏 -->
      <header class="flex items-center justify-between">
        <ChevronLeftIcon @click="exitInput" class="w-6 h-6 text-primary cursor-pointer" />
        <h2 class="text-xl font-bold">{{ selectedMeal }}</h2>
        <!-- 占位让标题水平居中 -->
        <div class="w-6 h-6" />
      </header>

      <!-- (可选) 输入提示 -->
      <p class="text-sm text-gray-500">
        Enter the food name and weight (g)
      </p>

      <!-- 语音 / 图像搜索按钮（启用 + 接事件） -->
      <div class="flex gap-4">
        <!-- 🎤 语音输入按钮 -->
        <button class="flex-1 flex items-center justify-center gap-2 py-2
                bg-gray-100 rounded-lg text-gray-600 active:scale-95 transition" @click="handleVoiceInput">
          <MicrophoneIcon class="w-5 h-5" />
          <span class="text-sm font-medium">Voice</span>
        </button>

        <!-- 📷 图像输入按钮（触发隐藏 input） -->
        <input type="file" accept="image/*" hidden ref="imageInput" @change="handleImageInput" />
        <button class="flex-1 flex items-center justify-center gap-2 py-2
                bg-gray-100 rounded-lg text-gray-600 active:scale-95 transition" @click="() => imageInput?.click()">
          <CameraIcon class="w-5 h-5" />
          <span class="text-sm font-medium">Image</span>
        </button>
      </div>

      <!-- 输入框 + 添加按钮 -->
      <div class="space-y-3">
        <input v-model="input" type="text" placeholder="e.g. 200 ml milk"
          class="w-full border rounded-lg p-3 focus:outline-none focus:ring" />
        <button @click="handleSubmit" :disabled="loading" class="w-full py-3 rounded-lg bg-primary text-white
                 disabled:opacity-50 active:scale-95 transition">
          {{ loading ? 'Analyzing…' : 'Add' }}
        </button>

        <!-- ✨ 新增 “解析” 按钮 ✨ -->
        <button @click="handleParse" :disabled="loading"
          class="w-full py-3 rounded-lg bg-blue-500 text-white disabled:opacity-50 active:scale-95 transition">
          {{ loading ? 'Analyzing…' : 'Analyze' }}
        </button>
      </div>

      <!-- Quick Add 列表 -->
      <!-- Quick Add + 解析候选 -->
      <section v-if="quickFoods.length" class="mt-4">

        <!-- ✅ 解析结果候选，可编辑 -->
        <section v-if="candidates.length" class="mb-6 border-t pt-4">
          <h3 class="mb-2 text-lg font-semibold">Add Manually</h3>
          <div class="flex items-center gap-2 px-3 text-xs font-semibold text-gray-500">
            <span class="flex-1">Food name</span>
            <span class="basis-[10.5rem] text-left pl-1">Quantity (g/ml)</span>
          </div>
          <ul class="space-y-3">
            <li v-for="(c, idx) in candidates" :key="idx"
              class="flex items-center gap-2 py-2 px-3 border rounded-lg bg-gray-50">
              <!-- 食物名 -->
              <input v-model="c.foodName" type="text" class="flex-1 border rounded px-2 py-1 text-sm" />
              <!-- 克重 -->
              <input v-model.number="c.quantity" type="number"
                class="w-16 border rounded px-2 py-1 text-right text-sm mr-1" />
              <!-- 确认按钮 -->
              <!-- 使用 Heroicons ✔ 或直接字符 -->
              <button @click="confirmOne(idx)"
                      type="button"
                      class="w-8 h-8 rounded-full border border-primary text-primary
                            flex items-center justify-center active:scale-90">
                <!-- 方法 A：直接字符 -->
                ✔
                <!-- 方法 B：Heroicons -->
                <!-- <CheckIcon class="w-5 h-5" /> -->
              </button>
              <button @click="removeCandidate(idx)"
                      type="button"
                      class="w-8 h-8 ml-1 rounded-full border border-gray-300 text-gray-500
                            flex items-center justify-center active:scale-90">
                <!-- 直接字符 -->
                ✖
                <!-- 或 Heroicons -->
                <!-- <XMarkIcon class="w-4 h-4" /> -->
              </button>
            </li>
          </ul>
        </section>

        <!-- Quick Add 列表（保持原样） -->
        <h3 class="mb-2 text-lg font-semibold">Quick Add</h3>
        <ul class="divide-y divide-gray-200">
          <li v-for="food in quickFoods" :key="food.name" class="flex items-center py-3">
            <img :src="food.img" alt="" class="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
            <div class="ml-3 flex-1">
              <p class="font-medium">{{ food.name }}</p>
              <p class="text-xs text-gray-500">{{ food.desc }}</p>
            </div>
            <button class="w-9 h-9 rounded-full border border-primary text-primary
                    flex items-center justify-center text-xl active:scale-90 transition" @click="addQuick(food)">
              +
            </button>
          </li>
        </ul>
      </section>
    </div>
    <VoiceRecordOverlay v-if="showRecorder" :seconds="recordSeconds" @confirm="stopRecording" />
    <!-- 🔄 解析 Loading Overlay -->
    <div v-if="parseLoading"
        class="fixed inset-0 z-[60] flex flex-col items-center justify-center
                bg-black/40 backdrop-blur-sm space-y-6">
      <!-- 简单旋转图标 -->
      <svg class="animate-spin h-12 w-12 text-white" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10"
                stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
      </svg>

      <!-- 可选文字 -->
      <p class="text-white text-sm">Analyzing…</p>

      <!-- ⏱ 超过 10 s 才出现 -->
      <button v-if="showCancelBtn"
              @click="cancelParsing"
              class="px-4 py-2 rounded bg-white/90 text-primary text-sm font-medium">
        Cancel
      </button>
    </div>

  </div>
</template>

<script setup lang="ts">
/* ------------------------------------------------------------------ */
/*  ① 依赖与全局状态                                                 */
/* ------------------------------------------------------------------ */
import { ref, nextTick } from 'vue'
import {
  ChevronLeftIcon,
  MicrophoneIcon,
  CameraIcon,
  CheckIcon,     // ✅ 新增
  XMarkIcon      // ❌ 删除按钮也一起引入
} from '@heroicons/vue/24/outline'

import { parseFoodText } from '@/api/food'
import { useIntake } from '@/composables/useIntake'

const { add, state } = useIntake()

import { confirmItems } from '@/api/food'

import axios from 'axios'
import { parseFoodTextLite } from '@/api/food'
import { parseFoodAudio, parseFoodImage } from '@/api/food'

import VoiceRecordOverlay from '@/components/VoiceRecordOverlay.vue'

const showRecorder = ref(false)
const recordSeconds = ref(0)
const mediaRecorder = ref<MediaRecorder | null>(null)
let timer: any = null
let chunks: Blob[] = []

import { watch } from 'vue'

// 🔄 解析阶段的 loading 开关 & 10s 定时
const parseLoading    = ref(false)
const showCancelBtn   = ref(false)
let   cancelTimer: any = null    // 保存 setTimeout 句柄




function startParsing() {
  parseLoading.value  = true
  showCancelBtn.value = false
  // 10 秒后才显示 Cancel
  cancelTimer = setTimeout(() => (showCancelBtn.value = true), 10_000)
}

function stopParsing() {
  parseLoading.value  = false
  showCancelBtn.value = false
  clearTimeout(cancelTimer)
}

function cancelParsing() {
  stopParsing()
  // 直接回到输入页（用户可重新操作）
  // 若需要进一步清理，也可在此 reset 某些变量
}

// 👇 识别候选结果（后端 text-parse 返回的结构）
const candidates = ref<
  { foodName: string; quantity: number; unit?: string }[]
>([])

const imageInput = ref<HTMLInputElement | null>(null)   // 隐藏文件选择

function removeCandidate(idx: number) {
  candidates.value.splice(idx, 1)
  // 若删完后列表空了，自动退出输入界面
  // if (!candidates.value.length) exitInput()
}

async function handleVoiceInput() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  mediaRecorder.value = new MediaRecorder(stream)
  chunks = []

  mediaRecorder.value.ondataavailable = e => chunks.push(e.data)
  mediaRecorder.value.onstop = async () => {
    const blob = new Blob(chunks);


    const file = new File([blob], 'recording', { type: blob.type });

    console.log('🎤 Uploaded file', file, file.size, file.type)
    startParsing()
    try {
      const parsed = await parseFoodAudio(file)

      // ✅ 显示输入页面 + 赋值候选项
      inInputMode.value = true
      candidates.value = parsed
    } catch (err) {
      console.error('🎤 upload or parse failed:', err)
    }
    finally { stopParsing() }
  }
  mediaRecorder.value.start()
  recordSeconds.value = 0
  showRecorder.value = true
  timer = setInterval(() => recordSeconds.value++, 1000)
}

async function stopRecording() {
  clearInterval(timer)
  mediaRecorder.value?.stop()
  showRecorder.value = false
  recordSeconds.value = 0

  // MediaRecorder.onstop 会触发下面解析逻辑
}



async function handleImageInput(e: Event) {
  const file = (e.target as HTMLInputElement)?.files?.[0]
  if (!file) return
  startParsing()
  try {
    candidates.value = await parseFoodImage(file)   // ✅ 获取候选食物项
    inInputMode.value = true                        // ✅ 切换回输入界面
  } catch (err) {
    console.error('📷 upload or parse failed:', err)
  }
  finally { stopParsing() }
}

async function handleParse() {
  const text = input.value.trim()
  if (!text) return
  loading.value = true
  startParsing()
  try {
    candidates.value = await parseFoodTextLite(text)   // 调新接口
  } catch (e) {
    console.error('text-parse failed', e)
  } finally {
    loading.value = false
    stopParsing() 
  }
}

// async function confirmOne(idx: number) {
//   const item = candidates.value[idx]
//   try {
//     const { data } = await axios.post('/api/confirm', [item])
//     const ok = (data.parsedItems ?? data.foodItems)?.[0]
//     if (ok?.NEVO_matched) {
//       const group = normalizeGroup(ok.WheelGroup)
//       add({ ...ok, WheelGroup: group, MealType: selectedMeal.value })
//       candidates.value.splice(idx, 1)        // 移除已确认
//       if (!candidates.value.length) exitInput()
//     } else {
//       alert('NEVO 未匹配，请修改名称后重试')
//     }
//   } catch (e) {
//     console.error('confirm 错误', e)
//   }
// }
/* ------------------------------------------------------------------ */
/* ① 基础配置：自动判断本地 / 线上后端地址                             */
/* ------------------------------------------------------------------ */
const BASE_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:8888'                            // 本地 FastAPI 端口
    : 'https://fiveat-backend-production.up.railway.app' // Railway 端口

/* ------------------------------------------------------------------ */
/* ② confirmOne：点击 “+” 时调用 /api/confirm                         */
/* ------------------------------------------------------------------ */
async function confirmOne(idx: number) {
  const item = candidates.value[idx]          // 当前候选项

  try {
    // 1. 把单条候选项发送给后端确认
    const { data } = await axios.post(`${BASE_URL}/api/confirm`, [item])

    // 2. 解析后端返回
    const ok = (data.parsedItems ?? data.foodItems)?.[0]

    if (ok?.NEVO_matched) {
      // 3. 正确匹配 → 写入 Intake 全局状态
      const group = normalizeGroup(ok.WheelGroup)
      add({ ...ok, WheelGroup: group, MealType: selectedMeal.value })

      // 4. 移除已确认项，若无剩余则退出输入模式
      candidates.value.splice(idx, 1)
      if (!candidates.value.length) exitInput()
    } else {
      alert('NEVO did not match, please modify the name and try again')
    }
  } catch (e) {
    console.error('confirm error', e)
    alert('Submission confirmation failed, please try again later')
  }
}

/* ------------------------------------------------------------------ */
/*  ② 本组件响应式变量                                               */
/* ------------------------------------------------------------------ */
const showSelector = ref(false)   // 控制 Bottom-Sheet
const inInputMode = ref(false)   // 是否在输入界面
const selectedMeal = ref('')      // 当前餐次
const input = ref('')      // 手动输入
const loading = ref(false)   // 提交加载状态
const meals = ['Breakfast', 'Lunch', 'Dinner', 'Extra'] as const

/* Quick Add 示例数据，可替换为后端/本地数据 */
const quickFoods = [
  {
    name: 'Mango Salad',
    desc: '200 g  398 kcal',
    img: '/pic/mango.jpeg',
  },
  {
    name: 'Croissant',
    desc: '95 g  300 kcal',
    img: '/pic/croissant.jpeg',
  },
  {
    name: 'Coffee',
    desc: '200 ml  25 kcal',
    img: '/pic/coffee.jpeg',
  },
  {
    name: 'Beef fat',
    desc: '10 g  98 kcal',
    img: '/pic/beeffat.jpeg',
  },
  {
    name: 'Grilled Chicken',
    desc: '150 g  330 kcal',
    img: '/pic/chicken.jpeg',
  }
]

/* ------------------------------------------------------------------ */
/*  ③ 事件函数                                                       */
/* ------------------------------------------------------------------ */
const { setMeal } = useIntake()

function gotoMeal(meal: string) {
  showSelector.value = false
  selectedMeal.value = meal
  setMeal(meal)
  nextTick(() => (inInputMode.value = true))
}

function exitInput() {
  inInputMode.value = false
  input.value = ''
}

function normalizeGroup(raw: string | null | undefined) {
  const map: Record<string, string> = {
    Carbs: 'Grains',
    'Fats and Oils': 'Fats',
    null: 'Grains',
    undefined: 'Grains',
  }
  return map[String(raw)] || raw
}

async function handleSubmit() {
  const text = input.value.trim()
  if (!text) return

  loading.value = true
  try {
    const items = await parseFoodText(text) // 已包含 WheelGroup + 营养字段
    items.forEach(add) // ✅ 只需 add(item)，自动记录日志
    // console.log(state.logs)
    exitInput()
  } catch (err) {
    console.error('❌ 解析或累加失败', err)
  } finally {
    loading.value = false
  }
}

watch(candidates, (vals) => {
  if (vals.length && parseLoading.value) stopParsing()
})

async function addQuick(food) {
  const defaultQtyMap = {
    'Mango Salad': 200,
    'Croissant': 95,
    'Coffee': 200,
    'Beef Fat': 10,
    'Grilled Chicken': 150  
  }

  const qty = defaultQtyMap[food.name] || 10

  try {
    const confirmed = await confirmItems([{ foodName: food.name, quantity: qty }])
    confirmed.forEach(add)  // ✅ 自动写入 total + logs
    // console.log(state.logs)
    exitInput()
  } catch (e) {
    console.error('Quick Add 失败', e)
    alert('Quick Add failed, try again later')
  }
}
/* ------------------------------------------------------------------ */
</script>

<style scoped>
/* TailwindCSS 已覆盖，大多无需额外样式 */
</style>