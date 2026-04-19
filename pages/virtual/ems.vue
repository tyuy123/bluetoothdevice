<template>
  <view class="page">
    <!-- 操作栏：开始/停止 + 状态 -->
    <view class="status-bar">
      <view class="btn-row">
        <view class="btn-start" :class="{running: isRunning}" @tap="toggleRun">
		  <uni-icons :type="isRunning ? 'pause' : 'right'" size="16" />
          <text class="btn-start-text">{{ isRunning ? '停止' : '开始' }}</text>
        </view>
      </view>
      <view class="right-status">
        <view class="ble-dot battery-ok"></view>
        <text class="battery-text">电量：{{ battery }}%</text>
      </view>
    </view>

    <!-- 设备图片区 -->
    <view class="device-area">
      <image src="/static/ic_furun.png" class="device-img" mode="widthFix" />
    </view>

    <!-- 底部控制面板 -->
    <view class="panel">
      <view class="cards-row">
        <view class="ctrl-card" @tap="openSheet('mode')">
          <view class="card-top">
            <text class="card-main">{{ currentMode.name }}</text>
            <image src="/static/ic_arrow_right.png" class="arrow_right" mode="widthFix"></image>
          </view>
          <text class="card-sub">按摩模式</text>
        </view>
        <view class="ctrl-card" @tap="openSheet('time')">
          <view class="card-top">
            <text class="card-main">时间</text>
            <image src="/static/ic_arrow_right.png" class="arrow_right" mode="widthFix"></image>
          </view>
          <text class="card-sub">调整</text>
        </view>
      </view>

      <!-- 力度调节 -->
      <view class="intensity-card">
        <view class="intensity-header">
          <text class="intensity-label">力度</text>
          <view class="intensity-divider"></view>
          <text class="intensity-cur">{{ intensity }}</text>
        </view>
        <view class="intensity-controls">
          <image class="intensity-img" src="/static/ic_minus.png" mode="" @tap="changeIntensity(-1)"></image>
          <view class="intensity-track">
            <view v-for="n in 8" :key="n" class="num-item" @tap="setIntensity(n)">
              <text class="i-num" :class="{active: n === intensity}">{{ n }}</text>
              <text class="dot-arrow" :style="{opacity: n === intensity ? 1 : 0}">▲</text>
            </view>
          </view>
          <image class="intensity-img" src="/static/ic_plus.png" mode="" @tap="changeIntensity(1)"></image>
        </view>
      </view>
    </view>

    <!-- 首次提示弹框 -->
    <view v-if="showTip" class="dialog-mask">
      <view class="dialog">
        <text class="dialog-title">提示</text>
        <text class="dialog-desc">本页面为设备虚拟体验，实际效果{{ '\n' }}以正常连接设备为准~</text>
        <view class="dialog-btn" @tap="closeTip">好的</view>
      </view>
    </view>

    <!-- 底部弹窗：我的按摩方式 -->
    <view v-if="showSheet" class="sheet-mask" @tap="closeSheet">
      <view class="sheet" @tap.stop>
        <view class="sheet-handle"></view>
        <view class="sheet-head">
          <text class="sheet-title">我的按摩方式</text>
          <view class="sheet-done" @tap="closeSheet"><text class="sheet-done-text">完成</text></view>
        </view>
        <view v-if="sheetTab === 'mode'" class="sheet-body">
          <text class="sheet-section">按摩模式</text>
          <view class="mode-list">
            <view v-for="m in modes" :key="m.id" class="mode-item" @tap="selectMode(m)">
              <view class="mode-circle" :class="{selected: currentMode.id === m.id}">
                <text class="mode-emoji">{{ m.icon }}</text>
              </view>
              <text class="mode-name" :class="{selected: currentMode.id === m.id}">{{ m.name }}</text>
            </view>
          </view>
        </view>
        <view v-if="sheetTab === 'time'" class="sheet-body">
          <view class="time-header">
            <text class="time-label">调节时间</text>
            <view class="time-divider"></view>
            <text class="time-val">{{ selectedMinutes }}</text>
          </view>
          <slider :min="5" :max="20" :value="selectedMinutes" :step="5"
            activeColor="#0065f4" backgroundColor="#eee" block-color="#0065f4"
            :show-value="false" @change="onSliderChange" />
          <view class="slider-marks">
            <text v-for="m in [5,10,15,20]" :key="m" class="slider-mark"
              :class="{active: selectedMinutes >= m}">{{ m }}</text>
          </view>
        </view>
        <view class="sheet-tabs">
          <view class="sheet-tab" :class="{active: sheetTab === 'mode'}" @tap="sheetTab = 'mode'">
            <text class="tab-text">手法</text>
          </view>
          <view class="sheet-tab" :class="{active: sheetTab === 'time'}" @tap="sheetTab = 'time'">
            <text class="tab-text">时间</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onUnload } from '@dcloudio/uni-app'

