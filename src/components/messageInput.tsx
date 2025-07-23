import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import homeStore from '@/features/stores/home'
import { IconButton } from './iconButton'

type Props = {
  userMessage: string
  isMicRecording: boolean
  onChangeUserMessage: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void
  onClickSendButton: (event: React.MouseEvent<HTMLButtonElement>) => void
  onClickMicButton: (event: React.MouseEvent<HTMLButtonElement>) => void
}

export const MessageInput = ({
  userMessage,
  isMicRecording,
  onChangeUserMessage,
  onClickMicButton,
  onClickSendButton,
}: Props) => {
  const chatProcessing = homeStore((s) => s.chatProcessing)
  const audioPlaying = homeStore((s) => s.audioPlaying)
  const [rows, setRows] = useState(1)
  const [loadingDots, setLoadingDots] = useState('')

  const { t } = useTranslation()

  useEffect(() => {
    if (chatProcessing) {
      const interval = setInterval(() => {
        setLoadingDots((prev) => {
          if (prev === '...') return ''
          return prev + '.'
        })
      }, 200)

      return () => clearInterval(interval)
    }
  }, [chatProcessing])

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      !event.nativeEvent.isComposing &&
      event.keyCode !== 229 && // IME (Input Method Editor)
      event.key === 'Enter' &&
      !event.shiftKey
    ) {
      event.preventDefault() // デフォルトの挙動を防止
      if (userMessage.trim() !== '') {
        onClickSendButton(
          event as unknown as React.MouseEvent<HTMLButtonElement>
        )
        setRows(1)
      }
    } else if (event.key === 'Enter' && event.shiftKey) {
      setRows(rows + 1)
    } else if (
      event.key === 'Backspace' &&
      rows > 1 &&
      userMessage.slice(-1) === '\n'
    ) {
      setRows(rows - 1)
    }
  }

  return (
    <div className="fixed bottom-[1rem] left-0 right-0 z-30">
      <div className="text-black">
        <div className="mx-auto max-w-4xl p-16">
          <div className="grid grid-flow-col gap-[8px] grid-cols-[min-content_1fr_min-content]">
            <IconButton
              id="pickUp"
              iconName="24/Microphone"
              className="bg-secondary hover:bg-secondary-hover active:bg-secondary-press disabled:bg-secondary-disabled"
              isProcessing={isMicRecording}
              disabled={chatProcessing}
              onClick={onClickMicButton}
            />
            <textarea
              id="answerInput"
              data-answer-input="usual"
              placeholder={
                chatProcessing
                  ? `${t('AnswerGenerating')}${loadingDots}`
                  : t('EnterYourQuestion')
              }
              onChange={onChangeUserMessage}
              onKeyDown={handleKeyPress}
              disabled={chatProcessing}
              className="bg-surface1 hover:bg-surface1-hover focus:bg-surface1 disabled:bg-surface1-disabled disabled:text-primary-disabled rounded-16 w-full px-16 text-text-primary typography-16 font-bold disabled"
              value={chatProcessing ? '' : userMessage}
              rows={rows}
              style={{ lineHeight: '1.5', padding: '8px 16px', resize: 'none' }}
            ></textarea>

            <IconButton
              iconName="24/Send"
              className="bg-secondary hover:bg-secondary-hover active:bg-secondary-press disabled:bg-secondary-disabled"
              isProcessing={chatProcessing}
              disabled={chatProcessing || !userMessage}
              onClick={onClickSendButton}
            />
          </div>
          <div className="text-black pt-8">
            <p className="text-center">
              本體驗僅供瞭解初步體質狀況，無法取代醫療診斷
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
