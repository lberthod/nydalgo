<template>
  <div class="chart-container">
    <div ref="chartElement" class="chart"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts'
import type { Candle } from '@/types'

interface Props {
  candles: Candle[]
  emas: Record<number, (number | null)[]>
}

const props = defineProps<Props>()
const chartElement = ref<HTMLElement | null>(null)

let chart: IChartApi | null = null
let candleSeries: ISeriesApi<'Candlestick'> | null = null
let emaSeriesMap: Map<number, ISeriesApi<'Line'>> = new Map()

const emaColors = [
  '#2563eb',
  '#dc2626',
  '#f59e0b'
]

function initChart() {
  if (!chartElement.value) return

  const containerHeight = chartElement.value.parentElement?.clientHeight || 600

  chart = createChart(chartElement.value, {
    layout: {
      background: { type: ColorType.Solid, color: 'white' },
      textColor: '#333',
    },
    grid: {
      vertLines: { color: '#f0f0f0' },
      horzLines: { color: '#f0f0f0' },
    },
    width: chartElement.value.clientWidth,
    height: containerHeight - 10,
    timeScale: {
      timeVisible: true,
      secondsVisible: false,
    },
    rightPriceScale: {
      borderColor: '#e0e0e0',
    },
  })

  candleSeries = chart.addCandlestickSeries({
    upColor: '#22c55e',
    downColor: '#ef4444',
    borderUpColor: '#22c55e',
    borderDownColor: '#ef4444',
    wickUpColor: '#22c55e',
    wickDownColor: '#ef4444',
  })

  updateChart()

  const handleResize = () => {
    if (chart && chartElement.value) {
      chart.applyOptions({ width: chartElement.value.clientWidth })
    }
  }

  window.addEventListener('resize', handleResize)
  
  return () => {
    window.removeEventListener('resize', handleResize)
  }
}

function updateChart() {
  if (!candleSeries || !chart) return

  const chartData = props.candles.map(c => ({
    time: (c.timestamp / 1000) as any,
    open: c.open,
    high: c.high,
    low: c.low,
    close: c.close,
  }))

  candleSeries.setData(chartData)

  emaSeriesMap.forEach(series => chart?.removeSeries(series))
  emaSeriesMap.clear()

  const periods = Object.keys(props.emas).map(Number).sort((a, b) => a - b)
  
  periods.forEach((period, index) => {
    const emaValues = props.emas[period]
    
    const emaData = props.candles
      .map((c, i) => ({
        time: (c.timestamp / 1000) as any,
        value: emaValues[i]
      }))
      .filter(d => d.value !== null && d.value !== undefined) as any[]

    if (emaData.length > 0 && chart) {
      const lineSeries = chart.addLineSeries({
        color: emaColors[index % emaColors.length],
        lineWidth: 2,
        title: `EMA${period}`,
      })
      
      lineSeries.setData(emaData)
      emaSeriesMap.set(period, lineSeries)
    }
  })

  chart.timeScale().fitContent()
}

onMounted(() => {
  initChart()
})

watch(() => [props.candles, props.emas], () => {
  updateChart()
}, { deep: true })

onUnmounted(() => {
  if (chart) {
    chart.remove()
  }
})
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.chart {
  width: 100%;
  height: 100%;
}
</style>
