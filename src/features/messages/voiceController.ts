import { SpeakQueue } from './speakQueue'
import { speakCharacter } from './speakCharacter'
import type { Talk, Screenplay } from './messages'
import homeStore from '../stores/home'
import debounce from 'lodash/debounce'

const speakQueue = new SpeakQueue()
let isPlayingProtectedVoice = false
let currentAudioContext: AudioContext | null = null

// 將 playVoiceGuide 整合為 voiceController 的私有函數
const playVoice = debounce(
  (
    message: string,
    isProtected: boolean = false,
    onStart?: () => void,
    onEnd?: () => void
  ): void => {
    const talk: Talk = {
      message,
      speakerX: 0,
      speakerY: 0,
      style: 'talk',
    }
    const screenplay: Screenplay = {
      expression: 'neutral',
      talk,
    }
    homeStore.setState({ assistantMessage: message })

    if (isProtected) {
      isPlayingProtectedVoice = true
    }

    speakCharacter(
      screenplay,
      onStart || (() => console.log('播放語音開始')),
      () => {
        if (isProtected) {
          isPlayingProtectedVoice = false
        }
        // onEnd?.()
        ;(onEnd || (() => console.log('語音播放結束')))()
      }
    )
  },
  50
)

export const voiceController = {
  ready: false,
  init() {
    this.ready = true
    window.dispatchEvent(new CustomEvent('voiceControllerReady'))
  },
  isReady() {
    return this.ready
  },
  playVoice,
  play: async (
    message: string,
    isProtected: boolean = false,
    onStart?: () => void,
    onEnd?: () => void
  ) => {
    // 如果正在播放受保護的語音，則不中斷
    // if (isPlayingProtectedVoice && !isProtected) {
    //   return
    // }

    // 如果不是受保護的語音，先停止當前播放
    if (!isProtected) {
      await voiceController.stopAll()
      // 給予一點時間讓資源釋放
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    // message = message
    //   .replace(/乾/g, '甘')
    //   .replace(/重重的/g, '仲仲的')
    //   .replace(/質/g, '值')
    //   .replace(/吧/g, '巴')

    // 播放新的語音
    playVoice(message, isProtected, onStart, onEnd)
  },

  stopAll: async () => {
    // 如果正在播放受保護的語音，則不停止
    if (isPlayingProtectedVoice) {
      return
    }

    // 停止 SpeakQueue 中的語音
    speakQueue.clearQueue()

    // 停止所有正在播放的音源
    const hs = homeStore.getState()
    if (hs.viewer.model?.lipSync) {
      try {
        // 只停止當前音源，不關閉 AudioContext
        hs.viewer.model.lipSync.stopAllActiveSources()
      } catch (error) {
        console.error('Error stopping audio sources:', error)
      }
    }

    // 更新狀態
    homeStore.setState({ assistantMessage: '', audioPlaying: false })
  },
}

// 將 voiceController 掛載到全局 window 對象
declare global {
  interface Window {
    voiceController: typeof voiceController
  }
}

if (typeof window !== 'undefined') {
  window.voiceController = voiceController
  voiceController.init()
}
