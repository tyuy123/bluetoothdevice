import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getStorage, setStorage } from '@/utils/storage'
import { apiLogout } from '@/api/user'

export const useUserStore = defineStore('user', () => {
  const isMember     = ref(getStorage('isMember')         || false)
  const token        = ref(getStorage('memberToken')      || '')
  const refreshToken = ref(getStorage('memberRefreshToken') || '')
  const userId       = ref(getStorage('userId')           || 0)
  const nickname     = ref(getStorage('userNickname')     || '用户')
  const avatar       = ref(getStorage('userAvatar')       || '/static/logo.png')
  const phone        = ref(getStorage('userPhone')        || '')
  const email        = ref(getStorage('userEmail')        || '')
  const gender       = ref(getStorage('userGender')       ?? 0)
  const score        = ref(getStorage('userScore')        || 0)

  /**
   * 登录成功后调用，接收 API 响应中的 member 对象和 token
   * @param {object} member  { id, phone, nickname, avatar, gender, email, ... }
   * @param {string} tkn     JWT token
   */
  function login(member, tkn, rtkn) {
    isMember.value      = true
    token.value         = tkn             || ''
    refreshToken.value  = rtkn            || ''
    userId.value        = member.id       || 0
    phone.value         = member.phone    || ''
    nickname.value      = member.nickname || nickname.value
    avatar.value        = member.avatar   || avatar.value
    email.value         = member.email    || ''
    gender.value        = member.gender   ?? gender.value

    setStorage('isMember',            true)
    setStorage('memberToken',         token.value)
    setStorage('memberRefreshToken',  refreshToken.value)
    setStorage('userId',              userId.value)
    setStorage('userPhone',           phone.value)
    setStorage('userNickname',        nickname.value)
    setStorage('userAvatar',          avatar.value)
    setStorage('userEmail',           email.value)
    setStorage('userGender',          gender.value)
  }

  async function logout() {
    await apiLogout().catch(() => {})
    isMember.value     = false
    token.value        = ''
    refreshToken.value = ''
    userId.value       = 0
    setStorage('isMember',           false)
    setStorage('memberToken',        '')
    setStorage('memberRefreshToken', '')
    setStorage('userId',             0)
  }

  function updateProfile(data) {
    if (data.nickname !== undefined) { nickname.value = data.nickname; setStorage('userNickname', data.nickname) }
    if (data.avatar   !== undefined) { avatar.value   = data.avatar;   setStorage('userAvatar',   data.avatar)   }
    if (data.phone    !== undefined) { phone.value    = data.phone;    setStorage('userPhone',    data.phone)    }
    if (data.email    !== undefined) { email.value    = data.email;    setStorage('userEmail',    data.email)    }
    if (data.gender   !== undefined) { gender.value   = data.gender;   setStorage('userGender',  data.gender)   }
  }

  function addScore(val) {
    score.value += val
    setStorage('userScore', score.value)
  }

  function updateToken(tkn, rtkn) {
    token.value        = tkn  || token.value
    refreshToken.value = rtkn || refreshToken.value
    setStorage('memberToken',        token.value)
    setStorage('memberRefreshToken', refreshToken.value)
  }

  return { isMember, token, refreshToken, userId, nickname, avatar, phone, email, gender, score, login, logout, updateProfile, updateToken, addScore }
})
