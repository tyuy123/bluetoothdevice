<template>
  <view class="page">
    <!-- 自定义导航栏 -->
    <!-- <view class="navbar" :style="{paddingTop: statusH + 'px'}">
      <view class="nav-row">
        <view class="nav-back" @tap="goBack">
          <uni-icons type="left" size="20" color="#fff" />
        </view>
        <text class="nav-title">{{ device.shortName || device.name }}</text>
        <view style="width:64rpx"></view>
      </view>
    </view> -->
    <!-- 操作栏：开始/停止 + 断开 + 电量 -->
    <view class="status-bar">
      <view class="btn-row">
        <view class="btn-start" :class="{running: isRunning, disabled: !isConnected}" @tap="toggleRun">
          <uni-icons :type="isRunning ? 'pause' : 'right'" size="16" />
          <text class="btn-start-text">{{ isRunning ? '停止' : '开始' }}</text>
        </view>
        <!-- <view v-if="isConnected" class="btn-disconnect" @tap="doDisconnect">
          <uni-icons type="close" size="14" color="#F9A8A8" />
          <text class="btn-disconnect-text">断开</text>
        </view> -->
      </view>
      <view class="right-status">
        <view class="ble-dot" :class="isConnected ? (isLowBattery ? 'low-battery' : 'battery-ok') : bleStatus"></view>
        <text class="battery-text" :class="{low: isLowBattery}">
          {{ isConnected ? `电量：${battery === '--' ? '--' : battery + '%'}` : bleStatusText }}
        </text>
      </view>
    </view>

    <!-- 设备图片区 + 调试信息 -->
    <view class="device-area">
      <image :src="device.image || '/static/ic_furun.png'" class="device-img" mode="widthFix" @tap="onDeviceImgTap" />
      <view v-if="bleStatus === 'scanning' || bleStatus === 'connecting'" class="scan-ring"></view>

      <!-- 调试信息面板 -->
      <view class="debug-panel">
        <!-- <view class="debug-header" @tap="showDebug = !showDebug">
          <text class="debug-title">调试信息</text>
          <text class="debug-arrow">{{ showDebug ? '▲' : '▼' }}</text>
        </view> -->
        <view v-if="showDebug" class="debug-body">
          <view class="debug-row">
            <text class="debug-key">BLE状态</text>
            <text class="debug-val" :class="'s-'+bleStatus">{{ bleStatusText }}</text>
          </view>
          <view class="debug-row">
            <text class="debug-key">设备ID</text>
            <text class="debug-val">{{ connectedDeviceId || '—' }}</text>
          </view>
          <view class="debug-row">
            <text class="debug-key">设备名称</text>
            <text class="debug-val">{{ connectedDeviceName || '—' }}</text>
          </view>
          <view class="debug-row">
            <text class="debug-key">电量</text>
            <text class="debug-val">{{ battery === '--' ? '未收到上报' : battery + '%' }}</text>
          </view>
          <view class="debug-row">
            <text class="debug-key">当前档位</text>
            <text class="debug-val">{{ intensity }} 档</text>
          </view>
          <view class="debug-row">
            <text class="debug-key">电极接触</text>
            <text class="debug-val">{{ contactStatus }}</text>
          </view>
          <view class="debug-divider"></view>
          <text class="debug-log-title">通信日志（最近10条）</text>
          <view v-for="(log, i) in debugLogs" :key="i" class="debug-log-row">
            <text class="log-dir" :class="log.dir">{{ log.dir === 'send' ? '发→' : '收←' }}</text>
            <text class="log-content">{{ log.text }}</text>
            <text class="log-time">{{ log.time }}</text>
          </view>
          <view v-if="debugLogs.length === 0" class="debug-empty">暂无通信记录</view>
          <view class="debug-actions">
            <view class="debug-btn" @tap="refreshStatus">刷新状态</view>
            <view class="debug-btn" @tap="debugLogs = []">清除日志</view>
          </view>
        </view>
      </view>
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
          <!-- <view class="intensity-btn minus" @tap="changeIntensity(-1)">
            <text class="intensity-btn-text">−</text>
          </view> -->
          <view class="intensity-track">
            <view v-for="n in 8" :key="n" class="num-item" @tap="setIntensity(n)">
              <text class="i-num" :class="{active: n === intensity}">{{ n }}</text>
              <text class="dot-arrow" :style="{opacity: n === intensity ? 1 : 0}">▲</text>
            </view>
          </view>
		  <image class="intensity-img" src="/static/ic_plus.png" mode="" @tap="changeIntensity(1)"></image>
          <!-- <view class="intensity-btn plus" @tap="changeIntensity(1)">
            <text class="intensity-btn-text">+</text>
          </view> -->
        </view>
      </view>

      <view v-if="bleStatus === 'disconnected'" class="reconnect-btn" @tap="reconnect">
        <!-- <uni-icons type="loop" size="18" color="#F9A8A8" /> -->
        <text class="reconnect-text">重新连接</text>
      </view>
    </view>

    <!-- 按摩方式弹窗 -->
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
import { ref, computed } from 'vue'
import { onLoad, onUnload } from '@dcloudio/uni-app'
import { DEVICE_LIST } from '@/constants/devices'
import { useDeviceStore } from '@/store/device'
import { useUserStore } from '@/store/user'
import {
  EMS_SERVICE_UUID, EMS_CHAR_UUID, EMS_CMD, EMS_REPORT,
  sendEmsCmd, processEmsData, resetEmsBuffer,
  initBluetooth, startScan, stopScan, onDeviceFound,
  connectDevice, disconnectDevice,
  notifyCharacteristic, onValueChange, onConnectionStateChange,
  offDeviceFound, offConnectionStateChange, offValueChange, closeBluetooth
} from '@/utils/bluetooth'
import { updateBattery, updateConnection, bindDevice } from '@/api/device'

