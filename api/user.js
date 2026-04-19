/**
 * 用户相关 API
 */
import { http } from './index'
import { getStorage, setStorage } from '@/utils/storage'

/**
 * 登录（手机号+微信授权自动注册）
 * @param {object} data
 * @param {string} data.code         wx.login() 返回的临时凭证，后端换取 openid
 * @param {string} data.phoneCode    getPhoneNumber 返回的 code，后端解密获取手机号
 * @param {string} [data.encryptedData]  旧版兼容
 * @param {string} [data.iv]             旧版兼容
 * @param {string} data.nickname     微信昵称
 * @param {string} data.avatar       微信头像 URL
 * @param {number} data.gender       性别 0/1/2
 * @returns {{ token, refresh_token, expires_in, member }}
 */
export function login(data) {
  return http.post('/api/member/login', data)
}

/**
 * 刷新 token
 * @param {string} refreshToken  本地存储的 refresh_token
 * @returns {{ token, refresh_token, expires_in }}
 */
export function refreshToken(refreshToken) {
  return http.post('/api/member/refreshToken', { refresh_token: refreshToken })
}

/**
 * 退出登录
 */
export function apiLogout() {
  return http.post('/api/logout')
}

/**
 * 获取当前登录用户信息
 */
export function getProfile() {
  return http.get('/api/member/profile')
}

/**
 * 更新用户个人信息
 * @param {{ nickname?, email?, gender?, avatar?, address?, height?, weight?,
 *           blood_pressure?, blood_sugar?, heart_rate?, body_temperature? }} data
 */
export function updateProfile(data) {
  return http.post('/api/member/updateProfile', data)
}

/**
 * 上传头像
 * @param {string} filePath  uni.chooseImage 返回的临时文件路径
 * @returns {Promise<string>} 服务器返回的头像 URL
 */
export function uploadAvatar(filePath) {
  return new Promise((resolve, reject) => {
    const BASE_URL = 'https://fxr.furunmed.com'
    const url = BASE_URL + '/api/member/uploadAvatar'
    const token = getStorage('memberToken') || ''
    console.log('[uploadAvatar] 开始上传', { url, filePath, token: token ? token.slice(0, 20) + '...' : '(空)' })
    uni.uploadFile({
      url,
      filePath,
      name: 'file',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success(res) {
        console.log('[uploadAvatar] 响应 statusCode:', res.statusCode, 'data:', res.data)
        let body
        try { body = JSON.parse(res.data) } catch { body = res.data }
        if (res.statusCode === 401) {
          setStorage('memberToken', '')
          setStorage('isMember', false)
          uni.reLaunch({ url: '/pages/home/index' })
          return reject(new Error('登录已过期，请重新授权'))
        }
        if (body && body.code === 200) {
          console.log('[uploadAvatar] 上传成功，URL:', body.data.avatar)
          resolve(body.data.avatar)
        } else {
          console.warn('[uploadAvatar] 业务错误:', body)
          reject(new Error((body && (body.message || body.msg)) || '头像上传失败'))
        }
      },
      fail(err) {
        console.error('[uploadAvatar] 请求失败:', err)
        reject(new Error(err.errMsg || '头像上传失败，请检查网络'))
      }
    })
  })
}
