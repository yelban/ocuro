import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { Message } from '@/features/messages/messages'
import { Viewer } from '../vrmViewer/viewer'

export interface InferenceResult {
  phlegm_score: number
  phlegm_type: number
  yang_score: number
  yang_type: number
  yin_score: number
  yin_type: number
}

export interface PersistedState {
  userOnboarded: boolean
  chatLog: Message[]
  showIntroduction: boolean
}

interface QuestionOption {
  label: string
  value: number
}

export interface Question {
  id: number
  question: string
  options: QuestionOption[]
}

export interface TransientState {
  viewer: Viewer
  assistantMessage: string
  slideMessages: string[]
  chatProcessing: boolean
  chatProcessingCount: number
  incrementChatProcessingCount: () => void
  decrementChatProcessingCount: () => void
  backgroundImageUrl: string
  modalImage: string
  triggerShutter: boolean
  webcamStatus: boolean
  captureStatus: boolean
  ws: WebSocket | null
  wsStreaming: boolean
  audioPlaying: boolean
  isCanvasVisible: boolean
  bcqResult: InferenceResult | null
  questions: Question[]
}

export type HomeState = PersistedState & TransientState

const homeStore = create<HomeState>()(
  persist(
    (set, get) => ({
      // persisted states
      userOnboarded: false,
      chatLog: [],
      showIntroduction: process.env.NEXT_PUBLIC_SHOW_INTRODUCTION !== 'false',
      assistantMessage: '',

      // transient states
      viewer: new Viewer(),
      slideMessages: [],
      chatProcessing: false,
      chatProcessingCount: 0,
      incrementChatProcessingCount: () => {
        set(({ chatProcessingCount }) => ({
          chatProcessingCount: chatProcessingCount + 1,
        }))
      },
      decrementChatProcessingCount: () => {
        set(({ chatProcessingCount }) => ({
          chatProcessingCount: chatProcessingCount - 1,
        }))
      },
      backgroundImageUrl:
        process.env.NEXT_PUBLIC_BACKGROUND_IMAGE_PATH ?? '/bg-c-0619.png',
      modalImage: '',
      triggerShutter: false,
      webcamStatus: false,
      captureStatus: false,
      ws: null,
      wsStreaming: false,
      audioPlaying: false,
      isCanvasVisible: true,
      bcqResult: {
        phlegm_score: 0,
        phlegm_type: 0,
        yang_score: 0,
        yang_type: 0,
        yin_score: 0,
        yin_type: 0,
      },
      questions: [],
    }),
    {
      name: 'ocuro-home',
      partialize: ({ chatLog, showIntroduction }) => ({
        chatLog: chatLog.map((message: Message) => ({
          ...message,
          content:
            typeof message.content === 'string'
              ? message.content
              : message.content[0].text,
        })),
        showIntroduction,
      }),
    }
  )
)

export default homeStore
