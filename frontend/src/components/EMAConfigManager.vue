<template>
  <div class="ema-config-manager">
    <div class="config-header">
      <h3>Configurations EMA</h3>
      <button @click="showAddForm = !showAddForm" class="add-config-btn">
        {{ showAddForm ? '−' : '+' }} Nouvelle Config
      </button>
    </div>

    <transition name="fade">
      <div v-if="showAddForm" class="add-config-form">
        <div class="form-row">
          <div class="form-group">
            <label>Nom</label>
            <input v-model="newConfig.name" placeholder="Ex: Day Trading" />
          </div>
          <div class="form-group">
            <label>Interval</label>
            <select v-model="newConfig.interval">
              <option value="1m">1m</option>
              <option value="5m">5m</option>
              <option value="15m">15m</option>
              <option value="30m">30m</option>
              <option value="1h">1h</option>
              <option value="4h">4h</option>
              <option value="6h">6h</option>
              <option value="1d">1d</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Périodes EMA (séparées par virgule)</label>
            <input 
              v-model="newConfig.periods" 
              placeholder="Ex: 9,21,50,200"
            />
          </div>
          <div class="form-group">
            <label>Candles (max 1000 = ~6 mois)</label>
            <input 
              v-model.number="newConfig.limit" 
              type="number"
              min="100"
              max="1000"
            />
          </div>
        </div>

        <div class="form-actions">
          <button @click="addConfiguration" class="btn-primary">
            Ajouter
          </button>
          <button @click="cancelAdd" class="btn-secondary">
            Annuler
          </button>
        </div>
      </div>
    </transition>

    <div class="configs-list">
      <div 
        v-for="config in configurations" 
        :key="config.id"
        class="config-item"
        :class="{ active: config.id === activeConfigId }"
      >
        <div class="config-info" @click="selectConfig(config.id)">
          <div class="config-name">
            <span class="config-icon">⚙️</span>
            {{ config.name }}
            <span v-if="config.id === activeConfigId" class="active-badge">Active</span>
          </div>
          <div class="config-details">
            <span class="detail-item">📊 {{ config.interval }}</span>
            <span class="detail-item">🎯 {{ config.periods.join(', ') }}</span>
            <span class="detail-item">📈 {{ config.limit }} candles</span>
          </div>
        </div>
        
        <div class="config-actions">
          <button 
            @click="duplicateConfig(config)" 
            class="action-btn"
            title="Dupliquer"
          >
            📋
          </button>
          <button 
            @click="deleteConfig(config.id)" 
            class="action-btn delete"
            title="Supprimer"
            :disabled="configurations.length === 1"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { Interval } from '@/types'

interface EMAConfig {
  id: string
  name: string
  interval: Interval
  periods: number[]
  limit: number
}

interface Props {
  activeConfigId: string
  configurations: EMAConfig[]
}

interface Emits {
  (e: 'update:activeConfigId', id: string): void
  (e: 'update:configurations', configs: EMAConfig[]): void
  (e: 'select-config', config: EMAConfig): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const showAddForm = ref(false)
const newConfig = reactive({
  name: '',
  interval: '1h' as Interval,
  periods: '20,50,200',
  limit: 500
})

function addConfiguration() {
  if (!newConfig.name.trim()) {
    alert('Veuillez entrer un nom')
    return
  }

  const periods = newConfig.periods
    .split(',')
    .map(p => parseInt(p.trim()))
    .filter(p => !isNaN(p) && p > 0)

  if (periods.length === 0) {
    alert('Veuillez entrer au moins une période EMA valide')
    return
  }

  const config: EMAConfig = {
    id: Date.now().toString(),
    name: newConfig.name,
    interval: newConfig.interval,
    periods,
    limit: newConfig.limit
  }

  const updatedConfigs = [...props.configurations, config]
  emit('update:configurations', updatedConfigs)
  emit('update:activeConfigId', config.id)
  emit('select-config', config)

  resetForm()
  showAddForm.value = false
}

function cancelAdd() {
  resetForm()
  showAddForm.value = false
}

function resetForm() {
  newConfig.name = ''
  newConfig.interval = '1h'
  newConfig.periods = '20,50,200'
  newConfig.limit = 500
}

function selectConfig(id: string) {
  emit('update:activeConfigId', id)
  const config = props.configurations.find(c => c.id === id)
  if (config) {
    emit('select-config', config)
  }
}

function duplicateConfig(config: EMAConfig) {
  const duplicate: EMAConfig = {
    id: Date.now().toString(),
    name: `${config.name} (copie)`,
    interval: config.interval,
    periods: [...config.periods],
    limit: config.limit
  }

  const updatedConfigs = [...props.configurations, duplicate]
  emit('update:configurations', updatedConfigs)
}

function deleteConfig(id: string) {
  if (props.configurations.length === 1) {
    alert('Vous devez garder au moins une configuration')
    return
  }

  const updatedConfigs = props.configurations.filter(c => c.id !== id)
  emit('update:configurations', updatedConfigs)

  if (id === props.activeConfigId && updatedConfigs.length > 0) {
    emit('update:activeConfigId', updatedConfigs[0].id)
    emit('select-config', updatedConfigs[0])
  }
}
</script>

<style scoped>
.ema-config-manager {
  width: 100%;
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.config-header h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.add-config-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.add-config-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.add-config-form {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.form-group label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-group input,
.form-group select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3b82f6;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.btn-primary,
.btn-secondary {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #10b981;
  color: white;
}

.btn-primary:hover {
  background: #059669;
}

.btn-secondary {
  background: #e5e7eb;
  color: #6b7280;
}

.btn-secondary:hover {
  background: #d1d5db;
}

.configs-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.config-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s;
  cursor: pointer;
}

.config-item:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

.config-item.active {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
}

.config-info {
  flex: 1;
}

.config-name {
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.config-icon {
  font-size: 1.125rem;
}

.active-badge {
  background: #10b981;
  color: white;
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.config-details {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.detail-item {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.config-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: #f3f4f6;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 1rem;
}

.action-btn:hover {
  background: #e5e7eb;
  transform: scale(1.1);
}

.action-btn.delete:hover {
  background: #fee2e2;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn:disabled:hover {
  transform: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .config-details {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>
