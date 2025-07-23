import { useTranslation } from 'react-i18next'

import {
  AIVoice,
  OpenAITTSVoice,
  OpenAITTSModel,
} from '@/features/constants/settings'
import settingsStore from '@/features/stores/settings'
import { Link } from '../link'

// interface AzureSettings {
//   apiKey: string
//   region: string
//   voice: string
//   style: string
//   role: string
//   rate: number
//   pitch: number
//   volume: number
// }

const Voice = () => {
  const elevenlabsApiKey = settingsStore((s) => s.elevenlabsApiKey)

  const selectVoice = settingsStore((s) => s.selectVoice)
  const googleTtsType = settingsStore((s) => s.googleTtsType)
  const stylebertvits2ServerUrl = settingsStore(
    (s) => s.stylebertvits2ServerUrl
  )
  const stylebertvits2ApiKey = settingsStore((s) => s.stylebertvits2ApiKey)
  const stylebertvits2ModelId = settingsStore((s) => s.stylebertvits2ModelId)
  const stylebertvits2Style = settingsStore((s) => s.stylebertvits2Style)
  const stylebertvits2SdpRatio = settingsStore((s) => s.stylebertvits2SdpRatio)
  const stylebertvits2Length = settingsStore((s) => s.stylebertvits2Length)
  const gsviTtsServerUrl = settingsStore((s) => s.gsviTtsServerUrl)
  const gsviTtsModelId = settingsStore((s) => s.gsviTtsModelId)
  const gsviTtsBatchSize = settingsStore((s) => s.gsviTtsBatchSize)
  const gsviTtsSpeechRate = settingsStore((s) => s.gsviTtsSpeechRate)
  const elevenlabsVoiceId = settingsStore((s) => s.elevenlabsVoiceId)
  const openaiTTSKey = settingsStore((s) => s.openaiTTSKey)
  const openaiTTSVoice = settingsStore((s) => s.openaiTTSVoice)
  const openaiTTSModel = settingsStore((s) => s.openaiTTSModel)
  const openaiTTSSpeed = settingsStore((s) => s.openaiTTSSpeed)
  const azureTTSApiKey = settingsStore((s) => s.azureTTSApiKey)
  const azureTTSRegion = settingsStore((s) => s.azureTTSRegion)
  const azureTTSVoice = settingsStore((s) => s.azureTTSVoice)
  const azureTTSStyle = settingsStore((s) => s.azureTTSStyle)
  const azureTTSRate = settingsStore((s) => s.azureTTSRate)
  const azureTTSPitch = settingsStore((s) => s.azureTTSPitch)
  const azureTTSVolume = settingsStore((s) => s.azureTTSVolume)

  const { t } = useTranslation()

  return (
    <div className="my-40">
      <div className="my-16 typography-20 font-bold">
        {t('SyntheticVoiceEngineChoice')}
      </div>
      <div>{t('VoiceEngineInstruction')}</div>
      <div className="my-8">
        <select
          value={selectVoice}
          onChange={(e) =>
            settingsStore.setState({ selectVoice: e.target.value as AIVoice })
          }
          className="px-16 py-8 bg-surface1 hover:bg-surface1-hover rounded-8"
        >
          <option value="google">{t('UsingGoogleTTS')}</option>
          <option value="stylebertvits2">{t('UsingStyleBertVITS2')}</option>
          <option value="gsvitts">{t('UsingGSVITTS')}</option>
          <option value="elevenlabs">{t('UsingElevenLabs')}</option>
          <option value="openai">{t('UsingOpenAITTS')}</option>
          <option value="azure">{t('UsingAzureTTS')}</option>
        </select>
      </div>
      <div className="my-40">
        <div className="my-16 typography-20 font-bold">
          {t('VoiceAdjustment')}
        </div>
        {(() => {
          if (selectVoice === 'google') {
            return (
              <>
                <div>
                  {t('GoogleTTSInfo')}
                  {t('AuthFileInstruction')}
                  <br />
                  <Link
                    url="https://developers.google.com/workspace/guides/create-credentials?#create_credentials_for_a_service_account"
                    label="https://developers.google.com/workspace/guides/create-credentials?#create_credentials_for_a_service_account"
                  />
                  <br />
                  <br />
                  {t('LanguageModelURL')}
                  <br />
                  <Link
                    url="https://cloud.google.com/text-to-speech/docs/voices"
                    label="https://cloud.google.com/text-to-speech/docs/voices"
                  />
                </div>
                <div className="mt-16 font-bold">{t('LanguageChoice')}</div>
                <div className="mt-8">
                  <input
                    className="text-ellipsis px-16 py-8 w-col-span-4 bg-surface1 hover:bg-surface1-hover rounded-8"
                    type="text"
                    placeholder="..."
                    value={googleTtsType}
                    onChange={(e) =>
                      settingsStore.setState({ googleTtsType: e.target.value })
                    }
                  />
                </div>
              </>
            )
          } else if (selectVoice === 'stylebertvits2') {
            return (
              <>
                <div>
                  {t('StyleBertVITS2Info')}
                  <br />
                  <Link
                    url="https://github.com/litagin02/Style-Bert-VITS2"
                    label="https://github.com/litagin02/Style-Bert-VITS2"
                  />
                  <br />
                  <br />
                </div>
                <div className="mt-16 font-bold">
                  {t('StyleBeatVITS2ServerURL')}
                </div>
                <div className="mt-8">
                  <input
                    className="text-ellipsis px-16 py-8 w-col-span-4 bg-surface1 hover:bg-surface1-hover rounded-8"
                    type="text"
                    placeholder="..."
                    value={stylebertvits2ServerUrl}
                    onChange={(e) =>
                      settingsStore.setState({
                        stylebertvits2ServerUrl: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="mt-16 font-bold">
                  {t('StyleBeatVITS2ApiKey')}
                </div>
                <div className="mt-8">
                  <input
                    className="text-ellipsis px-16 py-8 w-col-span-4 bg-surface1 hover:bg-surface1-hover rounded-8"
                    type="text"
                    placeholder="..."
                    value={stylebertvits2ApiKey}
                    onChange={(e) =>
                      settingsStore.setState({
                        stylebertvits2ApiKey: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="mt-16 font-bold">
                  {t('StyleBeatVITS2ModelID')}
                </div>
                <div className="mt-8">
                  <input
                    className="text-ellipsis px-16 py-8 w-col-span-4 bg-surface1 hover:bg-surface1-hover rounded-8"
                    type="number"
                    placeholder="..."
                    value={stylebertvits2ModelId}
                    onChange={(e) =>
                      settingsStore.setState({
                        stylebertvits2ModelId: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="mt-16 font-bold">
                  {t('StyleBeatVITS2Style')}
                </div>
                <div className="mt-8">
                  <input
                    className="text-ellipsis px-16 py-8 w-col-span-4 bg-surface1 hover:bg-surface1-hover rounded-8"
                    type="text"
                    placeholder="..."
                    value={stylebertvits2Style}
                    onChange={(e) =>
                      settingsStore.setState({
                        stylebertvits2Style: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="mt-16 font-bold">
                  {t('StyleBeatVITS2SdpRatio')}: {stylebertvits2SdpRatio}
                </div>
                <input
                  type="range"
                  min={0.0}
                  max={1.0}
                  step={0.01}
                  value={stylebertvits2SdpRatio}
                  className="mt-8 mb-16 input-range"
                  onChange={(e) => {
                    settingsStore.setState({
                      stylebertvits2SdpRatio: Number(e.target.value),
                    })
                  }}
                ></input>
                <div className="mt-16 font-bold">
                  {t('StyleBeatVITS2Length')}: {stylebertvits2Length}
                </div>
                <input
                  type="range"
                  min={0.0}
                  max={2.0}
                  step={0.01}
                  value={stylebertvits2Length}
                  className="mt-8 mb-16 input-range"
                  onChange={(e) => {
                    settingsStore.setState({
                      stylebertvits2Length: Number(e.target.value),
                    })
                  }}
                ></input>
              </>
            )
          } else if (selectVoice === 'gsvitts') {
            return (
              <>
                <div>{t('GSVITTSInfo')}</div>
                <div className="mt-16 font-bold">{t('GSVITTSServerUrl')}</div>
                <div className="mt-8">
                  <input
                    className="text-ellipsis px-16 py-8 w-col-span-4 bg-surface1 hover:bg-surface1-hover rounded-8"
                    type="text"
                    placeholder="..."
                    value={gsviTtsServerUrl}
                    onChange={(e) =>
                      settingsStore.setState({
                        gsviTtsServerUrl: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="mt-16 font-bold">{t('GSVITTSModelID')}</div>
                <div className="mt-8">
                  <input
                    className="text-ellipsis px-16 py-8 w-col-span-4 bg-surface1 hover:bg-surface1-hover rounded-8"
                    type="text"
                    placeholder="..."
                    value={gsviTtsModelId}
                    onChange={(e) =>
                      settingsStore.setState({ gsviTtsModelId: e.target.value })
                    }
                  />
                </div>
                <div className="mt-16 font-bold">{t('GSVITTSBatchSize')}</div>
                <div className="mt-8">
                  <input
                    className="text-ellipsis px-16 py-8 w-col-span-4 bg-surface1 hover:bg-surface1-hover rounded-8"
                    type="number"
                    step="1"
                    placeholder="..."
                    value={gsviTtsBatchSize}
                    onChange={(e) =>
                      settingsStore.setState({
                        gsviTtsBatchSize: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="mt-16 font-bold">{t('GSVITTSSpeechRate')}</div>
                <div className="mt-8">
                  <input
                    className="text-ellipsis px-16 py-8 w-col-span-4 bg-surface1 hover:bg-surface1-hover rounded-8"
                    type="number"
                    step="0.1"
                    placeholder="..."
                    value={gsviTtsSpeechRate}
                    onChange={(e) =>
                      settingsStore.setState({
                        gsviTtsSpeechRate: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
              </>
            )
          } else if (selectVoice === 'elevenlabs') {
            return (
              <>
                <div>
                  {t('ElevenLabsInfo')}
                  <br />
                  <Link
                    url="https://elevenlabs.io/api"
                    label="https://elevenlabs.io/api"
                  />
                  <br />
                </div>
                <div className="mt-16 font-bold">{t('ElevenLabsApiKey')}</div>
                <div className="mt-8">
                  <input
                    className="text-ellipsis px-16 py-8 w-col-span-4 bg-surface1 hover:bg-surface1-hover rounded-8"
                    type="text"
                    placeholder="..."
                    value=""
                    onChange={(e) =>
                      settingsStore.setState({
                        elevenlabsApiKey: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="mt-16 font-bold">{t('ElevenLabsVoiceId')}</div>
                <div className="mt-8">
                  {t('ElevenLabsVoiceIdInfo')}
                  <br />
                  <Link
                    url="https://api.elevenlabs.io/v1/voices"
                    label="https://api.elevenlabs.io/v1/voices"
                  />
                  <br />
                </div>
                <div className="mt-8">
                  <input
                    className="text-ellipsis px-16 py-8 w-col-span-4 bg-surface1 hover:bg-surface1-hover rounded-8"
                    type="text"
                    placeholder="..."
                    value={elevenlabsVoiceId}
                    onChange={(e) =>
                      settingsStore.setState({
                        elevenlabsVoiceId: e.target.value,
                      })
                    }
                  />
                </div>
              </>
            )
          } else if (selectVoice === 'openai') {
            return (
              <>
                <div>{t('OpenAITTSInfo')}</div>
                <div className="mt-16 font-bold">{t('OpenAIAPIKeyLabel')}</div>
                <div className="mt-8">
                  <input
                    className="text-ellipsis px-16 py-8 w-col-span-4 bg-surface1 hover:bg-surface1-hover rounded-8"
                    type="text"
                    placeholder="..."
                    value={openaiTTSKey}
                    onChange={(e) =>
                      settingsStore.setState({
                        openaiTTSKey: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="mt-16 font-bold">{t('OpenAITTSVoice')}</div>
                <div className="mt-8">
                  <select
                    value={openaiTTSVoice}
                    onChange={(e) =>
                      settingsStore.setState({
                        openaiTTSVoice: e.target.value as OpenAITTSVoice,
                      })
                    }
                    className="px-16 py-8 bg-surface1 hover:bg-surface1-hover rounded-8"
                  >
                    <option value="alloy">alloy</option>
                    <option value="echo">echo</option>
                    <option value="fable">fable</option>
                    <option value="onyx">onyx</option>
                    <option value="nova">nova</option>
                    <option value="shimmer">shimmer</option>
                  </select>
                </div>
                <div className="mt-16 font-bold">{t('OpenAITTSModel')}</div>
                <div className="mt-8">
                  <select
                    value={openaiTTSModel}
                    onChange={(e) =>
                      settingsStore.setState({
                        openaiTTSModel: e.target.value as OpenAITTSModel,
                      })
                    }
                    className="px-16 py-8 bg-surface1 hover:bg-surface1-hover rounded-8"
                  >
                    <option value="tts-1">tts-1</option>
                    <option value="tts-1-hd">tts-1-hd</option>
                  </select>
                </div>
                <div className="mt-16 font-bold">
                  {t('OpenAITTSSpeed')}: {openaiTTSSpeed}
                </div>
                <input
                  type="range"
                  min={0.25}
                  max={4.0}
                  step={0.01}
                  value={openaiTTSSpeed}
                  className="mt-8 mb-16 input-range"
                  onChange={(e) => {
                    settingsStore.setState({
                      openaiTTSSpeed: Number(e.target.value),
                    })
                  }}
                />
              </>
            )
          } else if (selectVoice === 'azure') {
            return (
              <>
                <div>
                  {t('AzureTTSInfo')}
                  <br />
                  <Link
                    url="https://docs.microsoft.com/azure/cognitive-services/speech-service"
                    label="Azure Cognitive Services Speech"
                  />
                </div>
                <div className="mt-16 font-bold">{t('AzureTTSAPIKey')}</div>
                <div className="mt-8">
                  <input
                    className="text-ellipsis px-16 py-8 w-col-span-4 bg-surface1 hover:bg-surface1-hover rounded-8"
                    type="text"
                    placeholder="..."
                    value=""
                    onChange={(e) =>
                      settingsStore.setState({ azureTTSApiKey: e.target.value })
                    }
                  />
                </div>
                <div className="mt-16 font-bold">{t('AzureTTSRegion')}</div>
                <div className="mt-8">
                  <input
                    className="text-ellipsis px-16 py-8 w-col-span-4 bg-surface1 hover:bg-surface1-hover rounded-8"
                    type="text"
                    placeholder="eastus"
                    value={azureTTSRegion}
                    onChange={(e) =>
                      settingsStore.setState({ azureTTSRegion: e.target.value })
                    }
                  />
                </div>
                <div className="mt-16 font-bold">{t('AzureTTSVoice')}</div>
                <div className="mt-8">
                  <select
                    value={azureTTSVoice}
                    onChange={(e) =>
                      settingsStore.setState({ azureTTSVoice: e.target.value })
                    }
                    className="px-16 py-8 bg-surface1 hover:bg-surface1-hover rounded-8"
                  >
                    <option value="zh-TW-HsiaoChenNeural">曉臻</option>
                    <option value="zh-TW-HsiaoYuNeural">曉雨</option>
                    <option value="zh-TW-YunJheNeural">雲哲</option>
                  </select>
                </div>
                <div className="mt-16 font-bold">{t('AzureTTSStyle')}</div>
                <div className="mt-8">
                  <input
                    className="text-ellipsis px-16 py-8 w-col-span-4 bg-surface1 hover:bg-surface1-hover rounded-8"
                    type="text"
                    placeholder="chat"
                    value={azureTTSStyle}
                    onChange={(e) =>
                      settingsStore.setState({ azureTTSStyle: e.target.value })
                    }
                  />
                </div>
                <div className="mt-16 font-bold">
                  {t('AzureTTSRate')}: {azureTTSRate}
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={3.0}
                  step={0.1}
                  value={azureTTSRate}
                  className="mt-8 mb-16 input-range"
                  onChange={(e) =>
                    settingsStore.setState({
                      azureTTSRate: Number(e.target.value),
                    })
                  }
                />
                <div className="mt-16 font-bold">{t('AzureTTSPitch')}</div>
                <div className="mt-8">
                  <input
                    className="text-ellipsis px-16 py-8 w-col-span-4 bg-surface1 hover:bg-surface1-hover rounded-8"
                    type="number"
                    step="1"
                    placeholder="..."
                    value={azureTTSPitch}
                    onChange={(e) =>
                      settingsStore.setState({
                        azureTTSPitch: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="mt-16 font-bold">{t('AzureTTSVolume')}</div>
                <div className="mt-8">
                  <input
                    className="text-ellipsis px-16 py-8 w-col-span-4 bg-surface1 hover:bg-surface1-hover rounded-8"
                    type="number"
                    step="1"
                    placeholder="..."
                    value={azureTTSVolume}
                    onChange={(e) =>
                      settingsStore.setState({
                        azureTTSVolume: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </>
            )
          }
        })()}
      </div>
    </div>
  )
}
export default Voice
