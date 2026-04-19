/**
 * API 基础配置
 * 切换环境：将 ENV 改为 'prod' 即可切换到生产地址
 */
const ENV = 'prod'
const BASE_URL_MAP = {
  dev:  'http://localhost:8000',
  prod: 'https://fxr.furunmed.com', // TODO: 上线前替换为真实生产地址
}
const BASE_URL = BASE_URL_MAP[ENV]

import { getStorage, setStorage } from '@/utils/storage'

function request(options) {
  const method = options.method || 'GET'
  const url    = BASE_URL + options.url
  const data   = options.data || {}

  console.log(`[API] ${method} ${url}`, data)

  return new Promise((resolve, reject) => {
    uni.request({
      url,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getStorage('memberToken') || ''}`,
        ...options.header
      },
      success(res) {
        console.log(`[API] ${getStorage('memberToken') || ''}  ${method} ${options.url} → ${res.statusCode}`, res.data)

        // HTTP 401：token 失效，清除登录状态并跳转首页
        if (res.statusCode === 401) {
          setStorage('memberToken', '')
          setStorage('isMember', false)
          uni.reLaunch({ url: '/pages/home/index' })
          return reject(new Error('登录已过期，请重新授权'))
        }
        // 正常响应：解析业务状态码 { code, msg/message, data }
        const body = res.data
        // 业务 404 + 用户不存在：清空登录状态并跳转首页
        if (body && body.code === 404 && body.message === '用户不存在') {
          setStorage('memberToken', '')
          setStorage('isMember', false)
          uni.reLaunch({ url: '/pages/home/index' })
          return reject(new Error('用户不存在'))
        }
        if (body && body.code === 200) {
          resolve(body.data)
        } else {
          console.warn(`[API] ${method} ${options.url} 业务错误:`, body)
          reject(new Error((body && (body.message || body.msg)) || `请求失败(${res.statusCode})`))
        }
      },
      fail(err) {
        console.error(`[API] ${method} ${options.url} 网络失败:`, err)
        reject(new Error(err.errMsg || '网络请求失败，请检查网络连接'))
      }
    })
  })
}

export const http = {
  get:  (url, data)   => request({ url, method: 'GET',    data }),
  post: (url, data)   => request({ url, method: 'POST',   data }),
  put:  (url, data)   => request({ url, method: 'PUT',    data }),
  del:  (url, data)   => request({ url, method: 'DELETE', data }),
}
