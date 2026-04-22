<script setup>
import { ref, onMounted } from 'vue'

const count = ref(0)
const isVisible = ref(false)

onMounted(() => {
  setTimeout(() => {
    isVisible.value = true;
  }, 100);
});
</script>

<template>
  <div class="hero-container" :class="{ 'visible': isVisible }">
    <div class="glow-orb"></div>
    <div class="content-wrapper fade-in-up">
      <div class="badge">Vue 3 + Vite</div>
      <h1 class="title">
        The Future of <span class="gradient-text">Web Development</span>
      </h1>
      <p class="subtitle fade-in-up delay-100">
        Experience lightning-fast HMR and the composition API in a beautifully engineered setup.
      </p>
      
      <div class="action-card fade-in-up delay-200">
        <p class="count-display">Current count is: <strong>{{ count }}</strong></p>
        <button class="primary-btn" @click="count++">
          <span class="btn-text">Increment Counter</span>
          <span class="btn-glow"></span>
        </button>
      </div>

      <div class="features-grid fade-in-up delay-300">
        <div class="feature">
          <div class="feature-icon">✨</div>
          <h3>Modern</h3>
          <p>Built with latest standards</p>
        </div>
        <div class="feature">
          <div class="feature-icon">⚡</div>
          <h3>Blazing Fast</h3>
          <p>Powered by Vite</p>
        </div>
        <div class="feature">
          <div class="feature-icon">🎨</div>
          <h3>Dynamic</h3>
          <p>Beautiful micro-animations</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  position: relative;
  overflow: hidden;
  opacity: 0;
  transition: opacity 0.8s ease;
}

.hero-container.visible {
  opacity: 1;
}

.glow-orb {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, var(--accent-glow) 0%, transparent 60%);
  filter: blur(80px);
  z-index: 0;
  opacity: 0.6;
  animation: pulse-orb 8s infinite alternate ease-in-out;
}

@keyframes pulse-orb {
  0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.4; }
  100% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.7; }
}

.content-wrapper {
  position: relative;
  z-index: 1;
  max-width: 900px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: rgba(102, 252, 241, 0.1);
  border: 1px solid var(--accent-secondary);
  border-radius: 50px;
  color: var(--accent-base);
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 2rem;
  box-shadow: 0 0 15px rgba(102, 252, 241, 0.2);
}

.title {
  font-size: 4.5rem;
  letter-spacing: -1px;
  margin-bottom: 1.5rem;
  text-shadow: 0 10px 20px rgba(0,0,0,0.5);
}

.gradient-text {
  background: linear-gradient(135deg, #ffffff 0%, var(--accent-base) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.subtitle {
  font-size: 1.25rem;
  max-width: 600px;
  margin: 0 auto 3rem;
  color: rgba(203, 209, 214, 0.8);
}

.action-card {
  background: var(--card-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--card-border);
  border-radius: 24px;
  padding: 2.5rem;
  margin-bottom: 4rem;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
  transition: transform var(--transition-normal);
}

.action-card:hover {
  transform: translateY(-5px);
  border-color: rgba(102, 252, 241, 0.3);
}

.count-display {
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
}

.count-display strong {
  font-size: 1.5rem;
  color: var(--accent-base);
}

.primary-btn {
  position: relative;
  background: var(--accent-base);
  color: #0b0c10;
  padding: 1rem 2.5rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  overflow: hidden;
  transition: all var(--transition-fast);
}

.primary-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(102, 252, 241, 0.5);
}

.primary-btn:active {
  transform: scale(0.98);
}

.btn-text {
  position: relative;
  z-index: 1;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  width: 100%;
}

.feature {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 16px;
  padding: 2rem;
  transition: all var(--transition-normal);
  text-align: center;
}

.feature:hover {
  background: rgba(255,255,255,0.05);
  transform: translateY(-10px);
  border-color: var(--accent-secondary);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.feature h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.feature p {
  font-size: 0.9rem;
  color: rgba(203, 209, 214, 0.7);
}

@media (max-width: 768px) {
  .title { font-size: 3rem; }
  .features-grid { grid-template-columns: 1fr; }
}
</style>
