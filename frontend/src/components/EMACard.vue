<template>
  <div class="ema-card">
    <div class="header">
      <span class="period">EMA{{ period }}</span>
      <span class="badge" :class="aboveClass">{{ aboveText }}</span>
    </div>
    <div class="value">{{ formattedValue }}</div>
    <div class="diff" :class="diffClass">
      {{ diffText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  period: number
  value: number
  currentPrice: number
}

const props = defineProps<Props>()

const formattedValue = computed(() => {
  return `$${props.value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
})

const diff = computed(() => props.currentPrice - props.value)
const diffPercent = computed(() => (diff.value / props.value) * 100)

const aboveClass = computed(() => 
  props.currentPrice > props.value ? 'above' : 'below'
)

const aboveText = computed(() => 
  props.currentPrice > props.value ? 'Above' : 'Below'
)

const diffClass = computed(() => diff.value > 0 ? 'positive' : 'negative')

const diffText = computed(() => {
  const sign = diff.value > 0 ? '+' : ''
  return `${sign}$${Math.abs(diff.value).toFixed(2)} (${sign}${diffPercent.value.toFixed(2)}%)`
})
</script>

<style scoped>
.ema-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.25rem;
  transition: all 0.2s;
}

.ema-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.period {
  font-weight: 600;
  font-size: 0.875rem;
  color: #6b7280;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge.above {
  background: #dcfce7;
  color: #15803d;
}

.badge.below {
  background: #fee2e2;
  color: #dc2626;
}

.value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
}

.diff {
  font-size: 0.875rem;
  font-weight: 500;
}

.diff.positive {
  color: #15803d;
}

.diff.negative {
  color: #dc2626;
}
</style>
