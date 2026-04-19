/**
 * 设备相关 API
 */
import { http } from './index'

/**
 * 获取设备分类列表
 */
export function getDeviceCategoryList() {
  return http.get('/api/DeviceCategory/getList')
}

/**
 * 获取当前用户绑定的设备列表
 */
export function getDeviceList() {
  return http.get('/api/device', { category_id: 1 })
}

/**
 * 获取单个设备详情
 * @param {number} deviceId  服务端设备 ID
 */
export function getDeviceInfo(deviceId) {
  return http.post('/api/device/detail', { device_id: deviceId })
}

/**
 * 绑定设备
 * @param {{ serial_number: string, device_name: string }} data
 * @returns {{ device_id, serial_number, device_name }}
 */
export function bindDevice(data) {
  return http.post('/api/device/bind', data)
}

/**
 * 解绑设备
 * @param {number} deviceId  服务端设备 ID
 */
export function unbindDevice(deviceId) {
  return http.post('/api/device/unbind', { device_id: deviceId })
}

/**
 * 上报设备电量
 * @param {number} deviceId  服务端设备 ID
 * @param {number} battery   电量百分比 0~100
 */
export function updateBattery(deviceId, battery) {
  return http.post('/api/device/updateBattery', { device_id: deviceId, battery })
}

/**
 * 上报设备连接状态
 * @param {number} deviceId  服务端设备 ID
 * @param {number} status    1=已连接  0=已断开
 */
export function updateConnection(deviceId, status) {
  return http.post('/api/device/updateConnection', { device_id: deviceId, connection_status: status })
}

/**
 * 同步设备运动/健康数据
 * @param {number} deviceId  服务端设备 ID
 * @param {{ heart_rate?, steps?, sleep_time?, calories? }} data
 */
export function syncData(deviceId, data) {
  return http.post('/api/device/syncData', { device_id: deviceId, data })
}
