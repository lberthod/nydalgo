import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { btcApi } from '@/services/api'
import type { Candle, Meta, Signal, MarketReport, Provider, Interval } from '@/types'

export interface EMAConfig {
  id: string
  name: string
  interval: Interval
  periods: number[]
  limit: number
}

export const useMarketStore = defineStore('market', () => {
  const candles = ref<Candle[]>([])
  const emas = ref<Record<number, (number | null)[]>>({})
  const meta = ref<Meta | null>(null)
  const signals = ref<Signal | null>(null)
  const marketReport = ref<MarketReport | null>(null)
  
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  const provider = ref<Provider>('binance')
  const interval = ref<Interval>('6h')
  const periods = ref<number[]>([20, 50, 200])
  const limit = ref(1000)
  const refreshInterval = ref(10000)

  // EMA Configurations
  const emaConfigurations = ref<EMAConfig[]>([
    {
      id: 'default',
      name: 'Configuration par défaut',
      interval: '6h',
      periods: [20, 50, 200],
      limit: 1000
    }
  ])
  const activeConfigId = ref('default')

  const latestPrice = computed(() => meta.value?.latestPrice ?? 0)
  const lastUpdate = computed(() => meta.value?.lastUpdate ?? 0)
  
  const latestEmas = computed(() => {
    if (!meta.value?.latestEmas) return {}
    return meta.value.latestEmas
  })

  async function fetchSnapshot() {
    loading.value = true
    error.value = null
    
    try {
      const data = await btcApi.getSnapshot(
        interval.value,
        periods.value,
        limit.value,
        provider.value
      )
      
      candles.value = data.candles
      emas.value = data.emas
      meta.value = data.meta
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch data'
      console.error('Error fetching snapshot:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchSignals() {
    if (periods.value.length < 2) return
    
    try {
      const data = await btcApi.getSignals(
        interval.value,
        periods.value[0],
        periods.value[periods.value.length - 1],
        limit.value,
        provider.value
      )
      
      signals.value = data.signals
    } catch (err: any) {
      console.error('Error fetching signals:', err)
    }
  }

  async function fetchStats() {
    try {
      const data = await btcApi.getStats(
        '1h',
        1000,
        provider.value
      )
      
      marketReport.value = data
    } catch (err: any) {
      console.error('Error fetching stats:', err)
    }
  }

  let refreshTimer: number | null = null

  function startAutoRefresh() {
    stopAutoRefresh()
    refreshTimer = window.setInterval(() => {
      fetchSnapshot()
      fetchSignals()
      fetchStats()
    }, refreshInterval.value)
  }

  function stopAutoRefresh() {
    if (refreshTimer !== null) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }
  }

  function applyConfig(config: EMAConfig) {
    interval.value = config.interval
    periods.value = config.periods
    limit.value = config.limit
  }

  async function initialize() {
    await fetchSnapshot()
    await fetchSignals()
    await fetchStats()
    startAutoRefresh()
  }

  return {
    candles,
    emas,
    meta,
    signals,
    marketReport,
    loading,
    error,
    provider,
    interval,
    periods,
    limit,
    refreshInterval,
    emaConfigurations,
    activeConfigId,
    latestPrice,
    lastUpdate,
    latestEmas,
    applyConfig,
    fetchSnapshot,
    fetchSignals,
    fetchStats,
    initialize,
    startAutoRefresh,
    stopAutoRefresh
  }
})
