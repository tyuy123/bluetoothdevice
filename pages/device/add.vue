<template>
  <scroll-view scroll-y class="page">
    <view class="sub-title">添加设备</view>
    <view class="grid">
      <view v-for="device in devices" :key="device.id" class="device-card">
        <!-- <text class="device-name">{{ device.name }}</text> -->
		<text class="device-name">智能脉冲刺激仪</text>
        <image :src="device.image_url" class="device-img" mode="aspectFit" />
        <view class="add-btn" @tap="onAdd(device)">
          <text class="add-plus">+</text>
        </view>
      </view>
    </view>
  </scroll-view>

  <AuthModal />
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import { useAuthStore } from '@/store/auth'
import { getDeviceCategoryList } from '@/api/device'

const devices = ref([])
const userStore = useUserStore()
const authStore = useAuthStore()

onLoad(async () => {
  try {
    const data = await getDeviceCategoryList()
    devices.value = data.list
  } catch (e) {
    console.error('[DeviceCategory] 获取失败:', e.message)
  }
})

function doAdd(device) {
  const name  = encodeURIComponent(device.name)
  const uuids = encodeURIComponent(JSON.stringify(device.advertisServiceUUIDs || []))
  uni.navigateTo({ url: `/pages/device/pair?deviceId=${device.id}&deviceName=${name}&serviceUUIDs=${uuids}` })
}

function onAdd(device) {
  if (!userStore.isMember) {
    authStore.requireAuth(() => doAdd(device))
  } else {
    doAdd(device)
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
}
.sub-title {
  font-size: 26rpx;
  color: #999;
  padding: 24rpx 32rpx 16rpx;
}
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24rpx;
  padding: 0 24rpx 40rpx;
}
.device-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  position: relative;
  min-height: 280rpx;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06);
}
.device-name {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
  line-height: 1.4;
  margin-bottom: 12rpx;
}
.device-img {
  width: 100%;
  height: 160rpx;
  margin: auto 0;
}
.add-btn {
  position: absolute;
  right: 20rpx;
  bottom: 20rpx;
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  background: #7ECEF0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.add-plus {
  font-size: 32rpx;
  color: #fff;
  line-height: 1;
}
</style>
