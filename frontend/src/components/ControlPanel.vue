<template>
  <div class="control-panel">
    <div class="control-group">
      <label>Provider</label>
      <select v-model="localProvider" @change="handleChange">
        <option value="binance">Binance</option>
        <option value="coingecko">CoinGecko</option>
        <option value="aster">Aster</option>
      </select>
    </div>

    <div class="control-group">
      <label>Interval</label>
      <select v-model="localInterval" @change="handleChange">
        <option value="1m">1 minute</option>
        <option value="5m">5 minutes</option>
        <option value="15m">15 minutes</option>
        <option value="30m">30 minutes</option>
        <option value="1h">1 hour</option>
        <option value="4h">4 hours</option>
        <option value="6h">6 hours</option>
        <option value="1d">1 day</option>
      </select>
    </div>

    <div class="control-group ema-group">
      <div class="ema-header">
        <label>EMA Periods ({{ localPeriods.length }})</label>
        <div class="quick-add">
          <button 
            v-for="preset in presetPeriods" 
            :key="preset"
            @click="addPreset(preset)"
            class="preset-btn"
            :disabled="localPeriods.includes(preset)"
            :title="localPeriods.includes(preset) ? 'Déjà ajouté' : `Ajouter EMA ${preset}`"
          >
            +{{ preset }}
          </button>
        </div>
      </div>
      <div class="period-tags">
        <span 
          v-for="period in sortedPeriods" 
          :key="period" 
          class="tag"
          :class="{ 'only-one': localPeriods.length === 1 }"
        >
          <span class="tag-value">EMA {{ period }}</span>
          <button 
            @click="removePeriod(period)" 
            class="tag-remove"
            :disabled="localPeriods.length === 1"
            :title="localPeriods.length === 1 ? 'Au moins 1 EMA requis' : `Supprimer EMA ${period}`"
          >
            ×
          </button>
        </span>
      </div>
      <div class="add-period-row">
        <input 
          v-model.number="newPeriod" 
          @keyup.enter="addPeriod"
          type="number"
          placeholder="Ex: 100"
          class="period-input"
          min="1"
          max="500"
        />
        <button 
          @click="addPeriod" 
          class="add-period-btn"
          :disabled="!canAddPeriod"
          :title="getAddButtonTitle"
        >
          + Ajouter
        </button>
      </div>
      <div v-if="periodError" class="error-message">
        {{ periodError }}
      </div>
    </div>

    <div class="control-group">
      <label>Candles (max 1000)</label>
      <input 
        v-model.number="localLimit" 
        @change="handleChange"
        type="number" 
        min="100" 
        max="1000"
        step="100"
      />
    </div>

    <button @click="handleRefresh" class="refresh-btn" :disabled="loading">
      {{ loading ? 'Loading...' : 'Refresh Now' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { Provider, Interval } from '@/types'

interface Props {
  provider: Provider
  interval: Interval
  periods: number[]
  limit: number
  loading: boolean
}

interface Emits {
  (e: 'update:provider', value: Provider): void
  (e: 'update:interval', value: Interval): void
  (e: 'update:periods', value: number[]): void
  (e: 'update:limit', value: number): void
  (e: 'refresh'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const localProvider = ref(props.provider)
const localInterval = ref(props.interval)
const localPeriods = ref([...props.periods])
const localLimit = ref(props.limit)
const newPeriod = ref<number | ''>('')
const periodError = ref<string>('')

// Périodes EMA présets populaires
const presetPeriods = [9, 12, 21, 26, 50, 100, 200]

// Periods triés pour affichage
const sortedPeriods = computed(() => {
  return [...localPeriods.value].sort((a, b) => a - b)
})

// Vérifier si on peut ajouter une période
const canAddPeriod = computed(() => {
  if (typeof newPeriod.value !== 'number') return false
  const period = newPeriod.value
  return period > 0 && period <= 500 && !localPeriods.value.includes(period)
})

// Message d'aide pour le bouton d'ajout
const getAddButtonTitle = computed(() => {
  if (typeof newPeriod.value !== 'number') {
    return 'Entrez une période EMA'
  }
  const period = newPeriod.value
  if (period <= 0) return 'La période doit être supérieure à 0'
  if (period > 500) return 'La période doit être inférieure à 500'
  if (localPeriods.value.includes(period)) return 'Cette période est déjà ajoutée'
  return `Ajouter EMA ${period}`
})

watch(() => props.provider, (val) => { localProvider.value = val })
watch(() => props.interval, (val) => { localInterval.value = val })
watch(() => props.periods, (val) => { localPeriods.value = [...val] })
watch(() => props.limit, (val) => { localLimit.value = val })

function handleChange() {
  emit('update:provider', localProvider.value)
  emit('update:interval', localInterval.value)
  emit('update:periods', localPeriods.value)
  emit('update:limit', localLimit.value)
  emit('refresh')
}

function addPeriod() {
  periodError.value = ''
  
  if (typeof newPeriod.value !== 'number') {
    periodError.value = 'Entrez une période EMA valide'
    return
  }

  const period = newPeriod.value
  
  if (period <= 0) {
    periodError.value = 'La période doit être supérieure à 0'
    return
  }
  
  if (period > 500) {
    periodError.value = 'La période doit être inférieure ou égale à 500'
    return
  }
  
  if (localPeriods.value.includes(period)) {
    periodError.value = `EMA ${period} est déjà ajouté`
    return
  }

  localPeriods.value.push(period)
  localPeriods.value.sort((a, b) => a - b)
  newPeriod.value = ''
  handleChange()
}

function addPreset(period: number) {
  if (!localPeriods.value.includes(period)) {
    localPeriods.value.push(period)
    localPeriods.value.sort((a, b) => a - b)
    periodError.value = ''
    handleChange()
  }
}

function removePeriod(period: number) {
  if (localPeriods.value.length === 1) {
    periodError.value = 'Vous devez garder au moins 1 période EMA'
    return
  }
  
  localPeriods.value = localPeriods.value.filter(p => p !== period)
  periodError.value = ''
  handleChange()
}

function handleRefresh() {
  emit('refresh')
}
</script>

<style scoped>
.control-panel {
  background: white;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
  align-items: end;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

select,
input[type="number"] {
  padding: 0.375rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.8125rem;
  background: white;
  transition: border-color 0.2s;
}

select:focus,
input[type="number"]:focus {
  outline: none;
  border-color: #667eea;
}

.ema-group {
  grid-column: 1 / -1;
}

.ema-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.quick-add {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.preset-btn {
  padding: 0.25rem 0.5rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  color: #374151;
}

.preset-btn:hover:not(:disabled) {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
  transform: translateY(-1px);
}

.preset-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: #f9fafb;
}

.period-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 8px;
  min-height: 50px;
  margin-bottom: 0.75rem;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
  transition: all 0.2s;
}

.tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.4);
}

.tag.only-one {
  opacity: 0.8;
}

.tag-value {
  font-size: 0.875rem;
}

.tag-remove {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 1.125rem;
  cursor: pointer;
  padding: 0 0.25rem;
  line-height: 1;
  border-radius: 3px;
  transition: all 0.2s;
  font-weight: 700;
}

.tag-remove:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.2);
}

.tag-remove:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.add-period-row {
  display: flex;
  gap: 0.5rem;
}

.period-input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.period-input:focus {
  outline: none;
  border-color: #667eea;
}

.add-period-btn {
  padding: 0.5rem 1rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.add-period-btn:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
}

.add-period-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #9ca3af;
}

.error-message {
  margin-top: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #fee2e2;
  color: #991b1b;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  border-left: 3px solid #dc2626;
}

.refresh-btn {
  padding: 0.625rem 1.25rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-btn:active:not(:disabled) {
  transform: translateY(0);
}
</style>
