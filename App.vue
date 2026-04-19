<script>
export default {
  onLaunch() {
    // 检查隐私协议授权
    const agreed = uni.getStorageSync('privacyAgreed')
    if (!agreed) {
      uni.navigateTo({ url: '/pages/about/privacy?firstLaunch=1' })
    }
  },
  onShow() {},
  onHide() {}
}
</script>

<style lang="scss">
@import '@/uni_modules/uni-scss/index.scss';

page {
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
}

/* 全局工具类 */
.primary-color { color: #1DC799; }
.text-secondary { color: #999; }
.text-sm { font-size: 24rpx; }
.flex-center { display: flex; align-items: center; justify-content: center; }
</style>
