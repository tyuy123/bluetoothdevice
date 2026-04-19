/**
 * 蓝牙BLE工具类
 */

// ─────────────────────────────────────────────
// EMS脚部按摩器 BLE UUID（HM-10系列模块）
// ─────────────────────────────────────────────
export const EMS_SERVICE_UUID = '0000FFE0-0000-1000-8000-00805F9B34FB'
export const EMS_CHAR_UUID = '0000FFE1-0000-1000-8000-00805F9B34FB' // 读/写/通知 共用

// 3字节帧协议常量
// 手机→设备 帧头 0x31
export const EMS_CMD = {
	RUN: 0x0A, // 运行控制  data: 1=开始 0=停止
	GEAR: 0x0B, // 设置档位  data: 1~8
	MODE: 0x0C, // 设置模式（预留）
	TIME: 0x0D, // 时间调整（预留）
}
// 设备→手机 帧头 0x51
export const EMS_REPORT = {
	GEAR: 0x0B, // 档位上报    data: 1~8（连接时主动上报，档位变化时上报）
	BATTERY: 0x0C, // 电量上报    data: 0~100（连接时主动上报，变化时上报）
	CONTACT: 0x28, // 接触状态    data: 0=电极脱落 1=电极接触正常（连接时主动上报，变化时上报）
	STIFFNESS: 0x09, // 僵硬缓解值  data: 0~100（治疗结束时上报，值越大缓解效果越好）
}

/**
 * 向EMS设备发送3字节控制帧
 * @param {string} deviceId  BLE设备ID
 * @param {number} cmd       命令码（EMS_CMD.*）
 * @param {number} data      数据字节
 */
export function sendEmsCmd(deviceId, cmd, data) {
	const buffer = new ArrayBuffer(3)
	const view = new DataView(buffer)
	view.setUint8(0, 0x31) // 帧头：手机→设备
	view.setUint8(1, cmd)
	view.setUint8(2, data)
	// HM-10 / JDY 系列模块必须用 writeNoResponse，普通 write 无响应
	return new Promise((resolve, reject) => {
		uni.writeBLECharacteristicValue({
			deviceId,
			serviceId: EMS_SERVICE_UUID,
			characteristicId: EMS_CHAR_UUID,
			value: buffer,
			writeType: 'writeNoResponse',
			success(res) {
				console.log('writeBLECharacteristicValue success', res.errMsg)
				resolve(res)
			},
			fail: (err) => {
				// 降级：部分旧版SDK不支持writeType参数，回退到普通write
				uni.writeBLECharacteristicValue({
					deviceId,
					serviceId: EMS_SERVICE_UUID,
					characteristicId: EMS_CHAR_UUID,
					value: buffer,
					success: resolve,
					fail: reject
				})
			}
		})
	})
}

/**
 * 模块级字节缓冲区 —— 用于拼接跨 notification 的分包
 * 调用 resetEmsBuffer() 可在断开连接时清空
 */
let _emsBuf = new Uint8Array(0)

export function resetEmsBuffer() {
	_emsBuf = new Uint8Array(0)
}

/**
 * 处理设备上报数据，支持：
 *   1. 粘包（一次 notification 含多个3字节帧）
 *   2. 分包（一帧被拆成多次 notification）
 *
 * @param {ArrayBuffer} buffer  BLE notification 原始数据
 * @returns {{ cmd: number, data: number }[]}  本次解析出的完整帧列表（可能为空）
 */
export function processEmsData(buffer) {
	// 追加到缓冲区
	const incoming = new Uint8Array(buffer)
	const merged = new Uint8Array(_emsBuf.length + incoming.length)
	merged.set(_emsBuf, 0)
	merged.set(incoming, _emsBuf.length)
	_emsBuf = merged

	const frames = []

	while (_emsBuf.length >= 3) {
		// 在缓冲区中找下一个有效帧头 0x51
		let start = -1
		for (let i = 0; i < _emsBuf.length; i++) {
			if (_emsBuf[i] === 0x51) {
				start = i;
				break
			}
		}

		if (start === -1) {
			// 没有找到帧头，全部丢弃
			_emsBuf = new Uint8Array(0)
			break
		}

		if (start > 0) {
			// 帧头前的乱数据丢弃
			_emsBuf = _emsBuf.slice(start)
		}

		if (_emsBuf.length < 3) {
			// 帧头找到但数据不足3字节，等待下一次 notification
			break
		}

		// 取出一帧
		frames.push({
			cmd: _emsBuf[1],
			data: _emsBuf[2]
		})
		_emsBuf = _emsBuf.slice(3)
	}

	return frames
}

