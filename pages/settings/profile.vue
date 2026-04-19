<template>
  <view class="page">
    <view class="form-card">
      <!-- 头像 -->
      <view class="form-item" @tap="chooseAvatar">
        <text class="item-label">头像</text>
        <image :src="form.avatar" class="avatar-thumb" mode="aspectFill" />
      </view>
      <!-- 昵称 -->
      <view class="form-item">
        <text class="item-label">昵称</text>
        <input class="item-input" v-model="form.nickname" placeholder="请输入昵称" maxlength="20" />
      </view>
      <!-- 手机 -->
      <view class="form-item">
        <text class="item-label">手机</text>
        <input class="item-input" v-model="form.phone" placeholder="请输入手机号" maxlength="11" />
      </view>
      <!-- 性别 -->
      <view class="form-item">
        <text class="item-label">性别</text>
        <view class="gender-wrap" @tap="toggleGender">
          <view class="gender-track" :class="{female: form.gender === 1}">
            <view class="gender-thumb"></view>
          </view>
          <uni-icons :type="form.gender === 1 ? 'woman' : 'man'" size="16"
            :color="form.gender === 1 ? '#FF6B9D' : '#4A90E2'" />
        </view>
      </view>
      <!-- 身高 -->
      <view class="form-item">
        <text class="item-label">身高</text>
        <view class="value-row">
          <input class="num-input" type="digit" v-model="form.height" placeholder="0" />
          <text class="unit">cm</text>
        </view>
      </view>
      <!-- 体重 -->
      <view class="form-item">
        <text class="item-label">体重</text>
        <view class="value-row">
          <input class="num-input" type="digit" v-model="form.weight" placeholder="0" />
          <text class="unit">kg</text>
        </view>
      </view>
      <!-- 邮箱 -->
      <view class="form-item" style="border-bottom: none;">
        <text class="item-label">邮箱</text>
        <input class="item-input" v-model="form.email" placeholder="请输入邮箱" />
      </view>
    </view>

    <view class="save-card" @tap="save">
      <text class="save-text">保存</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import { getProfile, updateProfile, uploadAvatar } from '@/api/user'

const userStore = useUserStore()
const form = ref({
  avatar:   userStore.avatar,
  nickname: userStore.nickname,
  phone:    userStore.phone,
  gender:   userStore.gender,
  height:   '',
  weight:   '',
  email:    userStore.email,
  address:  '',
})

onLoad(async () => {
  try {
    const data = await getProfile()
    form.value.avatar   = data.avatar   || form.value.avatar
    form.value.nickname = data.nickname || form.value.nickname
    form.value.phone    = data.phone    || form.value.phone
    form.value.gender   = data.gender   ?? form.value.gender
    form.value.email    = data.email    || ''
    form.value.address  = data.address  || ''
    form.value.height   = data.height   || ''
    form.value.weight   = data.weight   || ''
  } catch (e) {
    console.warn('[profile] 获取用户信息失败', e.message)
  }
})

function toggleGender() {
  form.value.gender = form.value.gender === 1 ? 0 : 1
}

function chooseAvatar() {
  console.log('[chooseAvatar] 函数触发')
  uni.showActionSheet({
    itemList: ['拍摄', '从相册选择'],
    success(res) {
      console.log('[chooseAvatar] ActionSheet 选择:', res.tapIndex)
      const sourceType = res.tapIndex === 0 ? ['camera'] : ['album']
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType,
        success: async (chooseRes) => {
          const path = chooseRes.tempFilePaths[0]
          console.log('[chooseAvatar] 选图成功, path:', path)
          form.value.avatar = path  // 本地预览
          try {
            uni.showLoading({ title: '上传中...' })
            const url = await uploadAvatar(path)
            form.value.avatar = url  // 替换为服务器 URL
          } catch (e) {
            uni.showToast({ title: e.message || '头像上传失败', icon: 'none' })
          } finally {
            uni.hideLoading()
          }
        },
        fail(err) {
          console.warn('[chooseAvatar] chooseImage 失败:', err)
        }
      })
    },
    fail(err) {
      console.warn('[chooseAvatar] ActionSheet 取消或失败:', err)
    }
  })
}

async function save() {
  uni.showLoading({ title: '保存中...' })
  try {
    await updateProfile({
      nickname: form.value.nickname,
      avatar:   form.value.avatar,
      gender:   form.value.gender,
      email:    form.value.email,
      address:  form.value.address,
      phone:    form.value.phone,
      height:   Number(form.value.height) || 0,
      weight:   Number(form.value.weight) || 0,
    })
    userStore.updateProfile({
      nickname: form.value.nickname,
      avatar:   form.value.avatar,
      gender:   form.value.gender,
      email:    form.value.email,
    })
    uni.showToast({ title: '保存成功', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 1500)
  } catch {
    uni.showToast({ title: '保存失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}
</script>

<style scoped>
.page { background: #f5f5f5; min-height: 100vh; padding: 24rpx; }
.form-card {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
}
.form-item {
  display: flex;
  align-items: center;
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid #f5f5f5;
  min-height: 96rpx;
}
.item-label { width: 100rpx; font-size: 30rpx; color: #333; flex-shrink: 0; }
.item-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  text-align: right;
}
.avatar-thumb {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-left: auto;
}

/* 性别开关 */
.gender-wrap { margin-left: auto; display: flex; align-items: center; gap: 12rpx; }
.gender-track {
  width: 88rpx;
  height: 48rpx;
  border-radius: 24rpx;
  background: #ddd;
  position: relative;
  transition: background 0.3s;
}
.gender-track.female { background: #FF6B9D; }
.gender-thumb {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: #fff;
  position: absolute;
  top: 4rpx;
  left: 4rpx;
  transition: left 0.3s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.gender-track.female .gender-thumb { left: 44rpx; }

/* 身高体重 */
.value-row { display: flex; align-items: center; margin-left: auto;}
.num-input { width: 80rpx; font-size: 28rpx; color: #333; text-align: right; }
.unit { font-size: 26rpx; color: #999; margin-left: 8rpx; }

/* 保存按钮 */
.save-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  text-align: center;
}
.save-text { font-size: 32rpx; color: #1DC799; }
</style>
