import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getStorage, setStorage } from '@/utils/storage'

export const useDeviceStore = defineStore('device', () => {
  const devices           = ref(getStorage('deviceList')        || [])
  const connectedDeviceId = ref(null)
  const bluetoothState    = ref('disconnected') // disconnected | scanning | connecting | connected

  // BLE 设备名/序列号 → 服务端 device_id 的映射，用于上报电量/连接状态
  // 格式：{ [serial_number]: serverDeviceId }
  const _serverIdMap = ref(getStorage('serverDeviceIdMap') || {})

  /**
   * 添加设备（BLE 配对成功后调用）
   * @param {object} device         constants/devices.js 中的设备对象
   * @param {number} serverDeviceId 服务端绑定返回的 device_id（可选，未登录时为 null）
   */
  function addDevice(device, serverDeviceId = null) {
    const exists = devices.value.find(d => d.id === device.id)
    if (!exists) {
      devices.value.push({ ...device, addedAt: Date.now() })
      setStorage('deviceList', devices.value)
    }
    if (serverDeviceId) {
      _serverIdMap.value[device.id] = serverDeviceId
      setStorage('serverDeviceIdMap', _serverIdMap.value)
    }
  }

  /**
   * 用服务端设备列表覆盖本地设备列表（首页登录后同步）
   * @param {Array} list  /api/device 返回的 data.list
   */
  function setDevices(list) {
    devices.value = list.map(item => ({
      id:               item.serial_number || String(item.id),
      name:             item.device_name,
      shortName:        item.device_name,
      image:            '/static/logo.png',
      battery:          item.battery,
      connectionStatus: item.connection_status,
      serverId:         item.id,
    }))
    setStorage('deviceList', devices.value)

    // 重建 serial_number → server id 映射
    const map = {}
    list.forEach(item => {
      const key = item.serial_number || String(item.id)
      map[key] = item.id
    })
    _serverIdMap.value = map
    setStorage('serverDeviceIdMap', map)
  }

  function removeDevice(deviceId) {
    devices.value = devices.value.filter(d => d.id !== deviceId)
    setStorage('deviceList', devices.value)
    delete _serverIdMap.value[deviceId]
    setStorage('serverDeviceIdMap', _serverIdMap.value)
  }

  /**
   * 根据本地 device.id 查询服务端 device_id
   * @param {string} localDeviceId  constants/devices.js 中的 id 字段
   * @returns {number|null}
   */
  function getServerDeviceId(localDeviceId) {
    return _serverIdMap.value[localDeviceId] || null
  }

  function setConnected(deviceId) {
    connectedDeviceId.value = deviceId
    bluetoothState.value    = 'connected'
  }

  function setDisconnected() {
    connectedDeviceId.value = null
    bluetoothState.value    = 'disconnected'
  }

  function setBluetoothState(state) {
    bluetoothState.value = state
  }

  return {
    devices, connectedDeviceId, bluetoothState,
    setDevices, addDevice, removeDevice, getServerDeviceId,
    setConnected, setDisconnected, setBluetoothState
  }
})
