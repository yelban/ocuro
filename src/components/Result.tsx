import { FC, useEffect, useState, useMemo, useCallback } from 'react'
import homeStore, { InferenceResult } from '@/features/stores/home'
import settingsStore from '@/features/stores/settings'
import { voiceController } from '@/features/messages/voiceController'
import { CompositeImage } from '@/components/CompositeImage'
import { useFont } from '@/hooks/useFont'
import { Converter } from 'opencc-js'
import { solarToLunar } from 'lunar-calendar'
// import { BasicInfo } from './BasicInfoForm'
// import Image from 'next/image'

interface ResultProps {
  isVisible: boolean
  onClose?: () => void
}

interface TextLayer {
  text: string
  x: number
  y: number
  fontSize: number
  color: string
  fonts: string[]
  maxWidth?: number
}

interface ValidTextLayer {
  text: string | undefined
  x: number
  y: number
  fontSize: number
  color: string
  fonts: string[]
  maxWidth?: number
  zIndex?: number
}

const bcqIndex = {
  p000: 1,
  p001: 2,
  p002: 3,
  p010: 4,
  p011: 5,
  p012: 6,
  p020: 7,
  p021: 8,
  p022: 9,
  P100: 10,
  p101: 11,
  p102: 12,
  p110: 13,
  p111: 14,
  p112: 15,
  p120: 16,
  p121: 17,
  p122: 18,
  p200: 19,
  p201: 20,
  p202: 21,
  p210: 22,
  p211: 23,
  p212: 24,
  p220: 25,
  p221: 26,
  p222: 27,
}

interface BcqItem {
  陽虛: string
  陰虛: string
  痰瘀: string
  類型簡述: string
  運動養生建議: string
  當季建議水果參考: string
  傳統藥膳參考: string
  現代食療參考: string
  備註: string
  情緒: string
  宜: string
  宜排版: string
  忌: string
  忌排版: string
  金句: string
  金句排版Y: string
}

interface BcqData {
  [key: string]: BcqItem
}

// interface LunarDate {
//   year: number
//   month: number
//   day: number
//   isLeap: boolean
//   zodiac: string
// }

