<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="navbar" :style="{paddingTop: statusH + 'px'}">
      <view class="nav-inner">
        <text class="nav-title">蓝牙健康</text>
      </view>
    </view>

    <!-- 广告 Banner 轮播 -->
    <swiper class="banner" autoplay :interval="3000" circular>
      <swiper-item v-for="item in banners" :key="item.id" @tap="onBannerTap(item)">
        <view class="banner-item" :style="{background: item.gradient}">
          <view class="banner-content">
            <!-- <text class="banner-brand">{{ item.title }}</text>
            <text class="banner-name">{{ item.title }}</text> -->
            <image :src="item.image_url" mode="aspectFill" style="width:100%;height:100%;display:block;"></image>
          </view>
        </view>
      </swiper-item>
    </swiper>

    <!-- 发现蓝牙 -->
    <view class="section-title">发现蓝牙</view>
    <view class="feature-row">
      <image src="/static/bg_card.png" class="feature-bg" mode="aspectFill" />
      <view class="feature-card" @tap="goVirtual">
        <image src="/static/ic_tiyan.png" class="feature-icon" mode="aspectFit" />
        <text class="feature-text">虚拟体验</text>
      </view>

      <view class="feature-card" @tap="goAddDevice">
        <image src="/static/ic_device_add.png" class="feature-icon" mode="aspectFit" />
        <text class="feature-text">添加设备</text>
      </view>
    </view>

    <!-- 我的设备 -->
    <view class="section-title mt16">我的设备</view>
    <view v-if="deviceStore.devices.length === 0" class="empty-box">
      <uni-icons type="gear" size="60" color="#ddd" />
      <text class="empty-text">暂无设备</text>
      <text class="empty-sub">点击"添加设备"绑定您的智能设备</text>
    </view>
    <view v-else class="device-grid">
      <view v-for="device in deviceStore.devices" :key="device.id"
        class="device-card" @tap="onDeviceTap(device)" @longpress="onDeviceLongPress(device)">
        <image :src="device.image || '/static/logo.png'" class="device-img" mode="aspectFit" />
        <!-- <text class="device-name">{{ device.shortName || device.name }}</text> -->
		<text class="device-name">智能脉冲刺激仪</text>
      </view>
    </view>
  </view>

  <!-- 授权弹窗 -->
  <AuthModal />
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { useDeviceStore } from '@/store/device'
import { useUserStore } from '@/store/user'
import { useAuthStore } from '@/store/auth'
import { getAdsBanner, recordAdClick } from '@/api/ads'
import { refreshToken } from '@/api/user'
import { getDeviceList, unbindDevice } from '@/api/device'

const deviceStore = useDeviceStore()
const userStore = useUserStore()
const authStore = useAuthStore()

const statusH = ref(20)
const info = uni.getSystemInfoSync()
statusH.value = info.statusBarHeight || 20

// 本地兜底数据，接口失败时显示
const fallbackBanners = [
	{
		"id": 6,
		"title": "测试2",
		"image_url": "https://fxr.furunmed.com/uploads/ad/20260402/69cd4253130a6.png",
		"target_url": ""
	}
]

const banners = ref(fallbackBanners)

onLoad(async () => {
  // 已登录则刷新令牌 + 同步设备列表
  if (userStore.isMember && userStore.refreshToken) {
    try {
      const res = await refreshToken(userStore.refreshToken)
      userStore.updateToken(res.token, res.refresh_token)
    } catch (e) {
      console.warn('[home] 刷新令牌失败，自动退出登录', e.message)
      await userStore.logout()
    }

    if (userStore.isMember) {
      try {
        const data = await getDeviceList()
        deviceStore.setDevices(data.list || [])
      } catch (e) {
        console.warn('[home] 获取设备列表失败', e.message)
      }
    }
  }

  try {
    const data = await getAdsBanner()
    if (data && data.length > 0) {
      banners.value = data
    }
  } catch (e) {
    // 接口失败时保留本地兜底数据，不影响页面显示
    console.warn('[home] 广告接口失败，使用本地数据', e.message)
  }
})

onShow(async () => {
  if (userStore.isMember) {
    try {
      const data = await getDeviceList()
      deviceStore.setDevices(data.list || [])
    } catch (e) {
      console.warn('[home] onShow 刷新设备列表失败', e.message)
    }
  }
})

