<template>
  <!--
  <view class="page">
    <swiper class="swiper" :current="current" @change="onSwiperChange"
      previous-margin="0" next-margin="80rpx" display-multiple-items="1">
      <swiper-item v-for="(device, index) in devices" :key="device.id" class="swiper-item">
        <view class="card" :style="{background: device.bgColor}" @tap="onCardTap(device)">
          <view class="card-header">
            <text class="card-name">{{ device.name }}</text>
            <text class="card-sub">智能控制</text>
          </view>
          <image :src="device.image" class="card-img" mode="aspectFit" />
        </view>
      </swiper-item>
    </swiper>

    <view class="dots">
      <view v-for="(_, i) in devices" :key="i" class="dot"
        :class="{active: i === current}"></view>
    </view>
  </view>
  -->

  <view class="page">
    <text class="device-name">智能脉冲刺激仪</text>
    <image src="/static/ic_device.png" class="device-img" mode="aspectFit" @tap="onCardTap" />
  </view>
</template>

<script setup>
/*
import { ref } from 'vue'
import { DEVICE_LIST } from '@/constants/devices'

const devices = ref(DEVICE_LIST)
const current = ref(0)

function onSwiperChange(e) {
  current.value = e.detail.current
}

function onCardTap(device) {
  if (device.id === 'footEms') {
    uni.navigateTo({ url: '/pages/virtual/ems' })
  } else {
    uni.showToast({ title: device.name + ' 虚拟体验即将上线', icon: 'none' })
  }
}
*/

function onCardTap() {
  uni.navigateTo({ url: '/pages/virtual/ems' })
}
</script>

<style scoped>
/*
.page {
  height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.swiper {
  width: 100%;
  height: 80vh;
}
.swiper-item {
  padding: 40rpx 0 40rpx 40rpx;
  box-sizing: border-box;
}
.card {
  width: 100%;
  height: 100%;
  border-radius: 32rpx;
  display: flex;
  flex-direction: column;
  padding: 48rpx;
  box-sizing: border-box;
  overflow: hidden;
}
.card-header { margin-bottom: 32rpx; }
.card-name {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 8rpx;
}
.card-sub {
  font-size: 26rpx;
  color: rgba(255,255,255,0.85);
}
.card-img {
  flex: 1;
  width: 80%;
  align-self: center;
}

.dots {
  display: flex;
  justify-content: center;
  padding: 24rpx 0 48rpx;
  gap: 12rpx;
}
.dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #ddd;
  transition: all 0.3s;
}
.dot.active {
  width: 28rpx;
  border-radius: 6rpx;
  background: #1DC799;
}
*/

.page {
  height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.device-name {
  font-size: 38rpx;
  font-weight: 300;
  color: #000;
  margin-bottom: 60rpx;
}

.device-img {
  width: 450rpx;
  height: 450rpx;
}
</style>
