/**
 * 广告相关 API
 */
import { http } from './index'

/**
 * 获取首页 Banner 广告列表
 * @returns {Array<{ id, title, image_url, target_url }>}
 */
export function getAdsBanner() {
  return http.get('/api/ad/getBanner')
}

/**
 * 记录广告点击
 * @param {number} id  广告 ID
 * @returns {{ target_url, click_count }}
 */
export function recordAdClick(id) {
  return http.post('/api/ad/click', { id })
}
