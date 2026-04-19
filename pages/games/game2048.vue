<template>
  <view class="page" @touchstart="onTouchStart" @touchend="onTouchEnd">
    <view class="info-bar">
      <view class="score-box">
        <text class="score-label">得分</text>
        <text class="score-val">{{ score }}</text>
      </view>
      <view class="best-box">
        <text class="score-label">最高</text>
        <text class="score-val">{{ best }}</text>
      </view>
      <view class="new-btn" @tap="newGame">新游戏</view>
    </view>

    <view class="board">
      <view v-for="(row, r) in board" :key="r" class="row">
        <view v-for="(val, c) in row" :key="c" class="cell"
          :class="'v' + val" :style="val ? {} : {background:'#CDC1B4'}">
          <text v-if="val" class="cell-num">{{ val }}</text>
        </view>
      </view>
    </view>

    <view v-if="over" class="over-mask">
      <view class="over-box">
        <text class="over-title">{{ reached2048 ? '🎉 你赢了！' : '游戏结束' }}</text>
        <text class="over-score">得分：{{ score }}</text>
        <view class="over-btn" @tap="newGame">再来一局</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const board = ref([])
const score = ref(0)
const best = ref(uni.getStorageSync('best2048') || 0)
const over = ref(false)
const reached2048 = ref(false)
let touchStartX = 0, touchStartY = 0

function newGame() {
  board.value = Array(4).fill(null).map(() => Array(4).fill(0))
  score.value = 0
  over.value = false
  reached2048.value = false
  addTile(); addTile()
}

function addTile() {
  const empty = []
  board.value.forEach((row, r) => row.forEach((v, c) => { if (!v) empty.push([r, c]) }))
  if (!empty.length) return
  const [r, c] = empty[Math.floor(Math.random() * empty.length)]
  board.value[r][c] = Math.random() < 0.9 ? 2 : 4
}

function move(dir) {
  if (over.value) return
  let moved = false
  const b = board.value.map(row => [...row])

  const compress = row => {
    const nums = row.filter(v => v)
    const merged = []
    let i = 0
    while (i < nums.length) {
      if (i + 1 < nums.length && nums[i] === nums[i + 1]) {
        const v = nums[i] * 2
        merged.push(v); score.value += v
        if (v === 2048) reached2048.value = true
        i += 2
      } else { merged.push(nums[i]); i++ }
    }
    while (merged.length < 4) merged.push(0)
    return merged
  }

  const rotate = (b) => b[0].map((_, i) => b.map(row => row[i]).reverse())
  const unrotate = (b) => b.map((row, i) => b.map(r => r[b.length - 1 - i]))

  let rotated = b
  if (dir === 'up') { rotated = rotate(b) }
  else if (dir === 'right') { rotated = b.map(r => [...r].reverse()) }
  else if (dir === 'down') { rotated = rotate(rotate(rotate(b))) }

  const shifted = rotated.map(row => {
    const c = compress(row)
    if (c.join() !== row.join()) moved = true
    return c
  })

  let result = shifted
  if (dir === 'up') result = unrotate(shifted)
  else if (dir === 'right') result = shifted.map(r => [...r].reverse())
  else if (dir === 'down') {
    result = rotate(shifted)
  }

  if (moved) {
    board.value = result
    addTile()
    if (score.value > best.value) {
      best.value = score.value
      uni.setStorageSync('best2048', best.value)
    }
    if (!canMove()) over.value = true
  }
}

function canMove() {
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++) {
      if (!board.value[r][c]) return true
      if (c < 3 && board.value[r][c] === board.value[r][c+1]) return true
      if (r < 3 && board.value[r][c] === board.value[r+1][c]) return true
    }
  return false
}

function onTouchStart(e) {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
}
function onTouchEnd(e) {
  const dx = e.changedTouches[0].clientX - touchStartX
  const dy = e.changedTouches[0].clientY - touchStartY
  if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return
  if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 'right' : 'left')
  else move(dy > 0 ? 'down' : 'up')
}

// 颜色映射
newGame()
</script>

<style scoped>
.page { min-height: 100vh; background: #FAF8EF; display: flex; flex-direction: column; align-items: center; }
.info-bar {
  width: 100%; display: flex; align-items: center; justify-content: space-between;
  padding: 24rpx 40rpx;
}
.score-box, .best-box {
  background: #BBADA0; border-radius: 12rpx;
  padding: 12rpx 24rpx; display: flex; flex-direction: column; align-items: center;
}
.score-label { font-size: 20rpx; color: #EEE4DA; }
.score-val { font-size: 32rpx; font-weight: bold; color: #fff; }
.new-btn {
  background: #8F7A66; color: #f9f6f2;
  font-size: 28rpx; padding: 16rpx 32rpx; border-radius: 12rpx;
}

.board {
  background: #BBADA0; border-radius: 12rpx;
  padding: 16rpx; display: flex; flex-direction: column; gap: 12rpx;
  margin: 0 24rpx;
}
.row { display: flex; gap: 12rpx; }
.cell {
  width: 148rpx; height: 148rpx; border-radius: 8rpx;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.1s;
}
.cell-num { font-size: 48rpx; font-weight: bold; color: #776E65; }

/* 颜色 */
.v2 { background: #EEE4DA; }
.v4 { background: #EDE0C8; }
.v8 { background: #F2B179; } .v8 .cell-num { color:#fff; }
.v16 { background: #F59563; } .v16 .cell-num { color:#fff; }
.v32 { background: #F67C5F; } .v32 .cell-num { color:#fff; }
.v64 { background: #F65E3B; } .v64 .cell-num { color:#fff; font-size:44rpx; }
.v128 { background: #EDCF72; } .v128 .cell-num { color:#fff; font-size:38rpx; }
.v256 { background: #EDCC61; } .v256 .cell-num { color:#fff; font-size:36rpx; }
.v512 { background: #EDC850; } .v512 .cell-num { color:#fff; font-size:36rpx; }
.v1024 { background: #EDC53F; } .v1024 .cell-num { color:#fff; font-size:30rpx; }
.v2048 { background: #EDC22E; } .v2048 .cell-num { color:#fff; font-size:28rpx; }

.over-mask {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center; z-index: 100;
}
.over-box {
  background: #fff; border-radius: 24rpx; padding: 60rpx;
  display: flex; flex-direction: column; align-items: center; gap: 16rpx;
}
.over-title { font-size: 40rpx; font-weight: bold; color: #333; }
.over-score { font-size: 28rpx; color: #666; }
.over-btn {
  background: #FF9800; color: #fff; padding: 20rpx 64rpx;
  border-radius: 40rpx; font-size: 32rpx; margin-top: 16rpx;
}
</style>
