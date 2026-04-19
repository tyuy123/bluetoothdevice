<template>
  <!-- 授权开通会员弹窗 -->
  <view v-if="authStore.showAuthModal" class="modal-mask" @tap.self="authStore.closeModal">
    <view class="modal-box">
      <view class="modal-header">
        <image src="/static/logo.png" class="modal-logo" mode="aspectFit" />
        <text class="modal-title">开通蓝牙会员</text>
        <text class="modal-desc">添加设备需开通会员，授权即自动注册</text>
      </view>

      <view class="privacy-tip">
        已阅读并同意
        <text class="link" @tap="goPrivacy">《隐私政策》</text>
        和
        <text class="link" @tap="goTerms">《使用条款》</text>
      </view>

      <!-- 微信授权登录（直接调用 uni.login() 无需 open-type） -->
      <button class="btn-wx" @tap="onWxLogin">
        <uni-icons type="weixin" size="20" color="#fff" />
        <text>微信授权登录</text>
      </button>

      <text class="cancel-btn" @tap="authStore.closeModal">暂不开通</text>
    </view>
  </view>
</template>

<script setup>
import { useAuthStore } from '@/store/auth'
import { useUserStore } from '@/store/user'
import { login } from '@/api/user'

const authStore = useAuthStore()
const userStore = useUserStore()

async function onWxLogin() {
  uni.showLoading({ title: '登录中...' })
  try {
    // 获取微信昵称和头像（会弹出微信授权窗口）
    const profileRes = await new Promise((resolve, reject) => {
      uni.getUserProfile({
        desc: '用于完善会员信息',
        success: resolve,
        fail: reject
      })
    })
    const { nickName, avatarUrl, gender } = profileRes.userInfo

    // 获取临时登录凭证 code
    const wxCode = await new Promise((resolve, reject) => {
      uni.login({ success: res => resolve(res.code), fail: reject })
    })

    const res = await login({
      code:     wxCode,
      // wechat:   '0',
      // phone:    '0',
      nickname: nickName  || '用户',
      avatar:   'https://xxx.com/avatar.jpg', //avatarUrl || '',
      gender:   gender    ?? 0
    })
    userStore.login(res.member, res.token, res.refresh_token)
    requestLocationPermission()
    authStore.onAuthSuccess()
    uni.showToast({ title: '登录成功', icon: 'success' })
  } catch (err) {
    uni.showToast({ title: err.message || '登录失败，请重试', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

function requestLocationPermission() {
  uni.authorize({
    scope: 'scope.userLocation',
    success() {},
    fail() {
      uni.showModal({
        title: '提示',
        content: '蓝牙设备连接需要位置权限，请在设置中开启',
        showCancel: false
      })
    }
  })
}

function goPrivacy() {
  authStore.closeModal()
  uni.navigateTo({ url: '/pages/about/privacy' })
}
function goTerms() {
  authStore.closeModal()
  uni.navigateTo({ url: '/pages/about/terms' })
}
</script>

<style scoped>
.modal-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.modal-box {
  width: 100%;
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  padding: 48rpx 48rpx 80rpx;
  box-sizing: border-box;
}
.modal-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32rpx;
}
.modal-logo {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  margin-bottom: 16rpx;
}
.modal-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}
.modal-desc {
  font-size: 26rpx;
  color: #999;
  text-align: center;
}
.privacy-tip {
  font-size: 24rpx;
  color: #999;
  text-align: center;
  margin-bottom: 40rpx;
}
.link {
  color: #1DC799;
}
.btn-wx {
  width: 100%;
  height: 88rpx;
  background: #1DC799;
  color: #fff;
  font-size: 32rpx;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  margin-bottom: 32rpx;
  border: none;
}
.btn-wx::after { border: none; }
.cancel-btn {
  display: block;
  text-align: center;
  font-size: 28rpx;
  color: #999;
  padding: 16rpx 0;
}
</style>
