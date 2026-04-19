import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const showAuthModal = ref(false)
  const pendingAction = ref(null) // 授权成功后执行的回调

  function requireAuth(callback) {
    pendingAction.value = callback
    showAuthModal.value = true
  }

  function closeModal() {
    showAuthModal.value = false
    pendingAction.value = null
  }

  function onAuthSuccess() {
    showAuthModal.value = false
    if (pendingAction.value) {
      pendingAction.value()
      pendingAction.value = null
    }
  }

  return { showAuthModal, pendingAction, requireAuth, closeModal, onAuthSuccess }
})