// ── 首次提示 ──────────────────────────────────
const showTip = ref(true)
function closeTip() { showTip.value = false }

// ── 虚拟电量（固定显示99） ────────────────────
const battery = ref(99)

// ── 按摩模式 ──────────────────────────────────
const modes = [
  { id: 'relax', name: '日常放松', icon: '✦' },
  { id: 'drain', name: '运动修复', icon: '❋' },
]
const currentMode = ref(modes[0])

// ── 时间 ──────────────────────────────────────
const selectedMinutes = ref(20)

// ── 开始/停止 ─────────────────────────────────
const isRunning = ref(false)
let timer = null

function toggleRun() {
  isRunning.value = !isRunning.value
  if (isRunning.value) {
    uni.showToast({ title: '已根据您当前肌肉情况，为您自动调节最佳放松模式', icon: 'none', duration: 3000 })
  } else {
    clearInterval(timer)
    timer = null
  }
}

function stopTimer() {
  clearInterval(timer)
  timer = null
  isRunning.value = false
}

// ── 力度（1~8档） ─────────────────────────────
const intensity = ref(1)
function changeIntensity(delta) {
  const next = intensity.value + delta
  if (next >= 1 && next <= 8) intensity.value = next
}
function setIntensity(n) { intensity.value = n }

// ── 底部弹窗 ──────────────────────────────────
const showSheet = ref(false)
const sheetTab = ref('mode')
function openSheet(tab) { sheetTab.value = tab; showSheet.value = true }
function closeSheet() {
  showSheet.value = false
  if (isRunning.value) stopTimer()
}
function selectMode(m) { currentMode.value = m }
function onSliderChange(e) { selectedMinutes.value = e.detail.value }

// ── 生命周期 ──────────────────────────────────
onUnload(() => { clearInterval(timer) })
</script>

