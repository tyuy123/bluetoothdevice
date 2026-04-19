<template>
  <view class="page">
    <view class="info-bar">
      <view class="stat">
        <text class="stat-label">步数</text>
        <text class="stat-val">{{ moves }}</text>
      </view>
      <view class="new-btn" @tap="newGame">新游戏</view>
      <view class="stat">
        <text class="stat-label">用时</text>
        <text class="stat-val">{{ timeStr }}</text>
      </view>
    </view>

    <view class="board">
      <view v-for="(tile, i) in board" :key="i" class="tile"
        :class="{empty: tile === 0, correct: tile === i + 1 && tile !== 0}"
        @tap="tap(i)">
        <text v-if="tile !== 0" class="tile-num">{{ tile }}</text>
      </view>
    </view>

    <view v-if="won" class="win-mask">
      <view class="win-box">
        <text class="win-emoji">🎉</text>
        <text class="win-title">恭喜完成！</text>
        <text class="win-info">{{ moves }} 步 · {{ timeStr }}</text>
        <view class="win-btn" @tap="newGame">再来一局</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'

const SIZE = 3
const TOTAL = SIZE * SIZE
const board = ref([])
const moves = ref(0)
const won = ref(false)
let timer = null
const elapsed = ref(0)

const timeStr = computed(() => {
  const m = Math.floor(elapsed.value / 60)
  const s = elapsed.value % 60
  return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`
})

function newGame() {
  won.value = false
  moves.value = 0
  elapsed.value = 0
  clearInterval(timer)
  board.value = shuffle([1,2,3,4,5,6,7,8,0])
  timer = setInterval(() => { if (!won.value) elapsed.value++ }, 1000)
}

function shuffle(arr) {
  // 随机打乱，保证有解（偶数逆序对 = 有解）
  let a = [...arr]
  do {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]]
    }
  } while (!isSolvable(a) || isGoal(a))
  return a
}

function isSolvable(arr) {
  let inv = 0
  for (let i = 0; i < arr.length - 1; i++)
    for (let j = i + 1; j < arr.length; j++)
      if (arr[i] && arr[j] && arr[i] > arr[j]) inv++
  return inv % 2 === 0
}

function isGoal(arr) {
  return arr.every((v, i) => i === TOTAL - 1 ? v === 0 : v === i + 1)
}

function tap(idx) {
  if (won.value) return
  const empty = board.value.indexOf(0)
  const r1 = Math.floor(idx / SIZE), c1 = idx % SIZE
  const r2 = Math.floor(empty / SIZE), c2 = empty % SIZE
  const adjacent = (Math.abs(r1 - r2) + Math.abs(c1 - c2)) === 1
  if (!adjacent) return
  const b = [...board.value];
  [b[idx], b[empty]] = [b[empty], b[idx]]
  board.value = b
  moves.value++
  if (isGoal(board.value)) {
    won.value = true
    clearInterval(timer)
  }
}

onUnmounted(() => clearInterval(timer))
newGame()
</script>

<style scoped>
.page { min-height: 100vh; background: #f0f9f5; display: flex; flex-direction: column; align-items: center; }
.info-bar {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 40rpx;
}
.stat { display: flex; flex-direction: column; align-items: center; }
.stat-label { font-size: 22rpx; color: #999; }
.stat-val { font-size: 36rpx; font-weight: bold; color: #333; }
.new-btn {
  background: #4CAF50;
  color: #fff;
  font-size: 28rpx;
  padding: 16rpx 40rpx;
  border-radius: 32rpx;
}

.board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
  padding: 40rpx;
  width: 100%;
  max-width: 560rpx;
  box-sizing: border-box;
}
.tile {
  aspect-ratio: 1;
  background: #4CAF50;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(76,175,80,0.3);
  transition: all 0.15s;
}
.tile.empty { background: transparent; box-shadow: none; }
.tile.correct { background: #2E7D32; }
.tile-num { font-size: 60rpx; font-weight: bold; color: #fff; }

.win-mask {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 100;
}
.win-box {
  background: #fff;
  border-radius: 32rpx;
  padding: 60rpx 80rpx;
  display: flex; flex-direction: column; align-items: center; gap: 16rpx;
}
.win-emoji { font-size: 80rpx; }
.win-title { font-size: 40rpx; font-weight: bold; color: #333; }
.win-info { font-size: 28rpx; color: #666; }
.win-btn {
  background: #4CAF50; color: #fff;
  padding: 20rpx 64rpx; border-radius: 40rpx; font-size: 32rpx;
  margin-top: 16rpx;
}
</style>
