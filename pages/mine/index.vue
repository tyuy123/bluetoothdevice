<template>
  <view class="page">
    <!-- 用户信息区（白色背景） -->
    <view class="user-section" :style="{paddingTop: statusH + 'px'}">
      <view class="avatar-wrap" @tap="goProfile">
        <image class="avatar" :src="userStore.avatar || '/static/logo.png'" mode="aspectFill" />
      </view>
      <text class="nickname">{{ userStore.nickname || '未登录' }}</text>
      <view class="stats-row">
        <view class="stat-item">
          <text class="stat-num">{{ deviceStore.devices.length }}</text>
          <text class="stat-label">我的设备</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-num">{{ userStore.score }}</text>
          <text class="stat-label">我的积分</text>
        </view>
      </view>
    </view>

    <!-- 分隔线 -->
    <view class="section-sep"></view>

    <!-- 菜单列表（白色背景） -->
    <view class="menu-list">
      <view v-for="item in menus" :key="item.id" class="menu-item" @tap="onMenu(item)">
        <image class="menu-icon" :src="item.icon" mode="aspectFit" />
        <text class="menu-label">{{ item.label }}</text>
        <uni-icons type="right" size="14" color="#ccc" />
      </view>
    </view>
  </view>

  <!-- 授权弹窗 -->
  <AuthModal />
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import { useDeviceStore } from '@/store/device'
import { useAuthStore } from '@/store/auth'

const userStore = useUserStore()
const deviceStore = useDeviceStore()
const authStore = useAuthStore()

const statusH = ref(20)
onShow(() => {
  statusH.value = uni.getSystemInfoSync().statusBarHeight || 20
  if (!userStore.isMember) {
    authStore.requireAuth(() => {})
  }
})

const menus = ref([
  // { id: 'games',    label: '益智休闲',  icon: '/static/ic_game.png',         route: '/pages/games/index' },
  { id: 'settings', label: '设置',      icon: '/static/ic_setting.png',       route: '/pages/settings/index' },
  { id: 'service',  label: '客服',      icon: '/static/ic_service.png',       route: '/pages/service/index' },
  { id: 'about',    label: '关于',      icon: '/static/ic_about.png',         route: '/pages/about/index' },
  { id: 'manual',   label: '蓝牙说明书', icon: '/static/ic_instructions.png', route: '/pages/manual/index' }
])

function onMenu(item) {
  uni.navigateTo({ url: item.route })
}

function goProfile() {
  if (userStore.isMember) {
    uni.navigateTo({ url: '/pages/settings/profile' })
  } else {
    authStore.requireAuth(() => {
      uni.navigateTo({ url: '/pages/settings/profile' })
    })
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f1f1f1;
}

/* 用户信息区 */
.user-section {
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 48rpx;
}

.avatar-wrap {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  border: 4rpx solid #802257;
  overflow: hidden;
  margin-top: 48rpx;
  margin-bottom: 24rpx;
}
.avatar {
  width: 100%;
  height: 100%;
}

.nickname {
  font-size: 32rpx;
  color: #333;
  margin-bottom: 36rpx;
}

.stats-row {
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
}
.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}
.stat-num {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
}
.stat-label {
  font-size: 24rpx;
  color: #999;
}
.stat-divider {
  width: 2rpx;
  height: 56rpx;
  background: #eee;
}

/* 分隔线 */
.section-sep {
  height: 16rpx;
  background: #f1f1f1;
}

/* 菜单列表 */
.menu-list {
  background: #fff;
}
.menu-item {
  display: flex;
  align-items: center;
  padding: 36rpx 40rpx;
  border-bottom: 1rpx solid #f5f5f5;
}
.menu-item:last-child {
  border-bottom: none;
}
.menu-icon {
  width: 48rpx;
  height: 48rpx;
  margin-right: 28rpx;
  flex-shrink: 0;
}
.menu-label {
  flex: 1;
  font-size: 30rpx;
  color: #333;
}
</style>
