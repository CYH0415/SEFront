<template>
  <div 
    v-if="visible && timeSlotInfo"
    class="time-slot-tooltip"
    :style="{ left: position.x + 'px', top: position.y + 'px' }"
  >
    <div class="tooltip-content">
      <div class="tooltip-header">
        <span class="slot-id">时间段信息 ({{ timeSlotInfoList.length }}个)</span>
      </div>
      <div class="tooltip-body">
        <div 
          v-for="(slot, index) in timeSlotInfoList" 
          :key="slot.id"
          class="slot-item"
          :class="{ 'not-last': index < timeSlotInfoList.length - 1 }"
        >
          <div class="slot-header">
            <span class="slot-number">时间段 {{ slot.id }}</span>
          </div>
          <div class="info-row">
            <span class="label">星期:</span>
            <span class="value">{{ getDayName(slot.day) }}</span>
          </div>
          <div class="info-row">
            <span class="label">时间:</span>
            <span class="value">{{ slot.startTime.slice(0, 5) }} - {{ slot.endTime.slice(0, 5) }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="tooltip-arrow"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface TimeSlotData {
  id: number
  day: number
  startTime: string
  endTime: string
}

const props = defineProps<{
  visible: boolean
  timeSlotIds: string
  position: { x: number; y: number }
}>()

// 时间段数据映射 (基于提供的SQL数据)
const timeSlotData: TimeSlotData[] = [
  // 周一 (day=1)
  { id: 1, day: 1, startTime: '08:00:00', endTime: '08:50:00' },
  { id: 2, day: 1, startTime: '09:00:00', endTime: '09:50:00' },
  { id: 3, day: 1, startTime: '10:00:00', endTime: '10:50:00' },
  { id: 4, day: 1, startTime: '11:00:00', endTime: '11:50:00' },
  { id: 5, day: 1, startTime: '13:00:00', endTime: '13:50:00' },
  { id: 6, day: 1, startTime: '14:00:00', endTime: '14:50:00' },
  { id: 7, day: 1, startTime: '15:00:00', endTime: '15:50:00' },
  { id: 8, day: 1, startTime: '16:00:00', endTime: '16:50:00' },
  { id: 9, day: 1, startTime: '17:00:00', endTime: '17:50:00' },
  { id: 10, day: 1, startTime: '19:00:00', endTime: '19:50:00' },
  { id: 11, day: 1, startTime: '20:00:00', endTime: '20:50:00' },
  { id: 12, day: 1, startTime: '21:00:00', endTime: '21:50:00' },
  
  // 周二 (day=2)
  { id: 13, day: 2, startTime: '08:00:00', endTime: '08:50:00' },
  { id: 14, day: 2, startTime: '09:00:00', endTime: '09:50:00' },
  { id: 15, day: 2, startTime: '10:00:00', endTime: '10:50:00' },
  { id: 16, day: 2, startTime: '11:00:00', endTime: '11:50:00' },
  { id: 17, day: 2, startTime: '13:00:00', endTime: '13:50:00' },
  { id: 18, day: 2, startTime: '14:00:00', endTime: '14:50:00' },
  { id: 19, day: 2, startTime: '15:00:00', endTime: '15:50:00' },
  { id: 20, day: 2, startTime: '16:00:00', endTime: '16:50:00' },
  { id: 21, day: 2, startTime: '17:00:00', endTime: '17:50:00' },
  { id: 22, day: 2, startTime: '19:00:00', endTime: '19:50:00' },
  { id: 23, day: 2, startTime: '20:00:00', endTime: '20:50:00' },
  { id: 24, day: 2, startTime: '21:00:00', endTime: '21:50:00' },
  
  // 周三 (day=3)
  { id: 25, day: 3, startTime: '08:00:00', endTime: '08:50:00' },
  { id: 26, day: 3, startTime: '09:00:00', endTime: '09:50:00' },
  { id: 27, day: 3, startTime: '10:00:00', endTime: '10:50:00' },
  { id: 28, day: 3, startTime: '11:00:00', endTime: '11:50:00' },
  { id: 29, day: 3, startTime: '13:00:00', endTime: '13:50:00' },
  { id: 30, day: 3, startTime: '14:00:00', endTime: '14:50:00' },
  { id: 31, day: 3, startTime: '15:00:00', endTime: '15:50:00' },
  { id: 32, day: 3, startTime: '16:00:00', endTime: '16:50:00' },
  { id: 33, day: 3, startTime: '17:00:00', endTime: '17:50:00' },
  { id: 34, day: 3, startTime: '19:00:00', endTime: '19:50:00' },
  { id: 35, day: 3, startTime: '20:00:00', endTime: '20:50:00' },
  { id: 36, day: 3, startTime: '21:00:00', endTime: '21:50:00' },
  
  // 周四 (day=4)
  { id: 37, day: 4, startTime: '08:00:00', endTime: '08:50:00' },
  { id: 38, day: 4, startTime: '09:00:00', endTime: '09:50:00' },
  { id: 39, day: 4, startTime: '10:00:00', endTime: '10:50:00' },
  { id: 40, day: 4, startTime: '11:00:00', endTime: '11:50:00' },
  { id: 41, day: 4, startTime: '13:00:00', endTime: '13:50:00' },
  { id: 42, day: 4, startTime: '14:00:00', endTime: '14:50:00' },
  { id: 43, day: 4, startTime: '15:00:00', endTime: '15:50:00' },
  { id: 44, day: 4, startTime: '16:00:00', endTime: '16:50:00' },
  { id: 45, day: 4, startTime: '17:00:00', endTime: '17:50:00' },
  { id: 46, day: 4, startTime: '19:00:00', endTime: '19:50:00' },
  { id: 47, day: 4, startTime: '20:00:00', endTime: '20:50:00' },
  { id: 48, day: 4, startTime: '21:00:00', endTime: '21:50:00' },
  
  // 周五 (day=5)
  { id: 49, day: 5, startTime: '08:00:00', endTime: '08:50:00' },
  { id: 50, day: 5, startTime: '09:00:00', endTime: '09:50:00' },
  { id: 51, day: 5, startTime: '10:00:00', endTime: '10:50:00' },
  { id: 52, day: 5, startTime: '11:00:00', endTime: '11:50:00' },
  { id: 53, day: 5, startTime: '13:00:00', endTime: '13:50:00' },
  { id: 54, day: 5, startTime: '14:00:00', endTime: '14:50:00' },
  { id: 55, day: 5, startTime: '15:00:00', endTime: '15:50:00' },
  { id: 56, day: 5, startTime: '16:00:00', endTime: '16:50:00' },
  { id: 57, day: 5, startTime: '17:00:00', endTime: '17:50:00' },
  { id: 58, day: 5, startTime: '19:00:00', endTime: '19:50:00' },
  { id: 59, day: 5, startTime: '20:00:00', endTime: '20:50:00' },
  { id: 60, day: 5, startTime: '21:00:00', endTime: '21:50:00' },
]

// 将时间段数据转换为Map以便快速查找
const timeSlotMap = new Map<number, TimeSlotData>()
timeSlotData.forEach(slot => {
  timeSlotMap.set(slot.id, slot)
})

// 计算当前显示的时间段信息列表
const timeSlotInfoList = computed(() => {
  if (!props.timeSlotIds) return []
  
  // 解析时间段ID字符串，获取所有有效的ID
  const ids = props.timeSlotIds
    .split(',')
    .map(id => parseInt(id.trim()))
    .filter(id => !isNaN(id))
  
  if (ids.length === 0) return []
  
  // 获取所有时间段的信息并按星期几和时间排序
  const slots = ids
    .map(id => timeSlotMap.get(id))
    .filter(slot => slot !== undefined)
    .sort((a, b) => {
      if (a!.day !== b!.day) return a!.day - b!.day
      return a!.startTime.localeCompare(b!.startTime)
    })
  
  return slots as TimeSlotData[]
})

// 判断是否有有效的时间段信息
const timeSlotInfo = computed(() => {
  return timeSlotInfoList.value.length > 0 ? timeSlotInfoList.value : null
})

// 星期几名称映射
const getDayName = (day: number): string => {
  const dayNames = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日']
  return dayNames[day] || '未知'
}
</script>

<style scoped>
.time-slot-tooltip {
  position: fixed;
  z-index: 9999;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  font-size: 14px;
  min-width: 200px;
  max-width: 280px;
  max-height: 400px;
  overflow-y: auto;
  pointer-events: none;
}

.tooltip-content {
  padding: 12px 16px;
}

.tooltip-header {
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.slot-id {
  font-weight: 600;
  color: #0d47a1;
  font-size: 13px;
}

.tooltip-body {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.slot-item {
  padding: 8px 0;
}

.slot-item.not-last {
  border-bottom: 1px solid #f5f5f5;
  margin-bottom: 4px;
}

.slot-header {
  margin-bottom: 6px;
}

.slot-number {
  font-weight: 600;
  color: #409eff;
  font-size: 12px;
  background: #ecf5ff;
  padding: 2px 6px;
  border-radius: 4px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3px;
}

.label {
  color: #666;
  font-size: 12px;
  font-weight: 500;
}

.value {
  color: #333;
  font-size: 12px;
  font-weight: 600;
}

.tooltip-arrow {
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid white;
}

.tooltip-arrow::before {
  content: '';
  position: absolute;
  top: -7px;
  left: -6px;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid #e1e5e9;
}

/* 滚动条样式 */
.time-slot-tooltip::-webkit-scrollbar {
  width: 4px;
}

.time-slot-tooltip::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.time-slot-tooltip::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.time-slot-tooltip::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
