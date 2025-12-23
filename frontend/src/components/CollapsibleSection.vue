<template>
  <div class="collapsible-section" :class="{ collapsed: isCollapsed }">
    <div class="section-header" @click="toggle">
      <h2 class="section-title">
        <span class="icon">{{ icon }}</span>
        {{ title }}
        <span v-if="badge" class="badge">{{ badge }}</span>
      </h2>
      <button class="toggle-btn" :class="{ collapsed: isCollapsed }">
        <span class="arrow">{{ isCollapsed ? '▼' : '▲' }}</span>
      </button>
    </div>
    
    <transition name="slide">
      <div v-show="!isCollapsed" class="section-content">
        <slot></slot>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  title: string
  icon?: string
  badge?: string
  defaultCollapsed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  icon: '📊',
  defaultCollapsed: false
})

const isCollapsed = ref(props.defaultCollapsed)

function toggle() {
  isCollapsed.value = !isCollapsed.value
}
</script>

<style scoped>
.collapsible-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  overflow: hidden;
  transition: all 0.3s ease;
}

.collapsible-section.collapsed {
  margin-bottom: 0.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  cursor: pointer;
  user-select: none;
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
  border-bottom: 1px solid #e5e7eb;
  transition: background 0.2s ease;
}

.section-header:hover {
  background: linear-gradient(135deg, #f3f4f6 0%, #f9fafb 100%);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.icon {
  font-size: 1.5rem;
}

.badge {
  background: #3b82f6;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 0.5rem;
}

.toggle-btn {
  background: #f3f4f6;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  color: #6b7280;
}

.toggle-btn:hover {
  background: #e5e7eb;
  transform: scale(1.1);
}

.toggle-btn.collapsed {
  transform: rotate(0deg);
}

.arrow {
  transition: transform 0.3s ease;
}

.section-content {
  padding: 1.5rem;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  max-height: 2000px;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  opacity: 0;
}

@media (max-width: 768px) {
  .section-header {
    padding: 0.875rem 1rem;
  }

  .section-title {
    font-size: 1rem;
  }

  .section-content {
    padding: 1rem;
  }
}
</style>
