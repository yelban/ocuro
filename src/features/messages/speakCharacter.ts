import { Language } from '@/features/constants/settings'
import settingsStore from '@/features/stores/settings'
import { wait } from '@/utils/wait'
import { Screenplay, Talk } from './messages'
import { synthesizeStyleBertVITS2Api } from './synthesizeStyleBertVITS2'
import { synthesizeVoiceElevenlabsApi } from './synthesizeVoiceElevenlabs'
import { synthesizeVoiceGoogleApi } from './synthesizeVoiceGoogle'
import { synthesizeVoiceOpenAIApi } from './synthesizeVoiceOpenAI'
import { SpeakQueue } from './speakQueue'
import toastStore from '@/features/stores/toast'
import i18next from 'i18next'
import { synthesizeVoiceAzureApi } from '@/features/messages/synthesizeVoiceAzure'

const speakQueue = new SpeakQueue()

const createSpeakCharacter = () => {
  let lastTime = 0
  let prevFetchPromise: Promise<unknown> = Promise.resolve()

  return (
    screenplay: Screenplay,
    onStart?: () => void,
    onComplete?: () => void
  ) => {
    const ss = settingsStore.getState()
    onStart?.()

    let isNeedDecode = true

    const fetchPromise = prevFetchPromise.then(async () => {
      const now = Date.now()
      if (now - lastTime < 1000) {
        await wait(1000 - (now - lastTime))
      }
      let buffer
      try {
        if (ss.selectVoice == 'google') {
          const googleTtsTypeByLang = getGoogleTtsType(ss.googleTtsType)
          buffer = await fetchAudioGoogle(
            screenplay.talk,
            googleTtsTypeByLang
          ).catch(() => null)
        } else if (ss.selectVoice == 'stylebertvits2') {
          buffer = await fetchAudioStyleBertVITS2(
            screenplay.talk,
            ss.stylebertvits2ServerUrl,
            ss.stylebertvits2ApiKey,
            ss.stylebertvits2ModelId,
            ss.stylebertvits2Style,
            ss.stylebertvits2SdpRatio,
            ss.stylebertvits2Length,
            ss.selectLanguage
          ).catch(() => null)
        } else if (ss.selectVoice == 'gsvitts') {
          buffer = await fetchAudioVoiceGSVIApi(
            screenplay.talk,
            ss.gsviTtsServerUrl,
            ss.gsviTtsModelId,
            ss.gsviTtsBatchSize,
            ss.gsviTtsSpeechRate
          ).catch(() => null)
        } else if (ss.selectVoice == 'elevenlabs') {
          buffer = await fetchAudioElevenlabs(
            screenplay.talk,
            ss.elevenlabsApiKey,
            ss.elevenlabsVoiceId,
            ss.selectLanguage
          ).catch(() => null)
        } else if (ss.selectVoice == 'openai') {
          buffer = await synthesizeVoiceOpenAIApi(
            screenplay.talk,
            ss.openaiTTSKey || ss.openaiKey,
            ss.openaiTTSVoice,
            ss.openaiTTSModel,
            ss.openaiTTSSpeed
          )
        } else if (ss.selectVoice == 'azure') {
          buffer = await fetchAudioAzure(
            screenplay.talk,
            ss.azureTTSApiKey,
            ss.azureTTSRegion,
            ss.selectVoiceLanguage,
            ss.azureTTSVoice,
            ss.azureTTSStyle,
            ss.azureTTSRole,
            ss.azureTTSRate,
            ss.azureTTSPitch,
            ss.azureTTSVolume
          )
          isNeedDecode = false
        }
      } catch (error) {
        handleTTSError(error, ss.selectVoice)
        return null
      }
      lastTime = Date.now()
      return buffer
    })

    prevFetchPromise = fetchPromise

    // 改為使用佇列處理
    fetchPromise.then((audioBuffer) => {
      if (!audioBuffer) return

      speakQueue.addTask({
        audioBuffer,
        screenplay,
        isNeedDecode,
        onComplete,
      })
    })

    // prevSpeakPromise = Promise.all([fetchPromise, prevSpeakPromise]).then(
    //   ([audioBuffer]) => {
    //     if (!audioBuffer) {
    //       return
    //     }
    //     const hs = homeStore.getState()
    //     return hs.viewer.model?.speak(audioBuffer, screenplay)
    //   }
    // )
    // prevSpeakPromise.then(() => {
    //   onComplete?.()
    // })
  }
}

