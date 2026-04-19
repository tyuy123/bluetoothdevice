<template>
  <view class="page">
    <view class="grid">
      <view v-for="game in games" :key="game.id" class="game-card"
        :style="{background: game.bg}" @tap="goGame(game)">
        <view class="game-head">
          <text class="game-name">{{ game.name }}</text>
          <uni-icons type="grid" size="24" color="rgba(255,255,255,0.8)" />
        </view>
        <text class="game-sub">{{ game.subName }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { GAME_LIST } from '@/constants/devices'
const games = GAME_LIST
function goGame(game) {
  uni.navigateTo({ url: game.route })
}
</script>

<style scoped>
.page { background: #f5f5f5; min-height: 100vh; padding: 24rpx; }
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24rpx;
}
.game-card {
  border-radius: 20rpx;
  padding: 32rpx;
  min-height: 200rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.game-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.game-name {
  font-size: 34rpx;
  font-weight: bold;
  color: #fff;
  flex: 1;
  line-height: 1.4;
}
.game-sub {
  font-size: 40rpx;
  font-weight: bold;
  color: rgba(255,255,255,0.9);
  letter-spacing: 2rpx;
}
/* 第三个卡片独占一行 */
.game-card:nth-child(3) {
  grid-column: 1 / 2;
}
</style>
