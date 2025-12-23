<template>
  <div id="app">
    <main class="container">
      <div v-if="error" class="error-banner">
        ⚠️ {{ error }}
      </div>

      <LiveHeader
        :current-price="latestPrice"
        :last-update="lastUpdate"
        :loading="loading"
        :provider="marketStore.provider"
        :change24h="marketReport?.stats?.['24h']"
        :volatility="marketReport?.volatility"
        :volume="marketReport?.stats?.['24h']?.totalVolume"
        :high-low24h="marketReport?.stats?.['24h'] ? { high: marketReport.stats['24h'].high, low: marketReport.stats['24h'].low } : null"
      />

      <ControlPanel
        v-model:provider="marketStore.provider"
        v-model:interval="marketStore.interval"
        v-model:periods="marketStore.periods"
        v-model:limit="marketStore.limit"
        :loading="loading"
        @refresh="handleRefresh"
      />

      <div class="main-content">
        <div class="chart-section-large">
          <ChartView
            v-if="candles.length > 0"
            :candles="candles"
            :emas="emas"
          />

          <div v-else class="loading-state">
            <div class="spinner"></div>
            <p>Chargement des données...</p>
          </div>
        </div>

        <div class="side-panel">
          <CollapsibleSection title="Configurations EMA" icon="⚙️" :default-collapsed="false">
            <EMAConfigManager
              :active-config-id="activeConfigId"
              :configurations="configurations"
              @update:active-config-id="(val) => marketStore.activeConfigId = val"
              @update:configurations="(val) => marketStore.emaConfigurations = val"
              @select-config="handleConfigSelect"
            />
          </CollapsibleSection>

          <CollapsibleSection title="EMAs en Temps Réel" icon="🎯" :default-collapsed="false">
            <div class="ema-cards-grid">
              <EMACard
                v-for="period in marketStore.periods"
                :key="period"
                :period="period"
                :value="latestEmas[period] || 0"
                :current-price="latestPrice"
              />
            </div>
          </CollapsibleSection>

          <SignalsBadge :signals="marketStore.signals" />
        </div>
      </div>

      <CollapsibleSection 
        v-if="marketReport" 
        title="Records & Niveaux Clés" 
        icon="🏆" 
        :default-collapsed="true"
      >
        <RecordsPanel
          :records="marketReport.records"
          :levels="marketReport.levels"
          :volatility="marketReport.volatility"
          :current="marketReport.current"
          :period-records="marketReport.periodRecords"
        />
      </CollapsibleSection>

      <CollapsibleSection 
        v-if="marketReport" 
        title="Statistiques Multi-Périodes" 
        icon="📊" 
        :default-collapsed="true"
      >
        <MarketStats :stats="marketReport.stats" />
      </CollapsibleSection>
    </main>

    <footer>
      <div class="container">
        <p>🚀 Bitcoin EMA Dashboard Pro - Analyse de marché en temps réel</p>
        <p class="footnote">Source: {{ marketStore.provider }} • Rafraîchissement automatique: {{ marketStore.refreshInterval / 1000 }}s</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useMarketStore } from '@/stores/market'
import LiveHeader from '@/components/LiveHeader.vue'
import ControlPanel from '@/components/ControlPanel.vue'
import RecordsPanel from '@/components/RecordsPanel.vue'
import MarketStats from '@/components/MarketStats.vue'
import EMACard from '@/components/EMACard.vue'
import ChartView from '@/components/ChartView.vue'
import SignalsBadge from '@/components/SignalsBadge.vue'
import CollapsibleSection from '@/components/CollapsibleSection.vue'
import EMAConfigManager from '@/components/EMAConfigManager.vue'
import type { EMAConfig } from '@/stores/market'

const marketStore = useMarketStore()

const candles = computed(() => marketStore.candles)
const emas = computed(() => marketStore.emas)
const loading = computed(() => marketStore.loading)
const error = computed(() => marketStore.error)
const latestPrice = computed(() => marketStore.latestPrice)
const lastUpdate = computed(() => marketStore.lastUpdate)
const latestEmas = computed(() => marketStore.latestEmas)
const marketReport = computed(() => marketStore.marketReport)
const activeConfigId = computed(() => marketStore.activeConfigId)
const configurations = computed(() => marketStore.emaConfigurations)

async function handleRefresh() {
  await marketStore.fetchSnapshot()
  await marketStore.fetchSignals()
  await marketStore.fetchStats()
}

async function handleConfigSelect(config: EMAConfig) {
  marketStore.applyConfig(config)
  await handleRefresh()
}

onMounted(() => {
  marketStore.initialize()
})

onUnmounted(() => {
  marketStore.stopAutoRefresh()
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
  background-attachment: fixed;
  min-height: 100vh;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  max-width: 1800px;
  margin: 0 auto;
  padding: 0 1rem;
}

main {
  flex: 1;
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.error-banner {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  border-left: 4px solid #dc2626;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 1rem;
  align-items: start;
  margin-bottom: 1rem;
}

.chart-section-large {
  background: white;
  border-radius: 8px;
  padding: 0.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  min-height: calc(100vh - 200px);
  height: calc(100vh - 200px);
}

.side-panel {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  position: sticky;
  top: 1.5rem;
  max-height: calc(100vh - 3rem);
  overflow-y: auto;
}

.ema-cards-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  background: #f9fafb;
  border-radius: 12px;
  min-height: 400px;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 5px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-state p {
  margin-top: 1.5rem;
  color: #6b7280;
  font-weight: 600;
  font-size: 1.125rem;
}

footer {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  color: white;
  padding: 2rem 0;
  margin-top: 3rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

footer p {
  margin: 0.5rem 0;
  opacity: 0.9;
}

.footnote {
  font-size: 0.875rem;
  opacity: 0.7;
}

@media (min-width: 1800px) {
  .main-content {
    grid-template-columns: 1fr 300px;
  }
  
  .chart-section-large {
    min-height: calc(100vh - 250px);
    height: calc(100vh - 250px);
  }
}

@media (max-width: 1400px) {
  .main-content {
    grid-template-columns: 1fr 300px;
  }
}

@media (max-width: 1200px) {
  .main-content {
    grid-template-columns: 1fr;
  }

  .side-panel {
    position: relative;
    top: 0;
    max-height: none;
  }
  
  .chart-section-large {
    min-height: 500px;
    height: auto;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }

  main {
    padding: 1rem 0;
    gap: 1.5rem;
  }

  .chart-section,
  .ema-cards-section {
    padding: 1.25rem;
  }

  .section-title {
    font-size: 1.25rem;
  }
}

@media (min-width: 1600px) {
  .container {
    max-width: 1800px;
  }

  .dashboard-grid {
    grid-template-columns: 1fr 450px;
  }
}
</style>
