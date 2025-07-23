import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import settingsStore from '@/features/stores/settings'
import homeStore from '@/features/stores/home'
import menuStore from '@/features/stores/menu'
import {
  handleSendChatFn,
  handleReceiveTextFromWsFn,
} from '../features/chat/handlers'
import { MessageInputContainer } from './messageInputContainer'
import useWebSocket from './useWebSocket'

export const Form = () => {
  const modalImage = homeStore((s) => s.modalImage)
  const webcamStatus = homeStore((s) => s.webcamStatus)
  const captureStatus = homeStore((s) => s.captureStatus)
  const chatProcessingCount = homeStore((s) => s.chatProcessingCount)

  const [delayedText, setDelayedText] = useState('')

  const { t } = useTranslation()
  const handleSendChat = handleSendChatFn({
    NotConnectedToExternalAssistant: t('NotConnectedToExternalAssistant'),
    APIKeyNotEntered: t('APIKeyNotEntered'),
  })
  const handleReceiveTextFromWs = handleReceiveTextFromWsFn()

  useWebSocket({ handleReceiveTextFromWs })

  useEffect(() => {
    // 文字與圖像準備完成後，發送聊天
    if (delayedText && modalImage) {
      handleSendChat(delayedText)
      setDelayedText('')
    }
  }, [modalImage, delayedText, handleSendChat])

  const hookSendChat = useCallback(
    (text: string) => {
      homeStore.setState({ triggerShutter: true })

      // 當選單中 showCamera 為 true 時，等待圖像獲取完成
      if (webcamStatus || captureStatus) {
        // 當網路攝影機開啟時
        setDelayedText(text) // 延遲到圖像獲取完成
      } else {
        handleSendChat(text)
      }
    },
    [handleSendChat, webcamStatus, captureStatus, setDelayedText]
  )

  useEffect(() => {
    console.log('chatProcessingCount:', chatProcessingCount)
    if (chatProcessingCount === 0) {
      // * ############################################################
      // * 這裡才是 AI 回答完全結束的時候
      console.log('chatProcessingCount is 0')

      // 延遲一下自動啟用聆聽功能
      setTimeout(() => {
        const pickUpButton = document.getElementById('pickUp')
        if (pickUpButton && !pickUpButton.hasAttribute('disabled')) {
          console.log('自動啟用聆聽功能')
          pickUpButton.click()
        }
      }, 1000) // 1秒延遲，讓語音播放完全結束
    }
  }, [chatProcessingCount])

  return <MessageInputContainer onChatProcessStart={hookSendChat} />
}
