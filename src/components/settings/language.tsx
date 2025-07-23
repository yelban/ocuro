import i18n from 'i18next'
import { useTranslation } from 'react-i18next'

import { Language } from '@/features/constants/settings'
import settingsStore from '@/features/stores/settings'

const LanguageSetting = () => {
  const selectLanguage = settingsStore((s) => s.selectLanguage)

  const { t } = useTranslation()

  return (
    <div className="my-24">
      <div className="my-16 typography-20 font-bold">{t('Language')}</div>
      <div className="my-8">
        <select
          className="px-16 py-8 bg-surface1 hover:bg-surface1-hover rounded-8"
          value={selectLanguage}
          onChange={(e) => {
            const newLanguage = e.target.value as Language

            // 僅支援繁體中文，無需複雜判斷
            settingsStore.setState({
              selectLanguage: 'zh',
              selectVoiceLanguage: 'zh-TW',
            })
            i18n.changeLanguage('zh')
          }}
        >
          <option value="zh">繁體中文 - Traditional Chinese</option>
        </select>
      </div>
    </div>
  )
}
export default LanguageSetting
