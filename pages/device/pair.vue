<template>
  <view class="page" :style="{paddingTop: statusBarH + 'px'}">
    <!-- 自定义导航栏 
    <view class="nav-bar">
      <view class="back-btn" @tap="goBack">
        <uni-icons type="left" size="20" color="#fff" />
      </view>
      <text class="nav-title">{{ device ? device.name : '蓝牙配对' }}</text>
    </view>-->

    <view class="content">
      <!-- 设备图 -->
      <image src="/static/ic_device.png" class="device-img" mode="aspectFit" />

      <!-- 设备名 -->
      <!-- <text class="device-name">{{ device ? device.name : '智能脉冲刺激仪' }}</text> -->
      <text class="device-name">智能脉冲刺激仪</text>

      <!-- 蓝牙图标 + 扫描动效 -->
      <view class="blue-wrap">
        <image src="/static/ic_blue.png" class="blue-img" mode="aspectFit" />
        <view class="scanning-dot" v-if="scanning">
          <view class="dot1"></view>
          <view class="dot2"></view>
          <view class="dot3"></view>
        </view>
      </view>

      <!-- 提示文字 -->
      <text class="pair-tip" v-if="!errorMsg">长按 3S 后{{ '\n' }}等待蓝牙配对</text>
      <text class="pair-tip error" v-if="errorMsg">{{ errorMsg }}</text>

      <!-- 重试按钮 -->
      <view v-if="errorMsg && !scanning" class="retry-btn" @tap="startPairing">重新扫描</view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onUnload } from '@dcloudio/uni-app'
import { DEVICE_LIST } from '@/constants/devices'
import { useDeviceStore } from '@/store/device'
import { initBluetooth, closeBluetooth, startScan, stopScan, onDeviceFound, offDeviceFound, disconnectDevice } from '@/utils/bluetooth'

const deviceStore = useDeviceStore()

const statusBarH = ref(uni.getSystemInfoSync().statusBarHeight)
const device      = ref(null)
const serviceUUIDs = ref([])
const scanning    = ref(false)
const errorMsg    = ref('')
let scanTimer = null

onLoad(options => {
  let found = DEVICE_LIST.find(d => d.id === options.deviceId)
  if (!found && options.deviceName) {
    const name = decodeURIComponent(options.deviceName)
    found = {
      id:       options.deviceId,
      name,
      shortName: name,
      pairBg:   '#1DC799',
      pairTitle: `发现 ${name}`,
      pairTip:  '按图长按3S后\n等待蓝牙配对',
      pairType: 'longpress',
      image:    '/static/logo.png',
    }
  }
  device.value = found || null

  try {
    serviceUUIDs.value = JSON.parse(decodeURIComponent(options.serviceUUIDs || '[]'))
  } catch {
    serviceUUIDs.value = []
  }

  startPairing()
})

onUnload(() => {
  clearTimeout(scanTimer)
  offDeviceFound()
  stopScan().catch(() => {})
})

async function startPairing() {
  errorMsg.value = ''
  scanning.value = true

  try {
    // 关闭再重开适配器，清除扫描缓存（解决同一session内设备只上报一次的问题）
    closeBluetooth()
    await new Promise(r => setTimeout(r, 300))
    await initBluetooth()

    // 断开可能残留的旧连接，避免 connectDevice 失败
    if (deviceStore.connectedDeviceId) {
      await disconnectDevice(deviceStore.connectedDeviceId).catch(() => {})
      deviceStore.setDisconnected()
    }

    // 优先使用 advertisServiceUUIDs 过滤，降级扫全部
    const uuids = serviceUUIDs.value
    await startScan(uuids.length ? uuids : []).catch(async () => {
      if (uuids.length) await startScan([]).catch(() => {})
    })

    onDeviceFound(bleDevice => {
      clearTimeout(scanTimer)
      offDeviceFound()
      stopScan().catch(() => {})
      scanning.value = false

      // 将 bleDeviceId 传给控制页，由控制页完成连接+绑定
      const name = encodeURIComponent(device.value?.name || '')
      const bleId = encodeURIComponent(bleDevice.deviceId)
      uni.redirectTo({
        url: `/pages/device/control?deviceId=${device.value?.id}&deviceName=${name}&bleDeviceId=${bleId}`
      })
    })

    scanTimer = setTimeout(() => {
      if (scanning.value) {
        scanning.value = false
        errorMsg.value = '未找到设备，请确认设备已开机并在附近'
        offDeviceFound()
        stopScan().catch(() => {})
      }
    }, 30000)

  } catch (err) {
    scanning.value = false
    errorMsg.value = err.errCode === 10001
      ? '请先开启手机蓝牙'
      : '蓝牙初始化失败: ' + (err.errMsg || '')
  }
}

function goBack() {
  clearTimeout(scanTimer)
  offDeviceFound()
  stopScan().catch(() => {})
  uni.navigateBack()
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
}
.nav-bar {
  height: 88rpx;
  background: #802257;
  display: flex;
  align-items: center;
  padding: 0 32rpx;
  position: relative;
}
.back-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.nav-title {
  flex: 1;
  text-align: center;
  font-size: 32rpx;
  color: #fff;
  margin-right: 64rpx;
}
.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 40rpx;
}

.device-img {
  width: 420rpx;
  height: 420rpx;
  margin-bottom: 40rpx;
}

.device-name {
  font-size: 45rpx;
  font-weight: bold;
  color: #000;
  margin-bottom: 80rpx;
}

.blue-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40rpx;
}

.blue-img {
  width: 100rpx;
  height: 100rpx;
  margin-bottom: 24rpx;
}

.scanning-dot {
  display: flex;
  gap: 12rpx;
}
.dot1, .dot2, .dot3 {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #1890ff;
  animation: bounce 1.2s infinite ease-in-out;
}
.dot2 { animation-delay: 0.2s; }
.dot3 { animation-delay: 0.4s; }
@keyframes bounce {
  0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
  40% { transform: scale(1.2); opacity: 1; }
}

.pair-tip {
  font-size: 28rpx;
  color: #666;
  text-align: center;
  white-space: pre-line;
  line-height: 2;
}
.pair-tip.error {
  color: #ff4d4f;
}

.retry-btn {
  margin-top: 48rpx;
  padding: 20rpx 64rpx;
  border-radius: 40rpx;
  font-size: 32rpx;
  background: #802257;
  color: #fff;
}

</style>
