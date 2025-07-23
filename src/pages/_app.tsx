import '@charcoal-ui/icons'
import type { AppProps } from 'next/app'
import React, { useEffect } from 'react'
import { Analytics } from '@vercel/analytics/react'

import { isLanguageSupported } from '@/features/constants/settings'
import homeStore from '@/features/stores/home'
import settingsStore from '@/features/stores/settings'
import '@/styles/globals.css'
import migrateStore from '@/utils/migrateStore'
import i18n from '../lib/i18n'
import { FontService } from '@/services/fontLoader'

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const hs = homeStore.getState()
    const ss = settingsStore.getState()

    if (hs.userOnboarded) {
      i18n.changeLanguage(ss.selectLanguage)
      return
    }

    migrateStore()

    // 確保 showAssistantText 啟用（移除問卷功能後直接啟用對話）
    settingsStore.setState({
      showAssistantText: true,
    })
    // console.log(
    //   'settingsStore.getState().originalShowAssistantText:',
    //   settingsStore.getState().originalShowAssistantText
    // )
    // console.log(
    //   'settingsStore.getState().showAssistantText:',
    //   settingsStore.getState().showAssistantText
    // )

    const browserLanguage = navigator.language
    const languageCode = browserLanguage.match(/^zh/i)
      ? 'zh'
      : browserLanguage.split('-')[0].toLowerCase()

    const language = isLanguageSupported(languageCode) ? languageCode : 'zh'
    i18n.changeLanguage(language)
    settingsStore.setState({ selectLanguage: language })

    homeStore.setState({ userOnboarded: true })

    // const fontService = new FontService()
    // fontService.preloadCommonCharacters()
    // 預載入多個字體
    const preloadFonts = async () => {
      const fonts = [
        'TW-MOE-Li',
        'KingHwa_OldSong',
        'ZhuqueFangsong-Regular',
        'ChongXiSmallSeal',
        '851tegakizatsu',
      ]

      for (const fontFamily of fonts) {
        try {
          const fontService = new FontService(fontFamily)
          await fontService.preloadCommonCharacters()
        } catch (error) {
          // 靜默失敗，繼續載入下一個字體
          console.warn(`字體 ${fontFamily} 預載入失敗，將使用備用字體`)
        }
      }
    }

    preloadFonts()
  }, [])

  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  )
}
