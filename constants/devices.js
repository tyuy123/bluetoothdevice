// 设备常量配置
export const DEVICE_LIST = [
  {
    id: 'footEms',
    name: '蓝牙EMS脚部按摩器',
    shortName: 'EMS脚部按摩器',
    bleName: 'D23',
    bgColor: '#F9A8A8',
    pairBg: '#E89090',
    pairTitle: '发现蓝牙EMS脚部按摩器',
    pairTip: '按图长按3S后\n等待蓝牙配对',
    pairType: 'longpress',
    image: '/static/logo.png'
  },
  {
    id: 'lifting',
    name: '乐班智能电动升降台',
    shortName: '电动升降台',
    bgColor: '#8BA7C7',
    pairBg: '#6FA3C8',
    pairTitle: '发现蓝牙智能电动升级台',
    pairTip: '按图长按3S后\n等待蓝牙配对',
    pairType: 'longpress',
    image: '/static/logo.png'
  },
  {
    id: 'patch4',
    name: '蓝牙魔力贴四驱版',
    shortName: '魔力贴四驱版',
    bgColor: '#4ECDC4',
    pairBg: '#1DC799',
    pairTitle: '发现蓝牙四驱版魔力贴',
    pairTip: '请长按主机"M"键\n完成蓝牙配对',
    pairType: 'mkey',
    image: '/static/logo.png'
  },
  {
    id: 'patchWarm',
    name: '蓝牙魔力贴温情版',
    shortName: '魔力贴温情版',
    bgColor: '#F4A79A',
    pairBg: '#F4A79A',
    pairTitle: '发现蓝牙温情版魔力贴',
    pairTip: '按图长按3S后\n等待蓝牙配对',
    pairType: 'longpress',
    image: '/static/logo.png'
  },
  {
    id: 'patchClassic',
    name: '蓝牙魔力贴经典版',
    shortName: '魔力贴经典版',
    bgColor: '#D4C5A0',
    pairBg: '#C8B580',
    pairTitle: '发现蓝牙经典版魔力贴',
    pairTip: '按图长按3S后\n等待蓝牙配对',
    pairType: 'longpress',
    image: '/static/logo.png'
  },
  {
    id: 'patchColor',
    name: '蓝牙魔力贴炫彩版',
    shortName: '魔力贴炫彩版',
    bgColor: '#C8A8D8',
    pairBg: '#B090D0',
    pairTitle: '发现蓝牙炫彩版魔力贴',
    pairTip: '按图长按3S后\n等待蓝牙配对',
    pairType: 'longpress',
    image: '/static/logo.png'
  },
  {
    id: 'cushion',
    name: '乐班智能矫姿塑形坐垫',
    shortName: '智能坐垫',
    bgColor: '#8DC5C5',
    pairBg: '#7AB5B5',
    pairTitle: '发现乐班智能矫姿塑形坐垫',
    pairTip: '按图长按3S后\n等待蓝牙配对',
    pairType: 'longpress',
    image: '/static/logo.png'
  },
  {
    id: 'zmind',
    name: 'Zmind心灵沙丘',
    shortName: '心灵沙丘',
    bgColor: '#5A5A6A',
    pairBg: '#484858',
    pairTitle: '发现Zmind心灵沙丘',
    pairTip: '按图长按3S后\n等待蓝牙配对',
    pairType: 'longpress',
    image: '/static/logo.png'
  }
]

export const GAME_LIST = [
  { id: 'puzzle', name: '新品拼图', subName: 'Game', bg: '#4CAF50', route: '/pages/games/puzzle' },
  { id: 'game2048', name: '2048', subName: 'Game', bg: '#FF9800', route: '/pages/games/game2048' },
  { id: 'flip', name: '翻翻看', subName: 'Game', bg: '#2196F3', route: '/pages/games/flip' }
]
