<template>
  <view class="page">
    <view class="group-label">通用</view>
    <view class="menu-group">
      <view class="menu-item" @tap="goProfile">
        <text class="item-label">个人资料</text>
        <uni-icons type="right" size="14" color="#ccc" />
      </view>
    </view>
  </view>
</template>

<script setup>
function goProfile() {
  uni.navigateTo({ url: '/pages/settings/profile' })
}
</script>

<style scoped>
.page { background: #f5f5f5; min-height: 100vh; padding-top: 16rpx; }
.group-label { font-size: 24rpx; color: #999; padding: 16rpx 32rpx; }
.menu-group { background: #fff; border-radius: 16rpx; margin: 0 24rpx; overflow: hidden; }
.menu-item {
  display: flex;
  align-items: center;
  padding: 36rpx 32rpx;
  border-bottom: 1rpx solid #f5f5f5;
}
.menu-item:last-child { border-bottom: none; }
.item-label { flex: 1; font-size: 30rpx; color: #333; }
</style>