//虚拟体验
function onBannerTap(item) {
  if (item.id) recordAdClick(item.id).catch(() => {})
  if (item.target_url) uni.navigateTo({ url: item.target_url })
}

function goVirtual() {
  uni.navigateTo({ url: '/pages/virtual/index' })
}

//添加设备
function goAddDevice() {
  if (!userStore.isMember) {
    authStore.requireAuth(() => {
      uni.navigateTo({ url: '/pages/device/add' })
    })
  } else {
    uni.navigateTo({ url: '/pages/device/add' })
  }
}

function onDeviceTap(device) {
  // device.id = serial_number (MAC地址)，Android 上即 BLE deviceId，直接传给控制页连接
  const bleId = encodeURIComponent(device.id)
  const name  = encodeURIComponent(device.name || device.shortName || '')
  uni.navigateTo({ url: `/pages/device/control?deviceId=${device.id}&bleDeviceId=${bleId}&deviceName=${name}` })
}

function onDeviceLongPress(device) {
  uni.showModal({
    title: '解绑设备',
    content: `确定要解绑设备吗？`,
    confirmText: '确定',
    cancelText: '取消',
    success: async (res) => {
      if (!res.confirm) return
      try {
        const serverId = deviceStore.getServerDeviceId(device.id)
        if (serverId) await unbindDevice(serverId)
        deviceStore.removeDevice(device.id)
        uni.showToast({ title: '解绑成功', icon: 'success' })
      } catch (e) {
        uni.showToast({ title: '解绑失败，请重试', icon: 'none' })
      }
    }
  })
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f1f1f1;
  padding-bottom: 40rpx;
}

/* 自定义导航栏 */
.navbar {
  background: #f1f1f1;
  width: 100%;
}
.nav-inner {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.nav-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #802257;
}

/* Banner */
.banner {
  width: calc(100% - 48rpx);
  height: 300rpx;
  margin: 0 24rpx;
  border-radius: 20rpx;
  overflow: hidden;
}
.banner-item {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  border-radius: 20rpx;
  overflow: hidden;
  box-sizing: border-box;
}
.banner-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.banner-brand {
  font-size: 24rpx;
  color: rgba(255,255,255,0.85);
  margin-bottom: 8rpx;
}
.banner-name {
  font-size: 40rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 16rpx;
}
.banner-tags {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 24rpx;
}
.banner-tag {
  font-size: 24rpx;
  color: rgba(255,255,255,0.9);
  line-height: 1.8;
}
.banner-btn {
  background: rgba(0,0,0,0.4);
  color: #fff;
  font-size: 22rpx;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
}

/* 区块标题 */
.section-title {
  font-size: 30rpx;
  color: #383838;
  padding: 28rpx 32rpx 16rpx;
}
.mt16 { margin-top: 0; }

/* 发现蓝牙 */
.feature-row {
  margin: 0 24rpx;
  border-radius: 20rpx;
  display: flex;
  overflow: hidden;
  position: relative;
}
.feature-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}
.feature-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx 0;
  position: relative;
  z-index: 1;
}
.feature-divider {
  width: 2rpx;
  background: rgba(255,255,255,0.4);
  position: relative;
  z-index: 1;
}
.feature-icon {
  width: 80rpx;
  height: 80rpx;
  margin-bottom: 16rpx;
}
.feature-plus {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  border: 4rpx solid #666;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;
}
.plus-text { font-size: 48rpx; color: #666; line-height: 1; }
.feature-text { font-size: 28rpx; color: #fff; }

/* 我的设备 - 双列网格 */
.empty-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 0;
}
.empty-text {
  font-size: 30rpx;
  color: #bbb;
  margin-top: 16rpx;
}
.empty-sub {
  font-size: 24rpx;
  color: #ccc;
  margin-top: 8rpx;
}
.device-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24rpx;
  padding: 0 24rpx;
}
.device-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 32rpx 24rpx 28rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.device-img {
  width: 140rpx;
  height: 140rpx;
  margin-bottom: 20rpx;
}
.device-name {
  font-size: 26rpx;
  color: #333;
  text-align: center;
  line-height: 1.4;
}
</style>
