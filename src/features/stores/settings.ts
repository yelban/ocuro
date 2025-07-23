import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { SYSTEM_PROMPT } from '@/features/constants/systemPromptConstants'
import {
  AIService,
  AIVoice,
  Language,
  VoiceLanguage,
  OpenAITTSVoice,
  OpenAITTSModel,
} from '../constants/settings'

export const multiModalAIServices = ['openai', 'anthropic', 'google'] as const
export type multiModalAIServiceKey = (typeof multiModalAIServices)[number]

type multiModalAPIKeys = {
  [K in multiModalAIServiceKey as `${K}Key`]: string
}

interface APIKeys {
  openaiKey: string
  anthropicKey: string
  googleKey: string
  azureKey: string
  groqKey: string
  difyKey: string
  cohereKey: string
  mistralaiKey: string
  perplexityKey: string
  fireworksKey: string
  elevenlabsApiKey: string
}

interface ModelProvider {
  selectAIService: AIService
  selectAIModel: string
  localLlmUrl: string
  selectVoice: AIVoice
  googleTtsType: string
  stylebertvits2ServerUrl: string
  stylebertvits2ApiKey: string
  stylebertvits2ModelId: string
  stylebertvits2Style: string
  stylebertvits2SdpRatio: number
  stylebertvits2Length: number
  gsviTtsServerUrl: string
  gsviTtsModelId: string
  gsviTtsBatchSize: number
  gsviTtsSpeechRate: number
  elevenlabsVoiceId: string
  openaiTTSKey: string
  openaiTTSVoice: OpenAITTSVoice
  openaiTTSModel: OpenAITTSModel
  openaiTTSSpeed: number
  azureTTSApiKey: string
  azureTTSRegion: string
  azureTTSVoice: string
  azureTTSStyle: string
  azureTTSRole: string
  azureTTSRate: number
  azureTTSPitch: number
  azureTTSVolume: number
}

interface Integrations {
  difyUrl: string
  difyConversationId: string
}

interface Character {
  characterName: string
  showAssistantText: boolean
  originalShowAssistantText: boolean
  showCharacterName: boolean
  systemPrompt: string
}

interface BasicProfile {
  name: string
  sex: 'M' | 'F' | ''
  age: number
  height: number
  weight: number
}

interface General {
  selectLanguage: Language
  selectVoiceLanguage: VoiceLanguage
  changeEnglishToJapanese: boolean
  showControlPanel: boolean
  webSocketMode: boolean
  messageReceiverEnabled: boolean // 追加
  clientId: string // 追加
  basicProfile: BasicProfile
}

export type SettingsState = APIKeys &
  multiModalAPIKeys &
  ModelProvider &
  Integrations &
  Character &
  General

const settingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // API Keys
      openaiKey: '',
      anthropicKey: '',
      googleKey: '',
      azureKey: '',
      groqKey: '',
      cohereKey: '',
      mistralaiKey: '',
      perplexityKey: '',
      fireworksKey: '',
      difyKey: '',
      elevenlabsApiKey: '',

      // Model Provider
      selectAIService:
        (process.env.NEXT_PUBLIC_SELECT_AI_SERVICE as AIService) || 'openai',
      selectAIModel: process.env.NEXT_PUBLIC_SELECT_AI_MODEL || 'gpt-4',
      localLlmUrl: process.env.NEXT_PUBLIC_LOCAL_LLM_URL || '',
      selectVoice:
        (process.env.NEXT_PUBLIC_SELECT_VOICE as AIVoice) || 'google',
      googleTtsType:
        process.env.NEXT_PUBLIC_GOOGLE_TTS_TYPE || 'cmn-TW-Wavenet-A',
      stylebertvits2ServerUrl: '',
      stylebertvits2ModelId:
        process.env.NEXT_PUBLIC_STYLEBERTVITS2_MODEL_ID || '0',
      stylebertvits2ApiKey: '',
      stylebertvits2Style:
        process.env.NEXT_PUBLIC_STYLEBERTVITS2_STYLE || 'Neutral',
      stylebertvits2SdpRatio:
        parseFloat(process.env.NEXT_PUBLIC_STYLEBERTVITS2_SDP_RATIO || '0.2') ||
        0.2,
      stylebertvits2Length:
        parseFloat(process.env.NEXT_PUBLIC_STYLEBERTVITS2_LENGTH || '1.0') ||
        1.0,
      gsviTtsServerUrl:
        process.env.NEXT_PUBLIC_GSVI_TTS_URL || 'http://127.0.0.1:5000/tts',
      gsviTtsModelId: process.env.NEXT_PUBLIC_GSVI_TTS_MODEL_ID || '0',
      gsviTtsBatchSize:
        parseInt(process.env.NEXT_PUBLIC_GSVI_TTS_BATCH_SIZE || '2') || 2,
      gsviTtsSpeechRate:
        parseFloat(process.env.NEXT_PUBLIC_GSVI_TTS_SPEECH_RATE || '1.0') ||
        1.0,
      elevenlabsVoiceId: '',
      openaiTTSKey: '',
      openaiTTSVoice:
        (process.env.NEXT_PUBLIC_OPENAI_TTS_VOICE as OpenAITTSVoice) ||
        'shimmer',
      openaiTTSModel:
        (process.env.NEXT_PUBLIC_OPENAI_TTS_MODEL as OpenAITTSModel) || 'tts-1',
      openaiTTSSpeed:
        parseFloat(process.env.NEXT_PUBLIC_OPENAI_TTS_SPEED || '1.0') || 1.0,
      azureTTSApiKey: '',
      azureTTSRegion: process.env.NEXT_PUBLIC_AZURE_TTS_REGION || '',
      azureTTSVoice: process.env.NEXT_PUBLIC_AZURE_TTS_VOICE || '',
      azureTTSStyle: process.env.NEXT_PUBLIC_AZURE_TTS_STYLE || '',
      azureTTSRole: process.env.NEXT_PUBLIC_AZURE_TTS_ROLE || '',
      azureTTSRate:
        parseFloat(process.env.NEXT_PUBLIC_AZURE_TTS_RATE || '1.0') || 1.0,
      azureTTSPitch:
        parseFloat(process.env.NEXT_PUBLIC_AZURE_TTS_PITCH || '1.0') || 1.0,
      azureTTSVolume:
        parseFloat(process.env.NEXT_PUBLIC_AZURE_TTS_VOLUME || '100') || 100,

      // Integrations
      difyUrl: '',
      difyConversationId: '',

      // Character
      characterName: process.env.NEXT_PUBLIC_CHARACTER_NAME || 'CHARACTER',
      showAssistantText:
        process.env.NEXT_PUBLIC_SHOW_ASSISTANT_TEXT === 'true' ? true : false,
      originalShowAssistantText:
        process.env.NEXT_PUBLIC_SHOW_ASSISTANT_TEXT === 'true' ? true : false,
      showCharacterName:
        process.env.NEXT_PUBLIC_SHOW_CHARACTER_NAME === 'true' ? true : false,
      systemPrompt: process.env.NEXT_PUBLIC_SYSTEM_PROMPT || SYSTEM_PROMPT,

      // General
      selectLanguage:
        (process.env.NEXT_PUBLIC_SELECT_LANGUAGE as Language) || 'zh',
      selectVoiceLanguage:
        (process.env.NEXT_PUBLIC_SELECT_VOICE_LANGUAGE as VoiceLanguage) ||
        'zh-TW',
      changeEnglishToJapanese:
        process.env.NEXT_PUBLIC_CHANGE_ENGLISH_TO_JAPANESE === 'true',
      showControlPanel: process.env.NEXT_PUBLIC_SHOW_CONTROL_PANEL !== 'false',
      webSocketMode:
        process.env.NEXT_PUBLIC_WEB_SOCKET_MODE === 'true' ? true : false,
      messageReceiverEnabled: false, // 追加
      clientId: '', // 追加

      // Basic Profile
      basicProfile: {
        name: '',
        sex: '',
        age: 0,
        height: 0,
        weight: 0,
      },
    }),
    {
      name: 'ocuro-settings',
      partialize: (state) => ({
        openaiKey: state.openaiKey,
        anthropicKey: state.anthropicKey,
        googleKey: state.googleKey,
        azureKey: state.azureKey,
        groqKey: state.groqKey,
        cohereKey: state.cohereKey,
        mistralaiKey: state.mistralaiKey,
        perplexityKey: state.perplexityKey,
        fireworksKey: state.fireworksKey,
        difyKey: state.difyKey,
        elevenlabsApiKey: state.elevenlabsApiKey,
        selectAIService: state.selectAIService,
        selectAIModel: state.selectAIModel,
        localLlmUrl: state.localLlmUrl,
        selectVoice: state.selectVoice,
        googleTtsType: state.googleTtsType,
        stylebertvits2ServerUrl: state.stylebertvits2ServerUrl,
        stylebertvits2ApiKey: state.stylebertvits2ApiKey,
        stylebertvits2ModelId: state.stylebertvits2ModelId,
        stylebertvits2Style: state.stylebertvits2Style,
        stylebertvits2SdpRatio: state.stylebertvits2SdpRatio,
        stylebertvits2Length: state.stylebertvits2Length,
        gsviTtsServerUrl: state.gsviTtsServerUrl,
        gsviTtsModelId: state.gsviTtsModelId,
        gsviTtsBatchSize: state.gsviTtsBatchSize,
        gsviTtsSpeechRate: state.gsviTtsSpeechRate,
        elevenlabsVoiceId: state.elevenlabsVoiceId,
        difyUrl: state.difyUrl,
        difyConversationId: state.difyConversationId,
        characterName: state.characterName,
        showAssistantText: state.showAssistantText,
        originalShowAssistantText: state.originalShowAssistantText,
        showCharacterName: state.showCharacterName,
        systemPrompt: state.systemPrompt,
        selectLanguage: state.selectLanguage,
        selectVoiceLanguage: state.selectVoiceLanguage,
        changeEnglishToJapanese: state.changeEnglishToJapanese,
        webSocketMode: state.webSocketMode,
        messageReceiverEnabled: state.messageReceiverEnabled,
        clientId: state.clientId,
        openaiTTSKey: state.openaiTTSKey,
        openaiTTSVoice: state.openaiTTSVoice,
        openaiTTSModel: state.openaiTTSModel,
        openaiTTSSpeed: state.openaiTTSSpeed,
        azureTTSApiKey: state.azureTTSApiKey,
        azureTTSRegion: state.azureTTSRegion,
        azureTTSVoice: state.azureTTSVoice,
        azureTTSStyle: state.azureTTSStyle,
        azureTTSRole: state.azureTTSRole,
        azureTTSRate: state.azureTTSRate,
        azureTTSPitch: state.azureTTSPitch,
        azureTTSVolume: state.azureTTSVolume,
        basicProfile: state.basicProfile,
      }),
    }
  )
)

export default settingsStore
