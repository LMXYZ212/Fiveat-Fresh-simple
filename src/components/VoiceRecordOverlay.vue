<template>
  <div class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
    <div class="flex flex-col items-center space-y-4">
      <!-- 红色圆圈动画 -->
      <div class="w-24 h-24 rounded-full border-4 border-red-500 animate-pulse" />
      <!-- 秒数 -->
      <p class="text-white text-lg font-bold">Recording… {{ seconds }}s</p>
      <!-- 确认按钮 -->
      <button
        @click="$emit('confirm')"
        class="px-4 py-2 rounded bg-white text-red-500 font-bold"
      >
        ✅ Done
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ seconds: number }>()
defineEmits(['confirm'])
</script>