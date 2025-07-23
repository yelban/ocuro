import { useState, useEffect } from 'react'
import { Form } from '@/components/form'
import MessageReceiver from '@/components/messageReceiver'
import { Menu } from '@/components/menu'
import { Meta } from '@/components/meta'
import ModalImage from '@/components/modalImage'
import VrmViewer from '@/components/vrmViewer'
import homeStore from '@/features/stores/home'
import settingsStore from '@/features/stores/settings'
import '@/lib/i18n'
import { buildUrl } from '@/utils/buildUrl'

const Home = () => {
  const bgUrl = homeStore((s) => `url(${buildUrl(s.backgroundImageUrl)})`)
  const messageReceiverEnabled = settingsStore((s) => s.messageReceiverEnabled)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // 添加全螢幕切換函數
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (err) {
      console.error('全螢幕切換失敗:', err)
    }
  }

  // 添加全螢幕狀態監聽
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  // 直接啟用對話功能
  useEffect(() => {
    // 強制啟用 showAssistantText 並啟用畫布
    settingsStore.setState({
      showAssistantText: true,
    })
    homeStore.setState({ isCanvasVisible: true })

    // 頁面載入後自動啟用聆聽功能，並延長聆聽時間
    const ensureMicrophonePermission = async () => {
      try {
        // 先請求麥克風權限
        await navigator.mediaDevices.getUserMedia({ audio: true })
        console.log('麥克風權限已獲得')
        return true
      } catch (error) {
        console.warn('無法獲得麥克風權限:', error)
        return false
      }
    }

    const startInitialListening = async () => {
      // 等待頁面載入完成
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // 確保有麥克風權限
      const hasPermission = await ensureMicrophonePermission()
      if (!hasPermission) {
        console.log('無麥克風權限，跳過自動聆聽')
        return
      }

      // 等待語音識別初始化
      await new Promise((resolve) => setTimeout(resolve, 1000))

      let isFirstListening = true
      let extendedListeningCount = 0
      const maxExtensions = 5 // 增加到5次延長

      const pickUpButton = document.getElementById('pickUp')
      if (pickUpButton && !pickUpButton.hasAttribute('disabled')) {
        console.log('頁面載入後自動啟用聆聽功能')
        pickUpButton.click()

        // 監聽語音識別結束事件，在第一次聆聽時自動重新啟用
        const checkAndExtendListening = () => {
          setTimeout(() => {
            const micIcon = pickUpButton?.querySelector('pixiv-icon')
            const isMicRecording = micIcon?.getAttribute('name') === '24/Dot'

            if (
              !isMicRecording &&
              isFirstListening &&
              extendedListeningCount < maxExtensions
            ) {
              console.log(
                `延長第一次聆聽時間 (${extendedListeningCount + 1}/${maxExtensions})`
              )
              extendedListeningCount++

              // 延長間隔時間稍微短一點，讓體驗更流暢
              setTimeout(() => {
                if (!pickUpButton.hasAttribute('disabled')) {
                  pickUpButton.click()
                }
              }, 500)

              checkAndExtendListening() // 遞迴檢查
            } else if (extendedListeningCount >= maxExtensions) {
              isFirstListening = false
              console.log('第一次聆聽延長完成')
            }
          }, 2000) // 增加到2秒後檢查是否需要延長
        }

        checkAndExtendListening()
      }
    }

    startInitialListening()
  }, [])

  return (
    <div
      className="min-h-screen bg-cover bcq-background antialiased"
      style={{ backgroundImage: bgUrl }}
    >
      {/* 添加全螢幕按鈕 */}
      <button
        onClick={toggleFullscreen}
        className="fixed top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-all !opacity-10 hover:opacity-100 z-[55]"
        aria-label="切換全螢幕"
      >
        {isFullscreen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
          </svg>
        )}
      </button>

      <Meta />
      {/* <Introduction /> */}
      <VrmViewer />
      <Form />
      <Menu />
      <ModalImage />
      {messageReceiverEnabled && <MessageReceiver />}
    </div>
  )
}

export default Home