<style scoped>
.page { min-height: 100vh; background: #f4f4f4; display: flex; flex-direction: column; }

/* 状态栏 */
.status-bar { display: flex; align-items: center; justify-content: space-between; padding: 32rpx; }
.btn-row { display: flex; align-items: center; gap: 16rpx; }
.btn-start { display: flex; align-items: center; gap: 10rpx; border: 3rpx solid #bbb; border-radius: 40rpx; padding: 14rpx 28rpx; }
.btn-start.running { border-color: black; }
.btn-start-text { font-size: 28rpx; color: #333; font-weight: 500; }
.right-status { display: flex; align-items: center; gap: 10rpx; }
.ble-dot { width: 16rpx; height: 16rpx; border-radius: 50%; }
.ble-dot.battery-ok { background: #4CAF50; }
.battery-text { font-size: 24rpx; color: #555; }

/* 设备区 */
.device-area { position: relative; flex: 1; display: flex; flex-direction: column; align-items: center; padding: 10rpx 24rpx 16rpx; }
.device-img { width: 600rpx; height: auto; margin-top: 200rpx; margin-bottom: 200rpx; }

/* 控制面板 */
.panel { background: #f4f4f4; padding: 0 32rpx 60rpx; }
.cards-row { display: flex; gap: 20rpx; margin-bottom: 20rpx; }
.ctrl-card { flex: 1; background: #fff; border-radius: 20rpx; padding: 24rpx; box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.06); }
.card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16rpx; }
.card-main { display: block; font-size: 30rpx; font-weight: bold; color: #333; margin-bottom: 4rpx; }
.card-sub { font-size: 24rpx; color: #999; }
.arrow_right { width: 20rpx; height: auto; margin-top: 8rpx; }

.intensity-card { background: #fff; border-radius: 20rpx; padding: 28rpx 24rpx; box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.06); margin-bottom: 24rpx; }
.intensity-header { display: flex; align-items: center; gap: 16rpx; margin-bottom: 28rpx; }
.intensity-label { font-size: 28rpx; color: #333; font-weight: 600; }
.intensity-divider { width: 2rpx; height: 30rpx; background: #eee; }
.intensity-cur { font-size: 30rpx; color: #0065f4; font-weight: bold; }
.intensity-controls { display: flex; align-items: center; }
.intensity-track { flex: 1; display: flex; justify-content: space-between; align-items: flex-start; padding: 0 16rpx; }
.num-item { display: flex; flex-direction: column; align-items: center; gap: 4rpx; }
.i-num { font-size: 24rpx; color: #ccc; line-height: 1.2; }
.i-num.active { color: #333; font-weight: bold; font-size: 26rpx; }
.dot-arrow { font-size: 18rpx; color: #0065f4; line-height: 1; }
.intensity-img { width: 60rpx; height: 60rpx; }

/* 首次提示弹框 */
.dialog-mask { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; z-index: 100; }
.dialog { width: 580rpx; background: #fff; border-radius: 28rpx; padding: 56rpx 48rpx 40rpx; display: flex; flex-direction: column; align-items: center; }
.dialog-title { font-size: 34rpx; font-weight: bold; color: #333; margin-bottom: 24rpx; }
.dialog-desc { font-size: 28rpx; color: #666; text-align: center; line-height: 1.7; margin-bottom: 48rpx; white-space: pre-line; }
.dialog-btn { width: 100%; height: 88rpx; background: #1DC799; border-radius: 44rpx; display: flex; align-items: center; justify-content: center; font-size: 32rpx; color: #fff; font-weight: 500; }

/* 弹窗 */
.sheet-mask { position: fixed; top:0;left:0;right:0;bottom:0; background: rgba(0,0,0,0.4); z-index: 200; display: flex; flex-direction: column; justify-content: flex-end; }
.sheet { background: #fff; border-radius: 32rpx 32rpx 0 0; padding: 0 0 60rpx; min-height: 500rpx; }
.sheet-handle { width: 72rpx; height: 8rpx; background: #ddd; border-radius: 4rpx; margin: 20rpx auto 0; }
.sheet-head { display: flex; align-items: center; justify-content: space-between; padding: 28rpx 40rpx 20rpx; border-bottom: 1rpx solid #f5f5f5; }
.sheet-title { font-size: 32rpx; font-weight: bold; color: #333; }
.sheet-done { background: #0065f4; border-radius: 30rpx; padding: 10rpx 28rpx; }
.sheet-done-text { font-size: 28rpx; color: #fff; font-weight: 500; }
.sheet-body { padding: 32rpx 40rpx 0; }
.sheet-section { font-size: 28rpx; font-weight: bold; color: #333; display: block; margin-bottom: 28rpx; }
.mode-list { display: flex; justify-content: space-between; }
.mode-item { display: flex; flex-direction: column; align-items: center; gap: 12rpx; }
.mode-circle { width: 96rpx; height: 96rpx; border-radius: 50%; background: #f0f0f0; display: flex; align-items: center; justify-content: center; }
.mode-circle.selected { background: #0065f4; }
.mode-emoji { font-size: 36rpx; }
.mode-name { font-size: 22rpx; color: #999; text-align: center; }
.mode-name.selected { color: #0065f4; }
.time-header { display: flex; align-items: center; gap: 16rpx; margin-bottom: 24rpx; }
.time-label { font-size: 28rpx; font-weight: bold; color: #333; }
.time-divider { width: 2rpx; height: 28rpx; background: #eee; }
.time-val { font-size: 30rpx; color: #0065f4; font-weight: bold; }
.slider-marks { display: flex; justify-content: space-between; padding: 8rpx 4rpx 0; }
.slider-mark { font-size: 22rpx; color: #ccc; }
.slider-mark.active { color: #0065f4; }
.sheet-tabs { display: flex; justify-content: center; gap: 80rpx; padding-top: 40rpx; }
.sheet-tab { padding-bottom: 12rpx; }
.sheet-tab.active { border-bottom: 4rpx solid #0065f4; }
.tab-text { font-size: 30rpx; color: #999; }
.sheet-tab.active .tab-text { color: #0065f4; }
</style>