// ── 初始化 ───────────────────────────────────
const deviceStore    = useDeviceStore()
const userStore      = useUserStore()
const statusH        = ref(20)
const device         = ref({})
let   serverDeviceId = null   // 服务端 device_id，用于上报电量/连接状态
let   pendingBleId   = ''     // 来自配对页的 bleDeviceId（直连模式）

onLoad((options) => {
  statusH.value = uni.getSystemInfoSync().statusBarHeight || 20

  let found = DEVICE_LIST.find(d => d.id === options.deviceId)
  if (!found && options.deviceName) {
    const name = decodeURIComponent(options.deviceName)
    found = { name, shortName: name, image: '' }
  }
  device.value  = found || { name: '智能设备', shortName: '智能设备', image: '' }
  const title = device.value.shortName || device.value.name
	// 调用 UniApp API 更新原生导航栏
	uni.setNavigationBarTitle({
	  title: '智能脉冲刺激仪'
	})
	
  serverDeviceId = deviceStore.getServerDeviceId(options.deviceId)
  
  if (options.bleDeviceId) {
    // 来自配对页：已知 BLE 设备 ID，直接连接，无需扫描
    pendingBleId = decodeURIComponent(options.bleDeviceId)
    directConnect(pendingBleId, options.deviceName)
  } else {
    startConnect()
  }
})

onUnload(() => {
  clearTimeout(scanTimer)
  offDeviceFound()
  offConnectionStateChange()
  offValueChange()
  stopScan().catch(() => {})
  if (connectedDeviceId.value) disconnectDevice(connectedDeviceId.value)
})

// ── 调试面板 ─────────────────────────────────
const showDebug = ref(false)   // 双击设备图片可显示/隐藏
let _lastImgTap = 0
function onDeviceImgTap() {
  const now = Date.now()
  if (now - _lastImgTap < 300) {
    showDebug.value = !showDebug.value
    _lastImgTap = 0
  } else {
    _lastImgTap = now
  }
}
const debugLogs = ref([])
const contactStatus = ref('未知')

