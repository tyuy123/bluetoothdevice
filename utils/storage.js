// 本地存储工具
export function getStorage(key) {
  try {
    return uni.getStorageSync(key)
  } catch (e) {
    return null
  }
}

export function setStorage(key, value) {
  try {
    uni.setStorageSync(key, value)
  } catch (e) {}
}

export function removeStorage(key) {
  try {
    uni.removeStorageSync(key)
  } catch (e) {}
}
