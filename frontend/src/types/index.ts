export interface Candle {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
  ema?: number | null
}

export interface Meta {
  provider: string
  symbol: string
  interval: string
  period?: number
  periods?: number[]
  limit: number
  lastUpdate: number
  latestPrice: number
  latestEma?: number
  latestEmas?: Record<number, number>
  priceAboveEma?: boolean
}

export interface SnapshotResponse {
  candles: Candle[]
  emas: Record<number, (number | null)[]>
  meta: Meta
}

export interface EMAResponse {
  candles: Candle[]
  ema: (number | null)[]
  meta: Meta
}

export interface Signal {
  trend: 'bullish' | 'bearish' | 'neutral'
  cross: 'golden' | 'death' | 'none'
  priceAboveFastEma: boolean
  priceAboveSlowEma: boolean
  currentPrice: number
  emaFast: {
    period: number
    value: number
    distance: number
    distancePercent: number
  }
  emaSlow: {
    period: number
    value: number
    distance: number
    distancePercent: number
  }
  spread: {
    value: number
    percent: number
  }
}

export interface SignalsResponse {
  signals: Signal
  meta: Meta
}

export type Provider = 'binance' | 'coingecko' | 'aster'
export type Interval = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '6h' | '1d'

export interface PeriodStats {
  period: string
  current: number
  open: number
  high: number
  low: number
  change: number
  changePercent: number
  totalVolume: number
  avgVolume: number
  highTimestamp?: number
  lowTimestamp?: number
  candleCount: number
}

export interface Volatility {
  value: number
  level: 'low' | 'medium' | 'high'
}

export interface Levels {
  support: number[]
  resistance: number[]
}

export interface Records {
  allTimeHigh: number
  allTimeLow: number
  athTimestamp?: number
  atlTimestamp?: number
  distanceFromATH: number
  distanceFromATL: number
}

export interface PeriodRecord {
  period: string
  high: number
  low: number
  highTimestamp?: number
  lowTimestamp?: number
  distanceFromHigh: number
  distanceFromLow: number
  candleCount: number
}

export interface MarketReport {
  current: {
    price: number
    timestamp: number
    open: number
    high: number
    low: number
    volume: number
  }
  stats: Record<string, PeriodStats>
  trends: Record<string, string>
  volatility: Volatility
  levels: Levels
  records: Records
  periodRecords?: Record<string, PeriodRecord>
  meta: Meta
}