function addLog(dir, text) {
  const now = new Date()
  const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`
  debugLogs.value.unshift({ dir, text, time })
  if (debugLogs.value.length > 10) debugLogs.value.pop()
}

// ── 蓝牙连接 ─────────────────────────────────
const bleStatus = ref('disconnected')
const connectedDeviceId = ref('')
const connectedDeviceName = ref('')
const battery = ref('--')
const isConnected = computed(() => bleStatus.value === 'connected')
const isLowBattery = computed(() => isConnected.value && battery.value !== '--' && battery.value < 20)
const bleStatusText = computed(() => ({
  disconnected: '未连接', scanning: '搜索中...', connecting: '连接中...', connected: '已连接'
})[bleStatus.value] || '未连接')

let scanTimer = null

async function startConnect() {
  if (bleStatus.value === 'scanning' || bleStatus.value === 'connecting') return
  connectedDeviceId.value = ''
  connectedDeviceName.value = ''
  battery.value = '--'
  addLog('recv', '开始初始化蓝牙...')
  try {
    await initBluetooth()
    addLog('recv', '蓝牙适配器初始化成功')
  } catch (e) {
    addLog('recv', '蓝牙初始化失败：' + (e.errMsg || e.message || '请检查蓝牙是否开启'))
    uni.showToast({ title: '请先开启手机蓝牙', icon: 'none' })
    return
  }

  bleStatus.value = 'scanning'
  addLog('recv', '开始扫描设备...')

  // 先尝试用 Service UUID 过滤扫描
  const scanOk = await startScan([EMS_SERVICE_UUID]).catch(() => null)
  console.log('scanOk', scanOk)
  if (!scanOk) {
    // 降级：不过滤，扫描所有设备
    await startScan([]).catch(e => {
      addLog('recv', '扫描启动失败：' + e.errMsg)
      bleStatus.value = 'disconnected'
    })
  }

  onDeviceFound(async (dev) => {
    const name = (dev.name || dev.localName || '').toUpperCase()
    addLog('recv', `发现设备：${dev.name || '未知'} (${dev.deviceId})`)
    if (!name.startsWith('D23_') && !name.includes('EMS') && !name.includes('HM')) return
    clearTimeout(scanTimer)
    await stopScan().catch(() => {})
    bleStatus.value = 'connecting'
    connectedDeviceName.value = dev.name || dev.localName || dev.deviceId
    addLog('recv', `正在连接：${connectedDeviceName.value}`)
    try {
      await connectDevice(dev.deviceId)
      connectedDeviceId.value = dev.deviceId
      bleStatus.value = 'connected'
      addLog('recv', `✅ 连接成功！DeviceId: ${dev.deviceId}`)
      uni.showToast({ title: '设备已连接', icon: 'success' })
      // 上报连接状态到服务端
      if (serverDeviceId) updateConnection(serverDeviceId, 1).catch(() => {})
      // 连接成功后稍等500ms再订阅，确保BLE稳定
      setTimeout(() => setupNotify(dev.deviceId), 500)
    } catch (e) {
      bleStatus.value = 'disconnected'
      addLog('recv', '❌ 连接失败：' + (e.errMsg || e.message))
      uni.showToast({ title: '连接失败，请重试', icon: 'none' })
    }
  })

  scanTimer = setTimeout(async () => {
    if (bleStatus.value === 'scanning') {
      await stopScan().catch(() => {})
      bleStatus.value = 'disconnected'
      addLog('recv', '⏱ 扫描超时，未找到设备')
      uni.showToast({ title: '未找到设备，请确认已开机', icon: 'none', duration: 2500 })
    }
  }, 20000)
}

// ── 直连（来自配对页，已知 bleDeviceId，无需扫描）────
async function directConnect(bleDeviceId, encodedDeviceName) {
  bleStatus.value = 'connecting'
  connectedDeviceName.value = bleDeviceId
  addLog('recv', `直接连接设备: ${bleDeviceId}`)
  try {
    await initBluetooth()
    // 等待系统层面完全释放旧连接（BLE 协议断开需要约 800ms）
    await new Promise(r => setTimeout(r, 800))
    await connectDevice(bleDeviceId)
    connectedDeviceId.value = bleDeviceId
    bleStatus.value = 'connected'
    addLog('recv', `✅ 连接成功！DeviceId: ${bleDeviceId}`)
    uni.showToast({ title: '设备已连接', icon: 'success' })

    // 登录状态下，检查设备是否已绑定，未绑定才请求接口
    if (userStore.isMember) {
      const alreadyBound = deviceStore.devices.some(d => d.id === bleDeviceId)
      if (alreadyBound) {
        addLog('recv', '设备已在绑定列表中，跳过绑定接口')
        serverDeviceId = deviceStore.getServerDeviceId(bleDeviceId)
      } else {
        try {
          const devName = encodedDeviceName
            ? decodeURIComponent(encodedDeviceName)
            : device.value.name
          const res = await bindDevice({ serial_number: bleDeviceId, device_name: devName, category_id: 1 })
          serverDeviceId = res.device_id
          deviceStore.addDevice({ ...device.value, bleDeviceId, id: bleDeviceId }, serverDeviceId)
          addLog('recv', `设备绑定成功，server device_id: ${serverDeviceId}`)
        } catch (e) {
          console.warn('[control] 服务端绑定失败:', e.message)
          uni.showToast({ title: `服务端绑定失败: ${e.message}`, icon: 'none' })
        }
      }
    } else {
      uni.showToast({ title: `非会员，请重新登录`, icon: 'none' })
    }

    if (serverDeviceId) updateConnection(serverDeviceId, 1).catch(() => {})
    setTimeout(() => setupNotify(bleDeviceId), 500)
  } catch (e) {
    bleStatus.value = 'disconnected'
    addLog('recv', '❌ 连接失败：' + (e.errMsg || e.message))
    uni.showToast({ title: '连接失败，请重试', icon: 'none' })
  }
}

// ArrayBuffer转16进度字符串示例
function ab2hex(buffer) {
  const hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join('')
}

async function setupNotify(deviceId) {
  try {
	console.log('setupNotify通知订阅', `deviceId:${deviceId}`, `EMS_SERVICE_UUID:${EMS_SERVICE_UUID}`, `EMS_CHAR_UUID:${EMS_CHAR_UUID}`)
    await notifyCharacteristic(deviceId, EMS_SERVICE_UUID, EMS_CHAR_UUID, true)
    addLog('recv', '通知订阅成功，等待设备上报...')
    onValueChange(res => {
	  console.log(`characteristic ${res.characteristicId} has changed, now is ${res.value}`)
	  console.log(ab2hex(res.value))
      // 大小写不敏感比较，避免 Android/iOS 格式差异导致过滤
      if (res.deviceId.toLowerCase() !== deviceId.toLowerCase()) return
      // 记录所有原始字节
      const view = new DataView(res.value)
      const bytes = []
      for (let i = 0; i < view.byteLength; i++) {
        bytes.push('0x' + view.getUint8(i).toString(16).toUpperCase().padStart(2, '0'))
      }
      addLog('recv', `原始数据(${view.byteLength}字节)：[${bytes.join(' ')}]`)
      // 使用支持粘包/分包的解析函数，返回本次解析出的所有完整帧
      const frames = processEmsData(res.value)
      if (frames.length === 0) {
        addLog('recv', '等待更多数据（分包缓冲中...）')
      } else {
        frames.forEach(frame => handleReport(frame.cmd, frame.data))
      }
    })
    // 订阅成功后800ms发送刷新请求
    // setTimeout(() => refreshStatus(), 800)
  } catch (e) {
    addLog('recv', '❌ 订阅失败：' + (e.errMsg || e.message || JSON.stringify(e)))
  }
}

// 刷新设备状态：发送停止指令，设备会响应并上报当前状态
async function refreshStatus() {
  if (!isConnected.value) return
  try {
    await sendEmsCmd(connectedDeviceId.value, EMS_CMD.RUN, 0)
    addLog('send', '发送状态刷新请求 [0x31 0x0A 0x00]')
  } catch (e) {
    addLog('send', '刷新失败：' + (e.errMsg || e.message))
  }
}

function handleReport(cmd, data) {
  const names = {
    [EMS_REPORT.GEAR]:      '档位',
    [EMS_REPORT.BATTERY]:   '电量',
    [EMS_REPORT.CONTACT]:   '接触状态',
    [EMS_REPORT.STIFFNESS]: '僵硬缓解',
  }
  addLog('recv', `上报 cmd=0x${cmd.toString(16).toUpperCase()} (${names[cmd] || '未知'}) data=${data}`)
  switch (cmd) {
    case EMS_REPORT.GEAR:
      if (data >= 1) {
        intensity.value = data
        isRunning.value = true
      } else {
        // 0档：停止运行，档位重置为1
        intensity.value = 1
        isRunning.value = false
      }
      break
    case EMS_REPORT.BATTERY:
      // 电量 0~100%
      battery.value = data
      if (data < 20) uni.showToast({ title: `低电量：${data}%，请及时充电`, icon: 'none', duration: 3000 })
      if (serverDeviceId) updateBattery(serverDeviceId, data).catch(() => {})
      break
    case EMS_REPORT.CONTACT:
      // 0=电极脱落  1=电极接触正常
      contactStatus.value = data === 1 ? '正常' : '脱落'
      break
    case EMS_REPORT.STIFFNESS: {
      // 僵硬缓解值 0~64，治疗结束时上报，换算为百分比
      const pct = Math.min(99, Math.round(data / 64 * 100))
      addLog('recv', `治疗结束，僵硬缓解值：${data}/64（${pct}%）`)
      isRunning.value = false
      uni.showModal({
        title: '治疗完成',
        content: `您的肌肉僵硬程度缓解：${pct}%`,
        showCancel: false,
        confirmText: '好的'
      })
      break
    }
  }
}

onConnectionStateChange(res => {
  if (res.deviceId.toLowerCase() !== connectedDeviceId.value.toLowerCase()) return
  if (!res.connected) {
    bleStatus.value = 'disconnected'
    connectedDeviceId.value = ''
    battery.value = '--'
    stopTimer()
    resetEmsBuffer()
    if (serverDeviceId) updateConnection(serverDeviceId, 0).catch(() => {})
    addLog('recv', '设备连接已断开')
    uni.showToast({ title: '设备已断开连接', icon: 'none' })
  }
})

async function doDisconnect() {
  if (!connectedDeviceId.value) return
  await disconnectDevice(connectedDeviceId.value).catch(() => {})
  bleStatus.value = 'disconnected'
  connectedDeviceId.value = ''
  battery.value = '--'
  stopTimer()
  resetEmsBuffer()
  offConnectionStateChange()
  offValueChange()
  closeBluetooth()
  if (serverDeviceId) updateConnection(serverDeviceId, 0).catch(() => {})
  addLog('send', '主动断开连接')
  uni.showToast({ title: '已断开设备连接', icon: 'none' })
}

// ── 按摩模式 ─────────────────────────────────
const modes = [
  { id: 'relax', name: '日常放松', icon: '✦' },
  { id: 'drain', name: '运动修复', icon: '❋' },
  // { id: 'slim',  name: '美腿护理', icon: '⫶' },
  // { id: 'deep',  name: '深度按摩', icon: '◎' }
]
const currentMode = ref(modes[0])

// ── 倒计时 ───────────────────────────────────
const selectedMinutes = ref(20)
const timerDisplay = computed(() => `${selectedMinutes.value} 分钟`)

// ── 开始/停止 ────────────────────────────────
const isRunning = ref(false)
let timer = null
async function toggleRun() {
  if (!isConnected.value) { uni.showToast({ title: '请先连接设备', icon: 'none' }); return }
  const next = !isRunning.value
  try {
    if (next) {
      // 开始：依次发送模式、时间、档位、运行指令
      const modeIndex = modes.findIndex(m => m.id === currentMode.value.id) + 1
      addLog('send', `发送按摩模式 [0x31 0x0C 0x0${modeIndex}] → ${currentMode.value.name}`)
      await sendEmsCmd(connectedDeviceId.value, EMS_CMD.MODE, modeIndex)

      addLog('send', `发送按摩时间 [0x31 0x0D ${selectedMinutes.value}] → ${selectedMinutes.value}分钟`)
      await sendEmsCmd(connectedDeviceId.value, EMS_CMD.TIME, selectedMinutes.value)

      addLog('send', `发送档位设置 [0x31 0x0B 0x0${intensity.value}] → ${intensity.value}档`)
      await sendEmsCmd(connectedDeviceId.value, EMS_CMD.GEAR, intensity.value)

      addLog('send', '发送运行控制 [0x31 0x0A 0x01] → 开始')
      await sendEmsCmd(connectedDeviceId.value, EMS_CMD.RUN, 1)
    } else {
      addLog('send', '发送运行控制 [0x31 0x0A 0x00] → 停止')
      await sendEmsCmd(connectedDeviceId.value, EMS_CMD.RUN, 0)
    }
  } catch (e) {
    addLog('send', '❌ 指令发送失败：' + (e.errMsg || e.message))
    uni.showToast({ title: '指令发送失败', icon: 'none' }); return
  }
  isRunning.value = next
  if (next) {
    uni.showToast({ title: '已根据您当前肌肉情况，为您自动调节最佳放松模式', icon: 'none', duration: 3000 })
  }
}
function stopTimer() {
  isRunning.value = false
}

// ── 力度 ─────────────────────────────────────
const intensity = ref(1)
async function changeIntensity(delta) {
  const next = intensity.value + delta
  if (next < 1 || next > 8) return
  await applyIntensity(next)
}
async function setIntensity(n) { await applyIntensity(n) }
async function applyIntensity(n) {
  intensity.value = n
  if (!isConnected.value || !isRunning.value) return
  addLog('send', `发送档位设置 [0x31 0x0B 0x0${n}] → ${n}档`)
  try {
    await sendEmsCmd(connectedDeviceId.value, EMS_CMD.GEAR, n)
  } catch (e) {
    addLog('send', '❌ 档位设置失败：' + (e.errMsg || e.message))
    uni.showToast({ title: '档位设置失败', icon: 'none' })
  }
}

// ── 底部弹窗 ─────────────────────────────────
const showSheet = ref(false)
const sheetTab = ref('mode')
function openSheet(tab) { sheetTab.value = tab; showSheet.value = true }
function closeSheet() {
  showSheet.value = false
  if (isRunning.value) stopTimer()
}
function selectMode(m) { currentMode.value = m }
function onSliderChange(e) { selectedMinutes.value = e.detail.value }

function reconnect() {
  if (pendingBleId) {
    directConnect(pendingBleId)
  } else {
    startConnect()
  }
}

function goBack() {
  clearTimeout(scanTimer)
  clearInterval(timer)
  offDeviceFound()
  offConnectionStateChange()
  offValueChange()
  stopScan().catch(() => {})
  if (connectedDeviceId.value) disconnectDevice(connectedDeviceId.value)
  uni.navigateBack()
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f4f4f4; display: flex; flex-direction: column; }
.navbar { background: #f4f4f4; }
.nav-row { height: 88rpx; display: flex; align-items: center; padding: 0 24rpx; }
.nav-back { width: 64rpx; height: 64rpx; display: flex; align-items: center; justify-content: center; }
.nav-title { flex: 1; text-align: center; font-size: 32rpx; font-weight: 600; color: #fff; }

/* 状态栏 */
.status-bar { display: flex; align-items: center; justify-content: space-between; padding: 32rpx; }
.btn-row { display: flex; align-items: center; gap: 16rpx; }
.btn-start { display: flex; align-items: center; gap: 10rpx; border: 3rpx solid #bbb; border-radius: 40rpx; padding: 14rpx 28rpx;}
.btn-start.running { border-color: black;}
.btn-start.disabled { opacity: 0.5; }
.btn-start-text { font-size: 28rpx; font-weight: 500; }
.btn-disconnect { display: flex; align-items: center; gap: 8rpx; background: rgba(255,255,255,0.9); border-radius: 32rpx; padding: 12rpx 20rpx; }
.btn-disconnect-text { font-size: 24rpx; color: #F9A8A8; }
.right-status { display: flex; align-items: center; gap: 10rpx; }
.ble-dot { width: 16rpx; height: 16rpx; border-radius: 50%; background: #bbb; transition: background 0.3s; }
.ble-dot.scanning, .ble-dot.connecting { background: #FFD700; animation: blink 1s infinite; }
.ble-dot.connected { background: #4CAF50; }
.ble-dot.disconnected { background: #bbb; }
.ble-dot.battery-ok { background: #4CAF50; }
.ble-dot.low-battery { background: #FF4444; animation: blink 0.8s infinite; }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
.battery-text { font-size: 24rpx; color: #bbb; }
.battery-text.low { color: #FF6B6B; }

/* 设备区 */
.device-area { position: relative; flex: 1; display: flex; flex-direction: column; align-items: center; padding: 10rpx 24rpx 16rpx; }
.device-img { width: 600rpx; height: auto; margin-top: 200rpx;margin-bottom: 200rpx;}
.scan-ring { position: absolute; top: 10rpx; width: 300rpx; height: 300rpx; border-radius: 50%; border: 4rpx solid rgba(255,255,255,0.4); animation: scan-pulse 1.5s ease-out infinite; }
@keyframes scan-pulse { 0%{transform:scale(0.9);opacity:0.8} 100%{transform:scale(1.3);opacity:0} }

/* 调试面板 */
.debug-panel { width: 100%; background: rgba(0,0,0,0.55); border-radius: 16rpx; margin-top: 12rpx; overflow: hidden; }
.debug-header { display: flex; justify-content: space-between; align-items: center; padding: 16rpx 24rpx; }
.debug-title { font-size: 24rpx; color: #aef; font-weight: bold; }
.debug-arrow { font-size: 20rpx; color: #aef; }
.debug-body { padding: 0 24rpx 20rpx; }
.debug-row { display: flex; justify-content: space-between; align-items: center; padding: 8rpx 0; border-bottom: 1rpx solid rgba(255,255,255,0.08); }
.debug-key { font-size: 22rpx; color: #aaa; }
.debug-val { font-size: 22rpx; color: #eee; word-break: break-all; max-width: 65%; text-align: right; }
.debug-val.s-connected { color: #4CAF50; }
.debug-val.s-scanning, .debug-val.s-connecting { color: #FFD700; }
.debug-val.s-disconnected { color: #bbb; }
.debug-divider { height: 1rpx; background: rgba(255,255,255,0.15); margin: 16rpx 0 8rpx; }
.debug-log-title { font-size: 22rpx; color: #aaa; display: block; margin-bottom: 8rpx; }
.debug-log-row { display: flex; align-items: flex-start; gap: 8rpx; padding: 6rpx 0; border-bottom: 1rpx solid rgba(255,255,255,0.05); }
.log-dir { font-size: 20rpx; font-weight: bold; flex-shrink: 0; }
.log-dir.send { color: #7CF; }
.log-dir.recv { color: #AFA; }
.log-content { font-size: 20rpx; color: #ddd; flex: 1; word-break: break-all; }
.log-time { font-size: 18rpx; color: #888; flex-shrink: 0; }
.debug-empty { font-size: 22rpx; color: #666; padding: 12rpx 0; }
.debug-actions { display: flex; gap: 16rpx; margin-top: 16rpx; }
.debug-btn { flex: 1; background: rgba(255,255,255,0.15); border-radius: 8rpx; padding: 12rpx; text-align: center; font-size: 22rpx; color: #cef; }

/* 控制面板 */
.panel { background: #f4f4f4; padding: 0 32rpx 60rpx; }
.cards-row { display: flex; gap: 20rpx; margin-bottom: 20rpx; }
.ctrl-card { flex: 1; background: #fff; border-radius: 20rpx; padding: 24rpx; box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.06); }
.card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16rpx; }
.mode-icon { width: 56rpx; height: 56rpx; border-radius: 50%; background: #fce8e8; display: flex; align-items: center; justify-content: center; }
.mode-icon-text { font-size: 28rpx; color: #F9A8A8; }
.timer-badge { background: #fce8e8; border-radius: 12rpx; padding: 8rpx 16rpx; }
.timer-text { font-size: 28rpx; color: #F9A8A8; font-weight: bold; }
.card-more { width: 44rpx; height: 44rpx; border-radius: 50%; background: #fce8e8; display: flex; align-items: center; justify-content: center; }
.more-dot { font-size: 18rpx; color: #F9A8A8; font-weight: bold; }
.card-main { display: block; font-size: 30rpx; font-weight: bold; color: #333; margin-bottom: 4rpx; }
.card-sub { font-size: 24rpx; color: #999; }

.intensity-card { background: #fff; border-radius: 20rpx; padding: 28rpx 24rpx; box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.06); margin-bottom: 70rpx; margin-top: 60rpx;}
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
.intensity-btn { width: 60rpx; height: 60rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.intensity-img { width: 60rpx; height: 60rpx;}
.minus, .plus { background: #F9A8A8; }
.intensity-btn-text { font-size: 40rpx; color: #fff; line-height: 1; font-weight: bold; }

.reconnect-btn { display: flex; align-items: center; justify-content: center; gap: 12rpx; padding: 24rpx; border-radius: 16rpx; background: #0065f4; }
.reconnect-text { font-size: 28rpx; color: white;}

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
.arrow_right{width: 20rpx; height: auto; margin-top: 8rpx; }
</style>
