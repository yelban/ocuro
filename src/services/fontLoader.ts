// services/fontLoader.ts
export class FontService {
  private loadedCharacters = new Set<string>()
  private loading = new Map<string, Promise<void>>()
  private fontFamily: string
  private fontLoaded: boolean = false
  private static preloadedFonts = new Set<string>()

  // 修改常用字元的定義
  private static COMMON_CHARS: string = ''
  private static commonCharsPromise: Promise<string> | null = null

  constructor(fontFamily: string) {
    this.fontFamily = fontFamily
  }

  // 新增獲取常用字元的方法
  private static async getCommonChars(): Promise<string> {
    if (!this.commonCharsPromise) {
      this.commonCharsPromise = (async () => {
        try {
          const response = await fetch('/api/bcq-data')
          const data = await response.json()
          const specificChars =
            '「」，。：；？！（）《》『』【】〈〉〔〕、．…─│─' +
            '星期一二三四五六日' +
            '甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥' +
            '一月二月三月四月五月六月七月八月九月十月十一月十二月' +
            '年商業啦'

          // 直接將整個 JSON 物件轉為字串
          const allText = JSON.stringify(data)

          // 使用正則表達式匹配中文、英文、數字和標點符號
          const pattern = /[\u4e00-\u9fa5a-zA-Z0-9\s\p{P}]+/gu
          const extractedChars = allText.match(pattern)?.join('') || ''

          console.log('提取的字元長度：', extractedChars.length)

          // 將所有字元和指定字元轉換為不重複的字元集合
          const uniqueChars = new Set([...extractedChars, ...specificChars])
          console.log('不重複字元數量：', uniqueChars.size)

          return [...uniqueChars].join('')
        } catch (error) {
          console.error('獲取常用字元失敗:', error)
          return ''
        }
      })()
    }
    return this.commonCharsPromise
  }

  async ensureCharacters(text: string): Promise<void> {
    // 如果字體已載入，直接返回
    // console.log('ensureCharacters', text)
    // if (this.fontLoaded) return

    // 過濾出尚未載入的字符
    const newChars = [...new Set([...text])].filter(
      (char) => !this.loadedCharacters.has(char)
    )
    // console.log('newChars', newChars)

    if (newChars.length === 0) return

    // 將新字符分組（例如每 100 個字符一組）
    const charGroups = this.groupCharacters(newChars, 250)

    // 依序載入每組字符
    for (const group of charGroups) {
      const key = `${this.fontFamily}-${group.join('')}`
      // console.log('key', key)
      if (!this.loading.has(key)) {
        this.loading.set(key, this.loadFontSubset(group))
      }
      await this.loading.get(key)
      group.forEach((char) => this.loadedCharacters.add(char))
    }
  }

  private groupCharacters(chars: string[], size: number): string[][] {
    const groups: string[][] = []
    for (let i = 0; i < chars.length; i += size) {
      groups.push(chars.slice(i, i + size))
    }
    return groups
  }

  private async loadFontSubset(chars: string[]): Promise<void> {
    try {
      // console.log('開始載入字體子集:', chars.join(''))

      const response = await fetch('/api/fonts/subset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chars: chars.join(''),
          fontFamily: this.fontFamily,
        }),
      })

      const data = await response.json()
      // console.log('API 回應:', data)

      if (data.fallback) {
        console.warn('使用備用字體:', data.error || '未知原因')
        return
      }

      if (!data.cssUrl) {
        throw new Error('無效的 CSS URL')
      }

      await this.injectCSS(data.cssUrl)
      // console.log('CSS 已注入:', data.cssUrl)

      const fontFaceSet = await document.fonts.load(`1em "${this.fontFamily}"`)
      // console.log('字體載入狀態:', fontFaceSet.length > 0 ? '成功' : '失敗')

      this.fontLoaded = true

      // 強制觸發重繪
      // document.body.style.visibility = document.body.style.visibility
    } catch (error) {
      console.error('字體子集載入失敗 :', error)
      throw error
    }
  }

  private async injectCSS(cssUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = cssUrl
      // 修改這裡：添加 crossOrigin 屬性
      link.crossOrigin = 'anonymous'
      link.onload = () => resolve()
      link.onerror = () => reject(new Error('Failed to load font CSS'))
      document.head.appendChild(link)
    })
  }

  // 檢查字符是否已載入
  isCharacterLoaded(char: string): boolean {
    return this.loadedCharacters.has(char)
  }

  // 獲取已載入的字符數量
  getLoadedCharacterCount(): number {
    return this.loadedCharacters.size
  }

  // 新增預載入方法
  // async preloadCommonCharacters(): Promise<void> {
  //   try {
  //     console.log('開始預載入常用字元...')
  //     await this.ensureCharacters(FontService.COMMON_CHARS)
  //     console.log('常用字元預載入完成')
  //   } catch (error) {
  //     console.error('預載入常用字元失敗:', error)
  //   }
  // }
  public isPreloaded(): boolean {
    return FontService.preloadedFonts.has(this.fontFamily)
  }

  public async preloadCommonCharacters(): Promise<void> {
    try {
      const commonChars = await FontService.getCommonChars()
      if (commonChars) {
        await this.ensureCharacters(commonChars)
        FontService.preloadedFonts.add(this.fontFamily)
      }
    } catch (error) {
      console.warn('預載入常用字元失敗:', error)
      throw error
    }
  }
}
