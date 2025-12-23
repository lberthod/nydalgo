<template>
  <div class="live-header">
    <div class="header-compact">
      <div class="logo-compact">
        <h1>₿ Bitcoin Dashboard</h1>
      </div>
      
      <div class="price-compact">
        <div class="price-main">
          <span class="price-value">${{ formatPrice(currentPrice) }}</span>
          <span class="price-change" v-if="change24h" :class="changeClass">
            {{ formatChange(change24h.change) }} ({{ formatPercent(change24h.changePercent) }}%)
          </span>
        </div>
      </div>

      <div class="metrics-compact">
        <span class="metric-item">
          <span class="metric-icon">🔥</span>
          {{ volatility ? volatility.value.toFixed(2) : '0' }}%
        </span>
        <span class="metric-item" v-if="volume">
          <span class="metric-icon">📊</span>
          {{ formatVolume(volume) }}
        </span>
        <span class="metric-item" v-if="highLow24h">
          <span class="metric-icon">📈</span>
          ${{ formatPrice(highLow24h.high) }}/${{ formatPrice(highLow24h.low) }}
        </span>
      </div>

      <div class="info-compact">
        <span class="provider-badge">{{ provider }}</span>
        <span class="status-indicator" :class="{ active: !loading }">
          <span class="status-dot"></span>
          {{ loading ? 'Loading' : 'Live' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PeriodStats, Volatility } from '@/types'

interface Props {
  currentPrice: number
  lastUpdate: number
  loading: boolean
  provider: string
  change24h?: PeriodStats | null
  volatility?: Volatility | null
  volume?: number
  highLow24h?: { high: number; low: number } | null
}

const props = defineProps<Props>()

const changeClass = computed(() => {
  if (!props.change24h) return ''
  return props.change24h.change >= 0 ? 'positive' : 'negative'
})

function formatPrice(value: number): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatChange(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}$${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}`
}

function formatVolume(value: number): string {
  if (value >= 1000000000) return `$${(value / 1000000000).toFixed(2)}B`
  if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`
  if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`
  return `$${value.toFixed(2)}`
}
</script>

<style scoped>
.live-header {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(79, 70, 229, 0.3);
  margin-bottom: 0.75rem;
}

.header-compact {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  gap: 2rem;
  align-items: center;
}

.logo-compact h1 {
  font-size: 1.25rem;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  white-space: nowrap;
}

.price-compact {
  display: flex;
  align-items: center;
  justify-content: center;
}

.price-main {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.price-value {
  font-size: 1.75rem;
  font-weight: 900;
  line-height: 1;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.price-change {
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.875rem;
}

.price-change.positive {
  background: rgba(16, 185, 129, 0.2);
  color: #6ee7b7;
}

.price-change.negative {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}

.metrics-compact {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  white-space: nowrap;
}

.metric-icon {
  font-size: 1rem;
}

.info-compact {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.info-label {
  font-size: 0.75rem;
  opacity: 0.7;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 0.875rem;
  font-weight: 600;
}

.provider-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 0.75rem;
  letter-spacing: 1px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  font-size: 0.75rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #9ca3af;
}

.status-indicator.active .status-dot {
  background: #10b981;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }
  50% {
    opacity: 0.8;
    box-shadow: 0 0 0 8px rgba(16, 185, 129, 0);
  }
}

.header-metrics {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.metric-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  backdrop-filter: blur(10px);
  font-size: 0.875rem;
}

.metric-icon {
  font-size: 1.25rem;
}

.metric-label {
  opacity: 0.8;
}

.metric-value {
  font-weight: 700;
}

.metric-value.volatility-high {
  color: #fca5a5;
}

.metric-value.volatility-medium {
  color: #fde68a;
}

.metric-value.volatility-low {
  color: #6ee7b7;
}

@media (max-width: 1024px) {
  .header-main {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .info-section {
    align-items: center;
  }

  .info-item {
    align-items: center;
  }
}
</style>
