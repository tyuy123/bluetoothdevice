<template>
  <scroll-view scroll-y class="page">
    <!-- 首次启动时显示同意按钮 -->
    <view v-if="isFirstLaunch" class="first-bar">
      <text class="first-tip">请阅读并同意以下协议才能继续使用小程序</text>
    </view>

    <view class="content-wrap">
      <text class="main-title">蓝牙用户权益条款</text>
      <text class="doc-title">蓝牙云大数据平台服务协议</text>
      <text class="update-date">更新日期：2022年5月1日</text>

      <view class="section">
        <text class="section-title">第一条 协议内容及效力</text>
        <text class="para">1.1 本协议内容包括协议正文及所有蓝牙云大数据已经发布或将来可能发布的各类规则（业务规范、条款等）。所有规则为本协议不可分割的组成部分，与协议正文具有同等法律效力。如有任何变更，蓝牙云大数据将公告最新用户协议及规则，变更立即生效，成为本协议的一部分。如您在变更后继续使用蓝牙云大数据平台服务，即视为您接受修改后的协议，否则您应立即停止使用。</text>
      </view>

      <view class="section">
        <text class="section-title">第二条 定义</text>
        <text class="para">2.1 蓝牙云大数据平台：指浙江XX医疗科技有限公司及关联公司（以下简称"蓝牙云大数据"）经营的各类软件系统及服务，包括但不限于蓝牙智能小程序、蓝牙APP等。</text>
        <text class="para">2.2 用户：指注册、登录、使用蓝牙云大数据平台的个人用户。</text>
        <text class="para">2.3 会员：指通过微信授权或手机号授权完成注册的用户，享有添加设备、设备控制等完整权限。</text>
      </view>

      <view class="section">
        <text class="section-title">第三条 用户信息与隐私</text>
        <text class="para">3.1 在使用蓝牙云大数据平台服务时，您可能需要提供个人信息（如微信账号、手机号码等）。蓝牙云大数据将依据相关法律法规保护您的个人信息安全。</text>
        <text class="para">3.2 蓝牙云大数据不会向无关第三方透露您的个人信息，法律法规另有规定的除外。</text>
      </view>

      <view class="section">
        <text class="section-title">第四条 服务内容</text>
        <text class="para">4.1 蓝牙云大数据平台提供智能设备管理、设备蓝牙连接控制、虚拟体验展示、益智休闲游戏、客服服务等功能。</text>
        <text class="para">4.2 具体服务内容以蓝牙云大数据平台实际提供为准，蓝牙云大数据有权随时调整、中止或终止部分或全部服务。</text>
      </view>

      <view class="section">
        <text class="section-title">第五条 知识产权</text>
        <text class="para">5.1 蓝牙云大数据平台所有内容（包括但不限于文字、图片、音视频、软件等）的知识产权均归蓝牙云大数据所有，受中国及国际知识产权法律保护。</text>
      </view>
    </view>

    <!-- 首次同意按钮 -->
    <view v-if="isFirstLaunch" class="agree-bar">
      <view class="agree-btn" @tap="agree">同意并继续</view>
      <view class="disagree-btn" @tap="disagree">不同意，退出</view>
    </view>
  </scroll-view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const isFirstLaunch = ref(false)

onLoad(options => {
  isFirstLaunch.value = options.firstLaunch === '1'
})

function agree() {
  uni.setStorageSync('privacyAgreed', true)
  uni.reLaunch({ url: '/pages/home/index' })
}

function disagree() {
  uni.showModal({
    title: '提示',
    content: '不同意协议将无法使用蓝牙智能小程序',
    confirmText: '仍然退出',
    cancelText: '返回阅读',
    success(res) {
      if (res.confirm) uni.exitMiniProgram?.()
    }
  })
}
</script>

<style scoped>
.page { background: #fff; min-height: 100vh; }
.first-bar {
  background: #FFF7E6;
  padding: 20rpx 32rpx;
  border-bottom: 1rpx solid #FFD591;
}
.first-tip { font-size: 24rpx; color: #FA8C16; }
.content-wrap { padding: 40rpx 32rpx 120rpx; }
.main-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #1DC799;
  display: block;
  margin-bottom: 8rpx;
}
.doc-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}
.update-date { font-size: 24rpx; color: #999; display: block; margin-bottom: 40rpx; }
.section { margin-bottom: 40rpx; }
.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
}
.para {
  font-size: 26rpx;
  color: #555;
  line-height: 1.8;
  display: block;
  margin-bottom: 12rpx;
}
.agree-bar {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  background: #fff;
  padding: 24rpx 32rpx 48rpx;
  border-top: 1rpx solid #eee;
}
.agree-btn {
  background: #1DC799;
  color: #fff;
  height: 88rpx;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  margin-bottom: 16rpx;
}
.disagree-btn {
  text-align: center;
  font-size: 28rpx;
  color: #999;
  padding: 16rpx 0;
}
</style>
