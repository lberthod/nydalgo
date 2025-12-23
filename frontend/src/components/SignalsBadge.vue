<template>
  <div class="signals-badge" v-if="signals">
    <div class="signal-item">
      <span class="label">Trend:</span>
      <span class="badge" :class="`trend-${signals.trend}`">
        {{ signals.trend.toUpperCase() }}
      </span>
    </div>
    
    <div class="signal-item" v-if="signals.cross !== 'none'">
      <span class="label">Cross:</span>
      <span class="badge" :class="`cross-${signals.cross}`">
        {{ signals.cross === 'golden' ? '🌟 Golden Cross' : '💀 Death Cross' }}
      </span>
    </div>

    <div class="signal-details">
      <div class="detail">
        <span>Fast EMA{{ signals.emaFast.period }}:</span>
        <span class="value">${{ signals.emaFast.value.toFixed(2) }}</span>
      </div>
      <div class="detail">
        <span>Slow EMA{{ signals.emaSlow.period }}:</span>
        <span class="value">${{ signals.emaSlow.value.toFixed(2) }}</span>
      </div>
      <div class="detail">
        <span>Spread:</span>
        <span class="value" :class="spreadClass">
          {{ signals.spread.percent.toFixed(2) }}%
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Signal } from '@/types'

interface Props {
  signals: Signal | null
}

const props = defineProps<Props>()

const spreadClass = computed(() => {
  if (!props.signals) return ''
  return props.signals.spread.value > 0 ? 'positive' : 'negative'
})
</script>

<style scoped>
.signals-badge {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.signal-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.label {
  font-weight: 600;
  color: #6b7280;
  font-size: 0.875rem;
}

.badge {
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.875rem;
}

.trend-bullish {
  background: #dcfce7;
  color: #15803d;
}

.trend-bearish {
  background: #fee2e2;
  color: #dc2626;
}

.trend-neutral {
  background: #f3f4f6;
  color: #6b7280;
}

.cross-golden {
  background: #fef3c7;
  color: #92400e;
}

.cross-death {
  background: #fee2e2;
  color: #7f1d1d;
}

.signal-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.detail {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.detail span:first-child {
  color: #6b7280;
}

.value {
  font-weight: 600;
  color: #111827;
}

.value.positive {
  color: #15803d;
}

.value.negative {
  color: #dc2626;
}
</style>
