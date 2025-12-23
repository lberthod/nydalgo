<template>
  <div class="market-stats" v-if="stats">
    <div class="stats-grid">
      <div 
        v-for="(stat, period) in displayStats" 
        :key="period"
        class="stat-card"
        :class="getTrendClass(stat.changePercent)"
      >
        <div class="stat-header">
          <span class="period-label">{{ getPeriodLabel(period) }}</span>
          <span class="trend-icon">{{ getTrendIcon(stat.changePercent) }}</span>
        </div>
        
        <div class="stat-main">
          <div class="price-change" :class="getChangeClass(stat.change)">
            {{ formatChange(stat.change) }}
          </div>
          <div class="percent-change" :class="getChangeClass(stat.change)">
            {{ formatPercent(stat.changePercent) }}%
          </div>
        </div>

        <div class="stat-details">
          <div class="detail-row">
            <span class="label">Open:</span>
            <span class="value">${{ formatPrice(stat.open) }}</span>
          </div>
          <div class="detail-row highlight">
            <span class="label">High:</span>
            <span class="value high">${{ formatPrice(stat.high) }}</span>
          </div>
          <div class="detail-row highlight">
            <span class="label">Low:</span>
            <span class="value low">${{ formatPrice(stat.low) }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Volume:</span>
            <span class="value">{{ formatVolume(stat.totalVolume) }}</span>
          </div>
        </div>

        <div class="stat-footer">
          <span class="candles-count">{{ stat.candleCount }} bougies</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PeriodStats } from '@/types'

interface Props {
  stats: Record<string, PeriodStats> | null
}

const props = defineProps<Props>()

const displayStats = computed(() => {
  if (!props.stats) return {}
  const order = ['1h', '4h', '24h', '48h', '72h', '7d', '14d', '30d']
  const result: Record<string, PeriodStats> = {}
  
  for (const period of order) {
    if (props.stats[period]) {
      result[period] = props.stats[period]
    }
  }
  
  return result
})

function getPeriodLabel(period: string): string {
  const labels: Record<string, string> = {
    '1h': '1 Heure',
    '4h': '4 Heures',
    '24h': '24 Heures',
    '48h': '2 Jours',
    '72h': '3 Jours',
    '7d': '7 Jours',
    '14d': '14 Jours',
    '30d': '30 Jours'
  }
  return labels[period] || period
}

function getTrendClass(changePercent: number): string {
  if (changePercent > 5) return 'trend-strong-up'
  if (changePercent > 0) return 'trend-up'
  if (changePercent < -5) return 'trend-strong-down'
  if (changePercent < 0) return 'trend-down'
  return 'trend-neutral'
}

function getChangeClass(change: number): string {
  return change >= 0 ? 'positive' : 'negative'
}

function getTrendIcon(changePercent: number): string {
  if (changePercent > 5) return '🚀'
  if (changePercent > 2) return '📈'
  if (changePercent > 0) return '⬆️'
  if (changePercent < -5) return '💥'
  if (changePercent < -2) return '📉'
  if (changePercent < 0) return '⬇️'
  return '➡️'
}

function formatChange(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}$${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}`
}

function formatPrice(value: number): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatVolume(value: number): string {
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(2)}B`
  if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(2)}K`
  return value.toFixed(2)
}
</script>

<style scoped>
.market-stats {
  width: 100%;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border-left: 4px solid #e5e7eb;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.stat-card.trend-strong-up {
  border-left-color: #10b981;
  background: linear-gradient(135deg, #ffffff 0%, #ecfdf5 100%);
}

.stat-card.trend-up {
  border-left-color: #34d399;
}

.stat-card.trend-strong-down {
  border-left-color: #ef4444;
  background: linear-gradient(135deg, #ffffff 0%, #fef2f2 100%);
}

.stat-card.trend-down {
  border-left-color: #f87171;
}

.stat-card.trend-neutral {
  border-left-color: #9ca3af;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}

.period-label {
  font-weight: 700;
  font-size: 0.875rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.trend-icon {
  font-size: 1.5rem;
}

.stat-main {
  margin-bottom: 1rem;
  text-align: center;
}

.price-change {
  font-size: 1.75rem;
  font-weight: 800;
  margin-bottom: 0.25rem;
}

.percent-change {
  font-size: 1.25rem;
  font-weight: 600;
}

.positive {
  color: #10b981;
}

.negative {
  color: #ef4444;
}

.stat-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.detail-row.highlight {
  font-weight: 600;
}

.detail-row .label {
  color: #6b7280;
}

.detail-row .value {
  color: #111827;
  font-weight: 500;
}

.detail-row .value.high {
  color: #10b981;
}

.detail-row .value.low {
  color: #ef4444;
}

.stat-footer {
  text-align: center;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
}

.candles-count {
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 500;
}
</style>
