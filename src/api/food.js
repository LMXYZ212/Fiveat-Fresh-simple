import axios from "axios"
import { useIntake } from '@/composables/useIntake'  // 路径按你项目改
const { state } = useIntake()

const isLocalhost = window.location.hostname === 'localhost'

const BASE_URL = isLocalhost
  ? 'http://localhost:8888'  // 👈 本地开发环境
  : 'https://fiveat-backend-production.up.railway.app'  // 👈 部署后的后端地址

export const parseFoodText = async (text) => {
  const { data } = await axios.post(`${BASE_URL}/api/text`, { text })
  return data.foodItems
}

export async function parseFoodTextLite(text) {
  const { data } = await axios.post(`${BASE_URL}/api/text-parse`, { text })
  return data.parsedItems
}

export async function parseFoodAudio(file) {
  const form = new FormData()
  form.append('file', file)
  const { data } = await axios.post(`${BASE_URL}/api/audio`, form)
  return data.parsedItems
}

export async function parseFoodImage(file) {
  const form = new FormData()
  form.append('file', file)
  const { data } = await axios.post(`${BASE_URL}/api/image`, form)
  return data.parsedItems
}

export async function confirmItems(items) {
  const { data } = await axios.post(`${BASE_URL}/api/confirm`, items)
  return data.parsedItems
}

// console.log('🍽️ 当前 logs:', state.logs)