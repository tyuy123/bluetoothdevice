<template>
  <view class="page">
    <view class="menu-group">
      <view class="menu-item" @tap="goTerms">
        <text class="item-label">使用条款</text>
        <uni-icons type="right" size="14" color="#ccc" />
      </view>
      <view class="menu-item" @tap="goPrivacy">
        <text class="item-label">隐私政策</text>
        <uni-icons type="right" size="14" color="#ccc" />
      </view>
    </view>
  </view>
</template>

<script setup>
function goTerms() { uni.navigateTo({ url: '/pages/about/terms' }) }
function goPrivacy() { uni.navigateTo({ url: '/pages/about/privacy' }) }
</script>

<style scoped>
.page { background: #f5f5f5; min-height: 100vh; padding: 24rpx; }
.menu-group { background: #fff; border-radius: 16rpx; overflow: hidden; }
.menu-item {
  display: flex; align-items: center;
  padding: 36rpx 32rpx;
  border-bottom: 1rpx solid #f5f5f5;
}
.menu-item:last-child { border-bottom: none; }
.item-label { flex: 1; font-size: 30rpx; color: #333; }
</style>
