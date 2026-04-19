<template>
  <view class="page">
    <view class="info-bar">
      <view class="stat">
        <text class="stat-label">步数</text>
        <text class="stat-val">{{ moves }}</text>
      </view>
      <view class="new-btn" @tap="newGame">新游戏</view>
      <view class="stat">
        <text class="stat-label">配对</text>
        <text class="stat-val">{{ matched }}/{{ PAIRS }}</text>
      </view>
    </view>

    <view class="board">
      <view v-for="(card, i) in cards" :key="card.key" class="card"
        :class="{flipped: card.flipped, matched: card.matched}"
        @tap="flip(i)">
        <view class="card-inner">
          <view class="card-back"><text class="card-q">?</text></view>
          <view class="card-front"><text class="card-emoji">{{ card.emoji }}</text></view>
        </view>
      </view>
    </view>

    <view v-if="won" class="win-mask">
      <view class="win-box">
        <text class="win-emoji">🏆</text>
        <text class="win-title">全部配对！</text>
        <text class="win-info">共 {{ moves }} 步</text>
        <view class="win-btn" @tap="newGame">再来一局</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'

const PAIRS = 8
const EMOJIS = ['🎯','🎮','🎲','🎪','🎨','🎭','🎱','🏆']

const cards = ref([])
const moves = ref(0)
const won = ref(false)
let flippedIdx = ref(-1)
let canFlip = true
const matched = computed(() => cards.value.filter(c => c.matched).length / 2)

function newGame() {
  won.value = false
  moves.value = 0
  flippedIdx.value = -1
  canFlip = true
  const pool = [...EMOJIS, ...EMOJIS].map((emoji, i) => ({
    emoji, key: i, flipped: false, matched: false
  }))
  // 洗牌
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]]
  }
  cards.value = pool
}

function flip(idx) {
  if (!canFlip) return
  const card = cards.value[idx]
  if (card.flipped || card.matched) return

  card.flipped = true

  if (flippedIdx.value === -1) {
    flippedIdx.value = idx
    return
  }

  moves.value++
  const prev = cards.value[flippedIdx.value]
  if (prev.emoji === card.emoji) {
    // 匹配成功
    prev.matched = true
    card.matched = true
    flippedIdx.value = -1
    if (matched.value === PAIRS) won.value = true
  } else {
    // 不匹配，翻回
    canFlip = false
    const savedIdx = flippedIdx.value
    flippedIdx.value = -1
    setTimeout(() => {
      cards.value[savedIdx].flipped = false
      cards.value[idx].flipped = false
      canFlip = true
    }, 800)
  }
}

newGame()
</script>

<style scoped>
.page { min-height: 100vh; background: #E3F2FD; display: flex; flex-direction: column; align-items: center; }
.info-bar {
  width: 100%; display: flex; align-items: center; justify-content: space-between;
  padding: 24rpx 40rpx;
}
.stat { display: flex; flex-direction: column; align-items: center; }
.stat-label { font-size: 22rpx; color: #666; }
.stat-val { font-size: 36rpx; font-weight: bold; color: #333; }
.new-btn {
  background: #2196F3; color: #fff;
  font-size: 28rpx; padding: 16rpx 40rpx; border-radius: 32rpx;
}

.board {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
  padding: 24rpx 40rpx;
  width: 100%;
  box-sizing: border-box;
}
.card {
  aspect-ratio: 1;
  perspective: 800px;
  cursor: pointer;
}
.card-inner {
  width: 100%; height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.4s;
  border-radius: 16rpx;
}
.card.flipped .card-inner, .card.matched .card-inner {
  transform: rotateY(180deg);
}
.card-back, .card-front {
  position: absolute; inset: 0;
  border-radius: 16rpx;
  display: flex; align-items: center; justify-content: center;
  backface-visibility: hidden;
}
.card-back { background: #2196F3; box-shadow: 0 4rpx 12rpx rgba(33,150,243,0.3); }
.card-q { font-size: 48rpx; font-weight: bold; color: rgba(255,255,255,0.8); }
.card-front {
  background: #fff;
  transform: rotateY(180deg);
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
}
.card.matched .card-front { background: #E8F5E9; }
.card-emoji { font-size: 56rpx; }

.win-mask {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center; z-index: 100;
}
.win-box {
  background: #fff; border-radius: 32rpx; padding: 60rpx 80rpx;
  display: flex; flex-direction: column; align-items: center; gap: 16rpx;
}
.win-emoji { font-size: 80rpx; }
.win-title { font-size: 40rpx; font-weight: bold; color: #333; }
.win-info { font-size: 28rpx; color: #666; }
.win-btn {
  background: #2196F3; color: #fff;
  padding: 20rpx 64rpx; border-radius: 40rpx; font-size: 32rpx; margin-top: 16rpx;
}
</style>