function getGoogleTtsType(googleTtsType: string): string {
  if (googleTtsType) return googleTtsType
  return getGppgleTtsType() || ''
}

function getGppgleTtsType(): string {
  return 'cmn-TW-Standard-A'
}

function handleTTSError(error: unknown, serviceName: string): void {
  let message: string
  if (error instanceof Error) {
    message = error.message
  } else if (typeof error === 'string') {
    message = error
  } else {
    message = i18next.t('Errors.UnexpectedError')
  }
  const errorMessage = i18next.t('Errors.TTSServiceError', {
    serviceName,
    message,
  })

  toastStore.getState().addToast({
    message: errorMessage,
    type: 'error',
    duration: 5000,
    tag: 'tts-error',
  })

  console.error(errorMessage)
}

export const speakCharacter = createSpeakCharacter()

export const fetchAudioGoogle = async (
  talk: Talk,
  ttsType: string
): Promise<ArrayBuffer> => {
  const ttsVoice = await synthesizeVoiceGoogleApi(talk.message, ttsType)
  const uint8Array = new Uint8Array(ttsVoice.audio.data)
  const arrayBuffer: ArrayBuffer = uint8Array.buffer

  return arrayBuffer
}

export const fetchAudioAzure = async (
  talk: Talk,
  azureTTSApiKey: string,
  azureTTSRegion: string,
  azureTTSLanguage: string,
  azureTTSVoice: string,
  azureTTSStyle: string,
  azureTTSRole: string,
  azureTTSRate: number,
  azureTTSPitch: number,
  azureTTSVolume: number
): Promise<ArrayBuffer> => {
  const ttsVoice = await synthesizeVoiceAzureApi({
    message: talk.message,
    apiKey: azureTTSApiKey,
    region: azureTTSRegion,
    language: azureTTSLanguage,
    voice: azureTTSVoice,
    style: azureTTSStyle,
    role: azureTTSRole,
    rate: azureTTSRate,
    pitch: azureTTSPitch,
    volume: azureTTSVolume,
  })

  // console.log('ttsVoice:', ttsVoice)

  // 確保返回的是 ArrayBuffer
  if (!(ttsVoice.audio instanceof ArrayBuffer)) {
    throw new Error('Invalid audio data format')
  }

  return ttsVoice.audio
}

export const fetchAudioStyleBertVITS2 = async (
  talk: Talk,
  stylebertvits2ServerUrl: string,
  stylebertvits2ApiKey: string,
  stylebertvits2ModelId: string,
  stylebertvits2Style: string,
  stylebertvits2SdpRatio: number,
  stylebertvits2Length: number,
  selectLanguage: Language
): Promise<ArrayBuffer> => {
  const ttsVoice = await synthesizeStyleBertVITS2Api(
    talk.message,
    stylebertvits2ServerUrl,
    stylebertvits2ApiKey,
    stylebertvits2ModelId,
    stylebertvits2Style,
    stylebertvits2SdpRatio,
    stylebertvits2Length,
    selectLanguage
  )
  return ttsVoice
}

export const fetchAudioVoiceGSVIApi = async (
  talk: Talk,
  url: string,
  character: string,
  batchsize: number,
  speed: number
): Promise<ArrayBuffer> => {
  console.log('talk.message:', talk.message)
  const style = talk.style !== 'talk' ? talk.style : 'default'

  // 新增文字替換邏輯，只在 GSVI 語音時進行替換
  const processedMessage = talk.message
    .replace(/乾/g, '甘')
    .replace(/重重的/g, '仲仲的')
    .replace(/質/g, '值')
    .replace(/吧/g, '巴')
  // const processedMessage = talk.message

  const response = await fetch(url.replace(/\/$/, ''), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      character: character,
      emotion: style,
      text: processedMessage, // 使用替換後的文字
      batch_size: batchsize,
      speed: speed.toString(),
      stream: true,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to fetch TTS audio.')
  }

  const blob = await response.blob()
  const buffer = await blob.arrayBuffer()
  return buffer
}

export const fetchAudioElevenlabs = async (
  talk: Talk,
  apiKey: string,
  voiceId: string,
  language: Language
): Promise<ArrayBuffer> => {
  const ttsVoice = await synthesizeVoiceElevenlabsApi(
    apiKey,
    talk.message,
    voiceId,
    language
  )

  // const uint8Array = new Uint8Array(ttsVoice.audio);
  const arrayBuffer: ArrayBuffer = ttsVoice.audio.buffer

  return arrayBuffer
}
