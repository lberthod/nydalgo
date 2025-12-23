<template>
  <div class="card">
    <h3>{{ title }}</h3>
    <div class="price">{{ formattedValue }}</div>
    <div class="subtitle" v-if="subtitle">{{ subtitle }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  value: number
  decimals?: number
  subtitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  decimals: 2
})

const formattedValue = computed(() => {
  return `$${props.value.toLocaleString('en-US', {
    minimumFractionDigits: props.decimals,
    maximumFractionDigits: props.decimals
  })}`
})
</script>

<style scoped>
.card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h3 {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  font-weight: 500;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.price {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.subtitle {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  opacity: 0.8;
}
</style>