let bluetoothInited = false

// 初始化蓝牙适配器
export function initBluetooth() {
	return new Promise((resolve, reject) => {
		uni.openBluetoothAdapter({
			success(res) {
				console.log('initBluetooth 初始化蓝牙适配器', res)
				bluetoothInited = true
				resolve(res)
			},
			fail(err) {
				bluetoothInited = false
				reject(err)
			}
		})
	})
}

// 开始扫描设备（可按设备名称或 UUID 过滤）
export function startScan(services = []) {
	return new Promise((resolve, reject) => {
		uni.startBluetoothDevicesDiscovery({
			services,
			allowDuplicatesKey: false,
			success(res) {
				console.log('startScan 开始扫描设备', res)
				resolve(res)
			},
			fail: reject
		})
	})
}

// 停止扫描
export function stopScan() {
	return new Promise((resolve) => {
		uni.stopBluetoothDevicesDiscovery({
			success: resolve,
			fail: resolve
		})
	})
}

// 监听发现设备
export function onDeviceFound(callback) {
	uni.onBluetoothDeviceFound(res => {
		console.log('devices 监听发现设备', res.devices)
		res.devices.forEach(device => callback(device))
	})
}

// 连接设备
export function connectDevice(deviceId) {
	return new Promise((resolve, reject) => {
		uni.createBLEConnection({
			deviceId,
			success(res) {
				console.log('connectDevice连接设备', res)
				resolve(res)
			},
			fail: reject
		})
	})
}

// 断开连接
export function disconnectDevice(deviceId) {
	return new Promise((resolve) => {
		uni.closeBLEConnection({
			deviceId,
			success(res) {
				console.log('connectDevice断开连接', res)
				resolve(res)
			},
			fail: resolve
		})
	})
}

// 获取设备服务
export function getServices(deviceId) {
	return new Promise((resolve, reject) => {
		uni.getBLEDeviceServices({
			deviceId,
			success: res => resolve(res.services),
			fail: reject
		})
	})
}

// 获取特征值
export function getCharacteristics(deviceId, serviceId) {
	return new Promise((resolve, reject) => {
		uni.getBLEDeviceCharacteristics({
			deviceId,
			serviceId,
			success: res => resolve(res.characteristics),
			fail: reject
		})
	})
}

// 向设备写入指令
// TODO: 根据各设备蓝牙协议传入正确的 serviceId、characteristicId 和 value
export function writeCharacteristic(deviceId, serviceId, characteristicId, value) {
	return new Promise((resolve, reject) => {
		uni.writeBLECharacteristicValue({
			deviceId,
			serviceId,
			characteristicId,
			value,
			success: resolve,
			fail: reject
		})
	})
}

// 开启通知（接收设备数据）
export function notifyCharacteristic(deviceId, serviceId, characteristicId, state = true) {
	return new Promise((resolve, reject) => {
		uni.notifyBLECharacteristicValueChange({
			deviceId,
			serviceId,
			characteristicId,
			state,
			success: resolve,
			fail: reject
		})
	})
}

// 监听设备数据变化
export function onValueChange(callback) {
	uni.onBLECharacteristicValueChange(res => callback(res))
}

// 监听连接状态变化
export function onConnectionStateChange(callback) {
	uni.onBLEConnectionStateChange(res => callback(res))
}

// 关闭蓝牙适配器
export function closeBluetooth() {
	uni.closeBluetoothAdapter()
	bluetoothInited = false
}

// 移除所有"发现设备"监听器
export function offDeviceFound() {
	uni.offBluetoothDeviceFound()
}

// 移除所有"连接状态变化"监听器
export function offConnectionStateChange() {
	uni.offBLEConnectionStateChange()
}

// 移除所有"特征值变化"监听器
export function offValueChange() {
	uni.offBLECharacteristicValueChange()
}