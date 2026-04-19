<template>
  <scroll-view scroll-y class="page">
    <view class="content-wrap">
      <view class="logo-wrap">
        <image src="/static/logo.png" class="logo" mode="aspectFit" />
        <text class="app-name">蓝牙智能</text>
        <text class="version">版本 v1.0.0</text>
      </view>

      <view class="section">
        <text class="section-title">快速入门</text>
        <view class="step-list">
          <view v-for="step in steps" :key="step.num" class="step-item">
            <view class="step-num">{{ step.num }}</view>
            <view class="step-content">
              <text class="step-title">{{ step.title }}</text>
              <text class="step-desc">{{ step.desc }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="section">
        <text class="section-title">蓝牙连接说明</text>
        <text class="para">· 使用前请确保手机蓝牙已开启</text>
        <text class="para">· 确保设备在手机附近（建议10米以内）</text>
        <text class="para">· 每款设备配对方式略有不同，请按照配对页面引导操作</text>
        <text class="para">· 如多次配对失败，请尝试重启设备后再试</text>
      </view>

      <view class="section">
        <text class="section-title">常见问题</text>
        <view v-for="faq in faqs" :key="faq.q" class="faq-item">
          <text class="faq-q">Q：{{ faq.q }}</text>
          <text class="faq-a">A：{{ faq.a }}</text>
        </view>
      </view>

      <view class="contact-section">
        <text class="contact-title">技术支持</text>
        <text class="contact-info">客服邮箱：xxxx</text>
        <text class="contact-info">服务时间：工作日 9:00 - 18:00</text>
      </view>
    </view>
  </scroll-view>
</template>

<script setup>
const steps = [
  { num: 1, title: '下载小程序', desc: '微信搜索"蓝牙智能"小程序并打开' },
  { num: 2, title: '开通会员', desc: '点击首页"添加设备"，选择微信或手机号授权' },
  { num: 3, title: '添加设备', desc: '在设备列表中选择您的蓝牙设备型号' },
  { num: 4, title: '蓝牙配对', desc: '按照引导操作设备进入配对模式' },
  { num: 5, title: '开始使用', desc: '配对成功后即可通过APP控制您的蓝牙设备' }
]
const faqs = [
  { q: '为什么找不到我的设备？', a: '请确认设备已开机并处于配对模式，同时确保手机蓝牙和位置权限已开启。' },
  { q: '配对成功后设备断开连接怎么办？', a: '尝试重新进入设备控制页，系统会自动重连。如仍无法连接，请重启设备后再试。' },
  { q: '如何解绑设备？', a: '在设备卡片上长按，选择"解绑设备"即可。' },
  // { q: '积分如何获取？', a: '使用设备、参与益智小游戏等均可获得积分，具体规则请关注官方公告。' }
]
</script>

<style scoped>
.page { background: #f5f5f5; min-height: 100vh; }
.content-wrap { padding: 32rpx; }
.logo-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 0;
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
}
.logo { width: 120rpx; height: 120rpx; margin-bottom: 16rpx; }
.app-name { font-size: 36rpx; font-weight: bold; color: #333; }
.version { font-size: 24rpx; color: #999; margin-top: 8rpx; }
.section { background: #fff; border-radius: 16rpx; padding: 32rpx; margin-bottom: 24rpx; }
.section-title { font-size: 30rpx; font-weight: bold; color: #333; display: block; margin-bottom: 24rpx; }
.step-list { display: flex; flex-direction: column; gap: 24rpx; }
.step-item { display: flex; align-items: flex-start; gap: 20rpx; }
.step-num {
  width: 48rpx; height: 48rpx; border-radius: 50%;
  background: #1DC799; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 26rpx; font-weight: bold; flex-shrink: 0;
}
.step-content { flex: 1; }
.step-title { font-size: 28rpx; font-weight: bold; color: #333; display: block; margin-bottom: 4rpx; }
.step-desc { font-size: 24rpx; color: #666; line-height: 1.6; }
.para { font-size: 26rpx; color: #555; line-height: 1.8; display: block; margin-bottom: 8rpx; }
.faq-item { margin-bottom: 24rpx; }
.faq-q { font-size: 28rpx; font-weight: bold; color: #333; display: block; margin-bottom: 8rpx; }
.faq-a { font-size: 26rpx; color: #666; line-height: 1.6; display: block; }
.contact-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 40rpx;
}
.contact-title { font-size: 30rpx; font-weight: bold; color: #333; display: block; margin-bottom: 16rpx; }
.contact-info { font-size: 26rpx; color: #666; display: block; line-height: 2; }
</style>
