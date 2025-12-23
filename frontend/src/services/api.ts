import axios from 'axios'
import type { SnapshotResponse, SignalsResponse, MarketReport, Provider, Interval } from '@/types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 30000
})

export const btcApi = {
  async getSnapshot(
    interval: Interval,
    periods: number[],
    limit: number,
    provider: Provider
  ): Promise<SnapshotResponse> {
    const periodsStr = periods.join(',')
    const { data } = await api.get<SnapshotResponse>(
      `/api/btc/snapshot?interval=${interval}&periods=${periodsStr}&limit=${limit}&provider=${provider}`
    )
    return data
  },

  async getSignals(
    interval: Interval,
    emaFast: number,
    emaSlow: number,
    limit: number,
    provider: Provider
  ): Promise<SignalsResponse> {
    const { data } = await api.get<SignalsResponse>(
      `/api/btc/signals?interval=${interval}&emaFast=${emaFast}&emaSlow=${emaSlow}&limit=${limit}&provider=${provider}`
    )
    return data
  },

  async getStats(
    interval: Interval,
    limit: number,
    provider: Provider
  ): Promise<MarketReport> {
    const { data } = await api.get<MarketReport>(
      `/api/btc/stats?interval=${interval}&limit=${limit}&provider=${provider}`
    )
    return data
  },

  async healthCheck(): Promise<{ ok: boolean; ts: number }> {
    const { data } = await api.get('/health')
    return data
  }
}
