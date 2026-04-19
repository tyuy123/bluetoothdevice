<template>
  <scroll-view scroll-y class="page">
    <view class="chat-list">
      <view v-for="(msg, i) in messages" :key="i" class="msg-wrap"
        :class="{right: msg.role === 'user'}">
        <!-- 时间戳 -->
        <view v-if="msg.showTime" class="time-stamp">{{ msg.time }}</view>
        <!-- 气泡 -->
        <view class="bubble-row" :class="{right: msg.role === 'user'}">
          <image v-if="msg.role === 'bot'" src="/static/logo.png" class="bot-avatar" mode="aspectFill" />
          <view class="bubble" :class="{bot: msg.role === 'bot', user: msg.role === 'user'}">
            <text class="bubble-text">{{ msg.text }}</text>
            <!-- 快捷选项 -->
            <view v-if="msg.options && msg.options.length" class="options-wrap">
              <text v-for="opt in msg.options" :key="opt.id" class="opt-link"
                @tap="onOption(opt)">{{ opt.label }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 加载中 -->
      <view v-if="loading" class="bubble-row">
        <image src="/static/logo.png" class="bot-avatar" mode="aspectFill" />
        <view class="bubble bot">
          <view class="typing"><view class="d"></view><view class="d"></view><view class="d"></view></view>
        </view>
      </view>
    </view>
  </scroll-view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const loading = ref(false)
const messages = ref([])

const INITIAL_OPTIONS = [
  { id: 'lifting', label: '蓝牙智能电动升降台' },
  { id: 'patch4', label: '蓝牙四驱版魔力贴' },
  { id: 'patchWarm', label: '蓝牙温情版魔力贴' },
  { id: 'patchClassic', label: '蓝牙经典版魔力贴' },
  { id: 'footEms', label: '蓝牙EMS脚部按摩器' },
  { id: 'human', label: '人工客服' }
]

// TODO: 接入 AI 对话接口
const FAQ_MAP = {
  lifting: '乐班智能电动升降台支持手机APP蓝牙控制，可设置坐姿/站姿高度，内置防碰撞保护。如需购买请联系客服。',
  patch4: '蓝牙四驱版魔力贴采用4极EMS技术，支持15档强度调节，续航约15小时，通过APP可自定义模式。',
  patchWarm: '蓝牙温情版魔力贴集EMS与温热功能于一体，帮助缓解肌肉酸痛，特别适合办公室使用。',
  patchClassic: '蓝牙经典版魔力贴轻便小巧，单极设计，支持10档强度，可贴于颈部、肩部等部位使用。',
  footEms: '蓝牙EMS脚部按摩器采用脚踏式设计，无需弯腰操作，支持8种按摩模式，APP智能控制。'
}

onLoad(() => {
  pushBot('您好，我是客服小乐！请问您需要咨询哪种产品呢？', INITIAL_OPTIONS)
})

function pushBot(text, options) {
  messages.value.push({
    role: 'bot',
    text,
    options: options || [],
    showTime: messages.value.length === 0,
    time: formatTime(new Date())
  })
}

function pushUser(text) {
  messages.value.push({
    role: 'user',
    text,
    options: [],
    showTime: false
  })
}

async function onOption(opt) {
  if (opt.id === 'human') {
    uni.showModal({
      title: '人工客服',
      content: '人工客服功能即将上线，您可以拨打客服电话：400-xxx-xxxx',
      showCancel: false
    })
    return
  }
  pushUser(opt.label)
  loading.value = true
  // TODO: 调用 AI 接口
  await new Promise(r => setTimeout(r, 800))
  loading.value = false
  const reply = FAQ_MAP[opt.id] || '感谢您的咨询，我们会尽快为您解答。'
  pushBot(reply, [{ id: 'human', label: '转人工客服' }])
}

function formatTime(d) {
  return `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}`
}
</script>

<style scoped>
.page { height: 100vh; background: #f5f5f5; }
.chat-list { padding: 24rpx 24rpx 80rpx; }
.time-stamp { text-align: center; font-size: 22rpx; color: #bbb; margin: 16rpx 0; }
.bubble-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 24rpx;
  gap: 16rpx;
}
.bubble-row.right { flex-direction: row-reverse; }
.bot-avatar { width: 72rpx; height: 72rpx; border-radius: 50%; flex-shrink: 0; }
.bubble {
  max-width: 70%;
  padding: 24rpx;
  border-radius: 20rpx;
  word-break: break-all;
}
.bubble.bot { background: #fff; border-top-left-radius: 4rpx; }
.bubble.user { background: #1DC799; border-top-right-radius: 4rpx; }
.bubble-text { font-size: 28rpx; color: #333; line-height: 1.6; }
.bubble.user .bubble-text { color: #fff; }
.options-wrap {
  display: flex;
  flex-direction: column;
  margin-top: 16rpx;
  gap: 12rpx;
}
.opt-link { font-size: 28rpx; color: #1DC799; line-height: 1.8; }
.typing { display: flex; gap: 8rpx; align-items: center; height: 32rpx; }
.d {
  width: 12rpx; height: 12rpx; border-radius: 50%; background: #ccc;
  animation: pulse 1s infinite ease-in-out;
}
.d:nth-child(2) { animation-delay: 0.2s; }
.d:nth-child(3) { animation-delay: 0.4s; }
@keyframes pulse {
  0%, 100% { opacity: 0.3; } 50% { opacity: 1; }
}
</style>