export const Result: FC<ResultProps> = ({ isVisible, onClose }) => {
  const bcqResult = homeStore((state) => state.bcqResult)
  console.log('bcqResult', bcqResult)

  // const questions = homeStore((state) => state.questions)
  // console.log('questions:', questions)

  const basicProfile = settingsStore((state) => state.basicProfile)
  console.log('basicProfile', basicProfile)

  const [bcqData, setBcqData] = useState<BcqData>({})
  const [isLoading, setIsLoading] = useState(true)
  const [fontsLoaded, setFontsLoaded] = useState(true)
  const [fallbackFont, setFallbackFont] = useState<string>('')
  const [isClient, setIsClient] = useState(false)
  const [lunarDate, setLunarDate] = useState<LunarDateResult | null>(null)

  // 檢查字體是否可用的函數
  async function checkFontAvailability(fontFamily: string): Promise<boolean> {
    try {
      await document.fonts.load(`1em "${fontFamily}"`)
      return document.fonts.check(`1em "${fontFamily}"`)
    } catch {
      return false
    }
  }

  // 收集需要渲染的所有文字
  function collectText(texts: (string | null)[]): string {
    return texts.filter((text): text is string => text !== null).join('')
  }

  const truncateText = (text: string) => {
    const isChinese = /[\u4e00-\u9fa5]/.test(text)
    const limit = isChinese ? 3 : 5
    return text.length > limit ? [text.slice(0, limit), '...'] : [text]
  }
  const [truncatedText, ellipsis] = truncateText(basicProfile.name)

  const physique = useMemo(() => {
    if (!bcqResult) return null
    return determinePhysique(bcqResult)
  }, [bcqResult])

  const idx = useMemo(() => {
    if (!physique) return null
    return bcqIndex[physique as keyof typeof bcqIndex]
  }, [physique])

  const result = useMemo(() => {
    if (!idx || !bcqData[idx.toString()]) return null
    return bcqData[idx.toString()]
  }, [idx, bcqData])

  // const bcqYes = result?.['宜排版']?.split('\n還想要動一動？')[0] || ''
  const bcqYes = useMemo(
    () => result?.['宜排版']?.split('\n還想要動一動？')[0] || '',
    [result]
  )

  const bcqNo = useMemo(() => result?.['忌排版'] || '', [result])

  const allText = useMemo(
    () => collectText([truncatedText, ellipsis, bcqYes, bcqNo]),
    [truncatedText, ellipsis, bcqYes, bcqNo]
  )
  console.log('allText', allText)

  // 取得今天日期
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth() + 1 // JavaScript 的月份從 0 開始，所以要加 1
  const date = today.getDate()

  const lunar = solarToLunar(year, month, date)
  console.log('lunar', lunar)

  const toLunarDate = useCallback(async () => {
    try {
      // 初始化轉換器
      const converter = Converter({ from: 'cn', to: 'tw' })

      // 格式化並轉換成繁體中文
      async function formatLunarDateTraditional(lunar: any) {
        const today = new Date()
        const weekDay = `星期${['日', '一', '二', '三', '四', '五', '六'][today.getDay()]}`

        // 添加空值檢查和預設值
        const traditionalLunar = {
          zodiac: lunar?.zodiac ? converter(lunar.zodiac) : '',
          GanZhiYear: lunar?.GanZhiYear ? converter(lunar.GanZhiYear) : '',
          GanZhiMonth: lunar?.GanZhiMonth ? converter(lunar.GanZhiMonth) : '',
          GanZhiDay: lunar?.GanZhiDay ? converter(lunar.GanZhiDay) : '',
          lunarYear: lunar?.lunarYear || 0,
          lunarMonth: lunar?.lunarMonth || 0,
          lunarDay: lunar?.lunarDay || 0,
          lunarMonthName: lunar?.lunarMonthName
            ? converter(lunar.lunarMonthName)
            : '',
          lunarDayName: lunar?.lunarDayName
            ? converter(lunar.lunarDayName)
            : '',
          lunarLeapMonth: lunar?.lunarLeapMonth || false,
          solarFestival: lunar?.solarFestival
            ? converter(lunar.solarFestival)
            : '',
          weekDay: weekDay,
        }

        return {
          zodiac: traditionalLunar.zodiac,
          Year: year,
          Month: month,
          Day: date,
          GanZhiYear: traditionalLunar.GanZhiYear,
          GanZhiMonth: traditionalLunar.GanZhiMonth,
          GanZhiDay: traditionalLunar.GanZhiDay,
          lunarYear: traditionalLunar.lunarYear,
          lunarMonth: traditionalLunar.lunarMonth,
          lunarDay: traditionalLunar.lunarDay,
          lunarMonthName: traditionalLunar.lunarMonthName,
          lunarDayName: traditionalLunar.lunarDayName,
          solarFestival: traditionalLunar.solarFestival,
          weekDay: traditionalLunar.weekDay,
        }
      }

      if (!lunar) {
        throw new Error('無法獲取農曆日期')
      }

      const result = await formatLunarDateTraditional(lunar)
      console.log('result', result)
      return result
    } catch (error) {
      console.error('轉換過程發生錯誤：', error)
      // 返回預設值
      return {
        zodiac: '',
        Year: year,
        Month: month,
        Day: date,
        GanZhiYear: '',
        GanZhiMonth: '',
        GanZhiDay: '',
        lunarYear: 0,
        lunarMonth: 0,
        lunarDay: 0,
        lunarMonthName: '',
        lunarDayName: '',
        solarFestival: '',
        weekDay: `星期${['日', '一', '二', '三', '四', '五', '六'][new Date().getDay()]}`,
      }
    }
  }, [lunar, date, month, year])

  interface LunarDateResult {
    Year: number
    Month: number
    Day: number
    GanZhiYear: string
    GanZhiMonth: string
    GanZhiDay: string
    lunarYear: number
    lunarMonth: number
    lunarDay: number
    zodiac: string
    lunarMonthName: string
    lunarDayName: string
    solarFestival?: string
    weekDay: string
  }

  const fontFamilies = useMemo(
    () => [
      'Noto Sans TC',
      'Microsoft JhengHei',
      'PingFang TC',
      'Source Han Sans TC',
      'sans-serif',
    ],
    []
  )

  // 系統字體檢測
  useEffect(() => {
    setIsClient(true)
    setFontsLoaded(false) // 在客戶端才將狀態設為 false

    let mounted = true

    async function loadSystemFonts() {
      setFontsLoaded(false)

      for (const font of fontFamilies) {
        if (font === 'sans-serif') continue

        const isAvailable = await checkFontAvailability(font)
        if (isAvailable && mounted) {
          setFallbackFont(font)
          setFontsLoaded(true)
          break
        }
      }

      if (mounted && !fontsLoaded) {
        setFallbackFont('sans-serif')
        setFontsLoaded(true)
      }
    }

    loadSystemFonts()

    return () => {
      mounted = false
    }
  }, [fontFamilies, fontsLoaded])

  // 預先載入常用字體
  useEffect(() => {
    const preloadFonts = async () => {
      await document.fonts.load(`1em "${fallbackFont}"`)
    }
    preloadFonts()
  }, [fallbackFont])

  // 構建文字層配置
  // 教育部隸書 / TW-MOE-Li
  // 京華老宋体 / KingHwa_OldSong
  // 朱雀仿宋 / ZhuqueFangsong-Regular
  // 崇羲篆體 / ChongXiSmallSeal
  // 851手書き雑フォント / 851tegakizatsu

  // // 為不同文字層分別使用 useFont
  // const isTWMOELiReady = useFont(
  //   truncatedText + '甲辰拉拉啦' || '',
  //   'TW-MOE-Li',
  //   {
  //     preload: true,
  //   }
  // )

  // const isKingHwaReady = useFont(ellipsis || '', 'KingHwa_OldSong', {
  //   preload: true,
  // })

  // const isZhuqueReady = useFont(
  //   bcqYes + bcqNo || '',
  //   'ZhuqueFangsong-Regular',
  //   {
  //     preload: true,
  //   }
  // )

  // const isChongXiReady = useFont(
  //   lunarDate?.GanZhiYear + '年商業啦啦啦' || '',
  //   'ChongXiSmallSeal',
  //   { preload: false }
  // )

  // const is851tegakizatsuReady = useFont(
  //   lunarDate?.GanZhiYear + '年商業啦啦啦' || '',
  //   '851tegakizatsu',
  //   { preload: true }
  // )

  // 在 useMemo 外部調用 useFont
  // const titleFontStatus = useFont(truncatedText + '甲辰拉拉啦', 'TW-MOE-Li', {
  //   preload: true,
  // })

  // const subtitleFontStatus = useFont(ellipsis || '', 'TW-MOE-Li', {
  //   preload: true,
  // })

  // const dateFontStatus = useFont(
  //   lunarDate?.GanZhiYear + '年商業6',
  //   'TW-MOE-Li',
  //   { preload: true }
  // )

  // // 使用 useMemo 來計算 fontStatuses
  // const fontStatuses = useMemo(
  //   () => ({
  //     title: titleFontStatus,
  //     subtitle: subtitleFontStatus,
  //     date: dateFontStatus,
  //   }),
  //   [titleFontStatus, subtitleFontStatus, dateFontStatus]
  // )

  // // 檢查所有字體是否都已準備好
  // const allFontsReady = useMemo(() => {
  //   return Object.values(fontStatuses).every((status) => status === 'ready')
  // }, [fontStatuses])

  const textLayers = useMemo(() => {
    // 如果不是所有字體都準備好，返回空數組
    // if (!allFontsReady) {
    //   console.log('等待字體載入...')
    //   return []
    // }

    const weekday = today.toLocaleString('en-US', { weekday: 'long' })

    return [
      {
        text: truncatedText,
        x: 360,
        y: 330,
        fontSize: 150,
        color: 'white',
        fonts: ['KingHwa_OldSong', fallbackFont, 'sans-serif'],
      },
      ellipsis && {
        text: ellipsis,
        x: 360 + truncatedText.length * 50 + 120,
        y: 366,
        fontSize: 64,
        color: 'white',
        fonts: ['KingHwa_OldSong', fallbackFont, 'sans-serif'],
      },
      {
        text: lunarDate?.GanZhiYear + '年',
        x: 900,
        y: 185,
        fontSize: 80,
        color: 'white',
        fonts: ['TW-MOE-Li', fallbackFont, 'sans-serif'],
      },
      {
        text: lunarDate?.lunarMonthName,
        x: 900,
        y: 290,
        fontSize: 80,
        color: 'white',
        fonts: ['TW-MOE-Li', fallbackFont, 'sans-serif'],
      },
      {
        text: lunarDate?.lunarDayName,
        x: 900,
        y: 390,
        fontSize: 80,
        color: 'white',
        fonts: ['TW-MOE-Li', fallbackFont, 'sans-serif'],
      },
      {
        text: lunarDate?.weekDay,
        x: 900,
        y: 500,
        fontSize: 76,
        color: 'white',
        fonts: ['TW-MOE-Li', fallbackFont, 'sans-serif'],
      },
      {
        text: '|',
        x: 1180,
        y: 200,
        fontSize: 100,
        color: 'white',
        fonts: ['KingHwa_OldSong', fallbackFont, 'sans-serif'],
      },
      {
        text: '|',
        x: 1180,
        y: 300,
        fontSize: 100,
        color: 'white',
        zIndex: 10,
        fonts: ['KingHwa_OldSong', fallbackFont, 'sans-serif'],
      },
      {
        text: '|',
        x: 1180,
        y: 400,
        fontSize: 100,
        color: 'white',
        fonts: ['KingHwa_OldSong', fallbackFont, 'sans-serif'],
      },
      {
        text: '|',
        x: 1180,
        y: 480,
        fontSize: 100,
        color: 'white',
        fonts: ['KingHwa_OldSong', fallbackFont, 'sans-serif'],
      },
      {
        text: year.toString(),
        x: 1268,
        y: 185,
        fontSize: 100,
        color: 'white',
        fonts: ['KingHwa_OldSong', fallbackFont, 'sans-serif'],
      },
      {
        text: month.toString(),
        x: 1280,
        y: 310,
        fontSize: 90,
        color: 'white',
        fonts: ['KingHwa_OldSong', fallbackFont, 'sans-serif'],
      },
      {
        text: '/',
        x: 1360,
        y: 340,
        fontSize: 120,
        color: 'white',
        fonts: ['KingHwa_OldSong', fallbackFont, 'sans-serif'],
      },
      {
        text: date.toString(),
        x: 1390,
        y: 380,
        fontSize: 90,
        color: 'white',
        fonts: ['KingHwa_OldSong', fallbackFont, 'sans-serif'],
      },
      {
        text: weekday,
        x: 1250,
        y: 500,
        fontSize: 70,
        color: 'white',
        fonts: ['KingHwa_OldSong', fallbackFont, 'sans-serif'],
      },
      {
        text: bcqYes,
        x: 350,
        y: 1500,
        fontSize: 95,
        maxWidth: 1150,
        color: 'white',
        fonts: ['TW-MOE-Li', fallbackFont, 'sans-serif'],
      },
      {
        text: bcqNo,
        x: 350,
        y: 1750,
        fontSize: 95,
        maxWidth: 1150,
        color: 'white',
        fonts: ['TW-MOE-Li', fallbackFont, 'sans-serif'],
      },
    ].filter((layer): layer is any => layer !== null)
  }, [
    truncatedText,
    ellipsis,
    lunarDate?.GanZhiYear,
    fallbackFont,
    lunarDate?.lunarMonthName,
    lunarDate?.lunarDayName,
    lunarDate?.weekDay,
    today,
    year,
    month,
    date,
    bcqYes,
    bcqNo,
  ])

  useEffect(() => {
    setIsLoading(true)
    fetch('/api/bcq-data')
      .then((response) => response.json())
      .then((data) => {
        setBcqData(data.bcq)
        setIsLoading(false)
        console.log('bcq data loaded', data.bcq)
      })
      .catch((error) => {
        console.error('Error loading bcq data:', error)
        setIsLoading(false)
      })
  }, [])

  // useEffect(() => {
  //   console.log('bcqResult', bcqResult)
  // }, [bcqResult])

  useEffect(() => {
    if (isVisible) {
      setTimeout(() => {
        voiceController.play(
          '這是您的體質分析結果。',
          false,
          () => {
            console.log('問題評估開始語音')
          },
          () => {
            console.log('問題評估語音結束')
            // 清除 basicProfile 內容
            // settingsStore.setState({
            //   basicProfile: {
            //     name: '',
            //     sex: '',
            //     age: 0,
            //     height: 0,
            //     weight: 0,
            //   },
            // })
          }
        )
      }, 1000)

      const fetchLunarDate = async () => {
        try {
          const result = await toLunarDate()
          if (result) {
            // 只在有結果時更新 state
            setLunarDate(result as LunarDateResult)
            // console.log('lunarDate', lunarDate)
          }
        } catch (error) {
          console.error('取得農曆日期時發生錯誤：', error)
        }
      }

      fetchLunarDate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]) // 當 isVisible 變為 true 時觸發

  useEffect(() => {
    if (lunarDate) {
      console.log('lunarDate', lunarDate)
      // 在這裡加入其他需要執行的程式碼
    }
  }, [lunarDate])

  if (!isVisible || !bcqResult) return null
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-60">
        <div>載入中...</div>
      </div>
    )
  }

  function determinePhysique(data: InferenceResult) {
    // 初始化三個數字
    let yangDigit = 0
    let yinDigit = 0
    let phlegmDigit = 0

    // 根據 yang_type 決定第一個數字
    if (data.yang_type < 1) {
      yangDigit = 0
    } else if (data.yang_type < 2) {
      yangDigit = 1
    } else {
      yangDigit = 2
    }

    // 根據 yin_type 決定第二個數字
    if (data.yin_type < 1) {
      yinDigit = 0
    } else if (data.yin_type < 2) {
      yinDigit = 1
    } else {
      yinDigit = 2
    }

    // 根據 phlegm_type 決定第三個數字
    if (data.phlegm_type < 1) {
      phlegmDigit = 0
    } else if (data.phlegm_type < 2) {
      phlegmDigit = 1
    } else {
      phlegmDigit = 2
    }

    // 組合成 physique 字串
    const physique = `p${yangDigit}${yinDigit}${phlegmDigit}`
    return physique
  }

  function padZero(num: number): string {
    return String(num).padStart(2, '0')
  }

  // const physique = determinePhysique(bcqResult)
  const name = basicProfile.name
  console.log('name', name)
  // const idx = bcqIndex[physique as keyof typeof bcqIndex]
  console.log('idx', idx)
  // const result = bcqData[idx.toString()]
  console.log('result', result)

  console.log('lunarDate', lunarDate)

  if (!result) {
    console.error('無法找到對應的體質結果')
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-60">
        <div>無法載入結果，請稍後再試</div>
      </div>
    )
  }

  let bcqTypeA = 'BodyConstitution-blueA.gif'
  switch (result['陽虛']) {
    case '正常':
      bcqTypeA = 'BodyConstitution-blueA.gif'
      break
    case '傾向':
      bcqTypeA = 'BodyConstitution-blueB1.gif'
      break
    case '體質':
      bcqTypeA = 'BodyConstitution-blueC1.gif'
      break
  }

  let bcqTypeB = 'BodyConstitution-blueA.gif'
  switch (result['陰虛']) {
    case '正常':
      bcqTypeB = 'BodyConstitution-blueA.gif'
      break
    case '傾向':
      bcqTypeB = 'BodyConstitution-blueB2.gif'
      break
    case '體質':
      bcqTypeB = 'BodyConstitution-blueC2.gif'
      break
  }

  let bcqTypeC = 'BodyConstitution-blueA.gif'
  switch (result['痰瘀']) {
    case '正常':
      bcqTypeC = 'BodyConstitution-blueA.gif'
      break
    case '傾向':
      bcqTypeC = 'BodyConstitution-blueB3.gif'
      break
    case '體質':
      bcqTypeC = 'BodyConstitution-blueC3.gif'
      break
  }

  // var today = new Date()
  // var day = today.getDate()
  // var month = today.getMonth() + 1
  // var dayHant = `農民曆-2406-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}.png`
  var bcqDesc = '農民曆-2406-blue' + padZero(idx || 0) + '.png'
  console.log('bcqDesc', bcqDesc)
  // var bcqYes = result['宜排版'].split('\n還想要動一動？')[0]
  // var bcqNo = result['忌排版']

  // 清除 basicProfile 內容
  // settingsStore.setState({
  //   basicProfile: {
  //     name: '',
  //     sex: '',
  //     age: 0,
  //     height: 0,
  //     weight: 0,
  //   },
  // })

  // 如果字體還在載入中，顯示載入動畫
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-lg text-gray-600">載入字體中...</p>
        </div>
      </div>
    )
  }

  const validTextLayers = textLayers.filter(
    (layer): layer is ValidTextLayer =>
      layer !== null && typeof layer === 'object'
  )

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-white bg-opacity-60">
      <div className="min-h-screen w-full flex items-center justify-center p-4">
        <div
          className="relative rounded-[16px] overflow-hidden shadow-2xl m-8 flex items-center justify-center"
          style={{
            width: '1600px',
            height: '2020px',
            maxWidth: '95vw',
            maxHeight: '95vh',
          }}
        >
          <div
            className="flex items-center justify-center w-full h-full"
            style={{
              transform: 'translateY(-50px)', // 向上偏移 100px，可以根據需要調整數值
            }}
          >
            <CompositeImage
              id="Result"
              backgroundPath="/png/農民曆-2406-BGblue-Static.png"
              overlays={[
                {
                  imagePath: '/png/農民曆-2406-blue15.png',
                  x: 120,
                  y: 936,
                },
                {
                  imagePath: '/gif/BG-blue-Yang.gif',
                  x: 120,
                  y: 660,
                  isGif: true,
                  zIndex: 0,
                  gifType: 'type1',
                },
                {
                  imagePath: '/gif/BG-blue-Yi.gif',
                  x: 610,
                  y: 660,
                  isGif: true,
                  zIndex: 1,
                  gifType: 'type1',
                },
                {
                  imagePath: '/gif/BG-blue-Ph.gif',
                  x: 1100,
                  y: 660,
                  isGif: true,
                  zIndex: 2,
                  gifType: 'type1',
                },
                {
                  imagePath: '/gif/' + bcqTypeA,
                  x: 330,
                  y: 680,
                  isGif: true,
                  zIndex: 3,
                  gifType: 'type2',
                },
                {
                  imagePath: '/gif/' + bcqTypeB,
                  x: 820,
                  y: 680,
                  isGif: true,
                  zIndex: 4,
                  gifType: 'type2',
                },
                {
                  imagePath: '/gif/' + bcqTypeC,
                  x: 1310,
                  y: 680,
                  isGif: true,
                  zIndex: 5,
                  gifType: 'type2',
                },
                // {
                //   type: 'line',
                //   x: 900,
                //   y: 150,
                //   length: 200,
                //   width: 2,
                //   color: 'white',
                // },
              ]}
              textLayers={validTextLayers as TextLayer[]}
              width={1600}
              height={2020}
              type1Speed={12}
              type2Speed={8}
              defaultFonts={[
                '-apple-system',
                'BlinkMacSystemFont',
                'Segoe UI',
                'Roboto',
                'Oxygen-Sans',
                'Ubuntu',
                'Cantarell',
                'Helvetica Neue',
                'sans-serif',
                'PingFang TC',
                'Microsoft JhengHei',
                'Noto Sans TC',
                'Source Han Sans TC',
                'Apple LiGothic',
                'WenQuanYi Micro Hei',
              ]} // 可以設置全域預設字型
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Result
