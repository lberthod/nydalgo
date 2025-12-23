<template>
  <div class="period-records-table" v-if="periodRecords && Object.keys(periodRecords).length > 0">
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Période</th>
            <th>ATH (High)</th>
            <th>Date ATH</th>
            <th>Distance</th>
            <th>ATL (Low)</th>
            <th>Date ATL</th>
            <th>Distance</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="record in sortedRecords" 
            :key="record.period"
            class="record-row"
          >
            <td class="period-cell">
              <span class="period-badge">{{ getPeriodLabel(record.period) }}</span>
            </td>
            <td class="price-cell high">
              ${{ formatPrice(record.high) }}
            </td>
            <td class="date-cell">
              {{ formatDate(record.highTimestamp) }}
            </td>
            <td class="distance-cell" :class="getDistanceClass(record.distanceFromHigh)">
              {{ formatPercent(record.distanceFromHigh) }}%
            </td>
            <td class="price-cell low">
              ${{ formatPrice(record.low) }}
            </td>
            <td class="date-cell">
              {{ formatDate(record.lowTimestamp) }}
            </td>
            <td class="distance-cell positive">
              {{ formatPercent(record.distanceFromLow) }}%
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="records-summary">
      <div class="summary-item">
        <span class="summary-label">Plus proche de l'ATH:</span>
        <span class="summary-value">{{ getClosestToATH() }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Plus éloigné de l'ATH:</span>
        <span class="summary-value">{{ getFarthestFromATH() }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PeriodRecord } from '@/types'

interface Props {
  periodRecords: Record<string, PeriodRecord>
  currentPrice: number
}

const props = defineProps<Props>()

const periodOrder = ['1m', '3m', '6m']

const sortedRecords = computed(() => {
  return periodOrder
    .filter(period => props.periodRecords[period])
    .map(period => props.periodRecords[period])
})

function getPeriodLabel(period: string): string {
  const labels: Record<string, string> = {
    '1m': '1 Mois',
    '3m': '3 Mois',
    '6m': '6 Mois'
  }
  return labels[period] || period
}

function formatPrice(value: number): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}`
}

function formatDate(timestamp?: number): string {
  if (!timestamp) return 'N/A'
  const date = new Date(timestamp)
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

function getDistanceClass(distance: number): string {
  if (distance > -5) return 'near-ath'
  if (distance > -20) return 'moderate'
  return 'far'
}

function getClosestToATH(): string {
  let closest: PeriodRecord | null = null
  let minDistance = -Infinity
  
  for (const record of sortedRecords.value) {
    if (record.distanceFromHigh > minDistance) {
      minDistance = record.distanceFromHigh
      closest = record
    }
  }
  
  return closest ? `${getPeriodLabel(closest.period)} (${formatPercent(closest.distanceFromHigh)}%)` : 'N/A'
}

function getFarthestFromATH(): string {
  let farthest: PeriodRecord | null = null
  let maxDistance = 0
  
  for (const record of sortedRecords.value) {
    if (record.distanceFromHigh < maxDistance) {
      maxDistance = record.distanceFromHigh
      farthest = record
    }
  }
  
  return farthest ? `${getPeriodLabel(farthest.period)} (${formatPercent(farthest.distanceFromHigh)}%)` : 'N/A'
}
</script>

<style scoped>
.period-records-table {
  width: 100%;
}

.table-container {
  overflow-x: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  font-size: 0.875rem;
}

thead {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-bottom: 2px solid #e5e7eb;
}

thead th {
  padding: 1rem 0.75rem;
  text-align: left;
  font-weight: 700;
  color: #374151;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
}

tbody tr {
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.2s;
}

tbody tr:hover {
  background: #f9fafb;
}

tbody tr:last-child {
  border-bottom: none;
}

td {
  padding: 0.875rem 0.75rem;
}

.period-cell {
  font-weight: 600;
}

.period-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.price-cell {
  font-weight: 700;
  font-size: 0.9375rem;
}

.price-cell.high {
  color: #10b981;
}

.price-cell.low {
  color: #ef4444;
}

.date-cell {
  color: #6b7280;
  font-size: 0.8125rem;
}

.distance-cell {
  font-weight: 700;
  font-size: 0.9375rem;
  padding: 0.5rem 0.75rem;
}

.distance-cell.near-ath {
  color: #f59e0b;
  background: #fef3c7;
  border-radius: 4px;
}

.distance-cell.moderate {
  color: #f97316;
}

.distance-cell.far {
  color: #ef4444;
}

.distance-cell.positive {
  color: #10b981;
}

.records-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.summary-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-value {
  font-size: 0.9375rem;
  font-weight: 700;
  color: #111827;
}

@media (max-width: 1024px) {
  table {
    font-size: 0.8125rem;
  }

  thead th,
  td {
    padding: 0.75rem 0.5rem;
  }

  .period-badge {
    font-size: 0.6875rem;
    padding: 0.25rem 0.5rem;
  }
}

@media (max-width: 768px) {
  .table-container {
    overflow-x: scroll;
  }

  table {
    min-width: 800px;
  }
}
</style>
