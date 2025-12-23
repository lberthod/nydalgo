<template>
  <div class="records-panel" v-if="records">
    <PeriodRecordsTable 
      v-if="periodRecords" 
      :period-records="periodRecords"
      :current-price="currentPrice"
      class="period-records"
    />

    <h3 class="section-subtitle">📊 Records Globaux</h3>
    <div class="records-grid">
      <div class="record-card ath">
        <div class="record-icon">🔝</div>
        <div class="record-content">
          <h3>All-Time High</h3>
          <div class="record-price">${{ formatPrice(records.allTimeHigh) }}</div>
          <div class="record-time" v-if="records.athTimestamp">
            {{ formatDate(records.athTimestamp) }}
          </div>
          <div class="record-distance" :class="distanceATHClass">
            {{ formatPercent(records.distanceFromATH) }}% depuis ATH
          </div>
        </div>
      </div>

      <div class="record-card atl">
        <div class="record-icon">📊</div>
        <div class="record-content">
          <h3>All-Time Low</h3>
          <div class="record-price">${{ formatPrice(records.allTimeLow) }}</div>
          <div class="record-time" v-if="records.atlTimestamp">
            {{ formatDate(records.atlTimestamp) }}
          </div>
          <div class="record-distance positive">
            {{ formatPercent(records.distanceFromATL) }}% depuis ATL
          </div>
        </div>
      </div>

      <div class="record-card volatility" v-if="volatility">
        <div class="record-icon">{{ volatilityIcon }}</div>
        <div class="record-content">
          <h3>Volatilité</h3>
          <div class="record-price">{{ volatility.value.toFixed(2) }}%</div>
          <div class="volatility-level" :class="`level-${volatility.level}`">
            {{ volatilityLabel }}
          </div>
          <div class="volatility-description">
            {{ volatilityDescription }}
          </div>
        </div>
      </div>

      <div class="record-card current">
        <div class="record-icon">💰</div>
        <div class="record-content">
          <h3>Prix Actuel</h3>
          <div class="record-price">${{ formatPrice(currentPrice) }}</div>
          <div class="record-time">
            {{ formatDate(currentTimestamp) }}
          </div>
          <div class="record-metrics">
            <div class="metric">
              <span class="metric-label">Open:</span>
              <span>${{ formatPrice(current.open) }}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Range:</span>
              <span>${{ formatPrice(current.low) }} - ${{ formatPrice(current.high) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="levels-section" v-if="levels">
      <div class="levels-card resistance">
        <h3>🔴 Résistances</h3>
        <div class="levels-list">
          <div 
            v-for="(level, idx) in levels.resistance" 
            :key="`r-${idx}`"
            class="level-item"
          >
            <span class="level-number">R{{ idx + 1 }}</span>
            <span class="level-price">${{ formatPrice(level) }}</span>
            <span class="level-distance">{{ formatDistance(level, currentPrice) }}</span>
          </div>
          <div v-if="levels.resistance.length === 0" class="no-levels">
            Aucune résistance détectée
          </div>
        </div>
      </div>

      <div class="levels-card support">
        <h3>🟢 Supports</h3>
        <div class="levels-list">
          <div 
            v-for="(level, idx) in levels.support" 
            :key="`s-${idx}`"
            class="level-item"
          >
            <span class="level-number">S{{ idx + 1 }}</span>
            <span class="level-price">${{ formatPrice(level) }}</span>
            <span class="level-distance">{{ formatDistance(level, currentPrice) }}</span>
          </div>
          <div v-if="levels.support.length === 0" class="no-levels">
            Aucun support détecté
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Records, Levels, Volatility, PeriodRecord } from '@/types'
import PeriodRecordsTable from './PeriodRecordsTable.vue'

interface Props {
  records: Records
  levels: Levels
  volatility: Volatility
  current: {
    price: number
    timestamp: number
    open: number
    high: number
    low: number
  }
  periodRecords?: Record<string, PeriodRecord>
}

const props = defineProps<Props>()

const currentPrice = computed(() => props.current.price)
const currentTimestamp = computed(() => props.current.timestamp)

const distanceATHClass = computed(() => {
  const distance = props.records.distanceFromATH
  if (distance > -5) return 'near-ath'
  if (distance > -20) return 'moderate'
  return 'far'
})

const volatilityIcon = computed(() => {
  if (!props.volatility) return '📊'
  switch (props.volatility.level) {
    case 'high': return '🔥'
    case 'medium': return '⚡'
    case 'low': return '😌'
    default: return '📊'
  }
})

const volatilityLabel = computed(() => {
  if (!props.volatility) return ''
  const labels = {
    high: 'Élevée',
    medium: 'Modérée',
    low: 'Faible'
  }
  return labels[props.volatility.level] || ''
})

const volatilityDescription = computed(() => {
  if (!props.volatility) return ''
  const descriptions = {
    high: 'Mouvements de prix importants',
    medium: 'Volatilité normale du marché',
    low: 'Marché calme et stable'
  }
  return descriptions[props.volatility.level] || ''
})

function formatPrice(value: number): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}`
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatDistance(level: number, current: number): string {
  const distance = ((level - current) / current) * 100
  const sign = distance >= 0 ? '+' : ''
  return `${sign}${distance.toFixed(2)}%`
}
</script>

<style scoped>
.records-panel {
  width: 100%;
}

.period-records {
  margin-bottom: 2rem;
}

.section-subtitle {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 2rem 0 1.5rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.records-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.record-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 1rem;
  transition: transform 0.3s ease;
}

.record-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.record-card.ath {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-left: 4px solid #f59e0b;
}

.record-card.atl {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-left: 4px solid #3b82f6;
}

.record-card.volatility {
  background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);
  border-left: 4px solid #ec4899;
}

.record-card.current {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border-left: 4px solid #10b981;
}

.record-icon {
  font-size: 2.5rem;
  display: flex;
  align-items: center;
}

.record-content {
  flex: 1;
}

.record-content h3 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.record-price {
  font-size: 1.75rem;
  font-weight: 800;
  color: #111827;
  margin-bottom: 0.25rem;
}

.record-time {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.record-distance {
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: inline-block;
  margin-top: 0.5rem;
}

.record-distance.near-ath {
  background: #fef3c7;
  color: #92400e;
}

.record-distance.moderate {
  background: #fef3c7;
  color: #92400e;
}

.record-distance.far {
  background: #fee2e2;
  color: #991b1b;
}

.record-distance.positive {
  background: #dcfce7;
  color: #15803d;
}

.volatility-level {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.volatility-level.level-high {
  background: #fee2e2;
  color: #991b1b;
}

.volatility-level.level-medium {
  background: #fef3c7;
  color: #92400e;
}

.volatility-level.level-low {
  background: #dcfce7;
  color: #15803d;
}

.volatility-description {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.5rem;
}

.record-metrics {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.metric {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
}

.metric-label {
  color: #6b7280;
  font-weight: 500;
}

.levels-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.levels-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.levels-card.resistance {
  border-top: 4px solid #ef4444;
}

.levels-card.support {
  border-top: 4px solid #10b981;
}

.levels-card h3 {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #111827;
}

.levels-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.level-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 8px;
  transition: background 0.2s;
}

.level-item:hover {
  background: #f3f4f6;
}

.level-number {
  font-weight: 700;
  color: #6b7280;
  min-width: 30px;
}

.level-price {
  flex: 1;
  font-weight: 600;
  color: #111827;
}

.level-distance {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.no-levels {
  text-align: center;
  padding: 1rem;
  color: #9ca3af;
  font-style: italic;
  font-size: 0.875rem;
}
</style>
