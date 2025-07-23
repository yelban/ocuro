import { getAIChatResponseStream } from '@/features/chat/aiChatFactory'
import { AIService } from '@/features/constants/settings'
import { textsToScreenplay, Message } from '@/features/messages/messages'
import { speakCharacter } from '@/features/messages/speakCharacter'
import homeStore from '@/features/stores/home'
import settingsStore from '@/features/stores/settings'
import { voiceController } from '@/features/messages/voiceController'

/**
 * 處理字串的函數
 * @param receivedMessage 要處理的字串
 * @param sentences 以單句為單位儲存回覆的陣列
 * @param aiTextLog AI 回覆記錄
 * @param tag 標籤
 * @param isCodeBlock 程式碼區塊的標誌
 * @param codeBlockText 程式碼區塊的文字
 */
export const processReceivedMessage = async (
  receivedMessage: string,
  sentences: string[] = [],
  aiTextLog: Message[] = [],
  tag: string = '',
  isCodeBlock: boolean = false,
  codeBlockText: string = ''
) => {
  console.warn('processReceivedMessage...')
  const ss = settingsStore.getState()
  const hs = homeStore.getState()

  // 分離回覆內容的標籤部分和回覆部分
  const tagMatch = receivedMessage.match(/^\[(.*?)\]/)
  if (tagMatch && tagMatch[0]) {
    tag = tagMatch[0]
    receivedMessage = receivedMessage.slice(tag.length)
  }

  // 以單句為單位切分並處理回覆
  while (receivedMessage.length > 0) {
    const sentenceMatch = receivedMessage.match(
      /^(.+?[。．.!?！？\n]|.{20,}[、,])/
    )
    if (sentenceMatch?.[0]) {
      let sentence = sentenceMatch[0]
      // 將分割的文字加入 sentences
      sentences.push(sentence)
      // 用分割文字的剩餘部分更新 receivedMessage
      receivedMessage = receivedMessage.slice(sentence.length).trimStart()

      // 如果是不需要或無法發話的字串則跳過
      if (
        !sentence.includes('```') &&
        !sentence.replace(
          /^[\s\u3000\t\n\r\[\(\{「［（【『〈《〔｛«‹〘〚〛〙›»〕》〉』】）］」\}\)\]'"''""・、。,.!?！？:：;；\-_=+~～*＊@＠#＃$＄%％^＾&＆|｜\\＼/／`｀]+$/gu,
          ''
        )
      ) {
        continue
      }

      // 結合標籤與回覆（用於語音播放）
      let aiText = `${tag} ${sentence}`
      console.log('aiText', aiText)

      if (isCodeBlock && !sentence.includes('```')) {
        codeBlockText += sentence
        continue
      }

      if (sentence.includes('```')) {
        if (isCodeBlock) {
          // 程式碼區塊的結束處理
          const [codeEnd, ...restOfSentence] = sentence.split('```')
          aiTextLog.push({
            role: 'code',
            content: codeBlockText + codeEnd,
          })
          aiText += `${tag} ${restOfSentence.join('```') || ''}`

          // AssistantMessage 欄位的更新
          homeStore.setState({ assistantMessage: sentences.join(' ') })

          codeBlockText = ''
          isCodeBlock = false
        } else {
          // 程式碼區塊的開始處理
          isCodeBlock = true
          ;[aiText, codeBlockText] = aiText.split('```')
        }

        sentence = sentence.replace(/```/g, '')
      }

      const aiTalks = textsToScreenplay([aiText])
      aiTextLog.push({ role: 'assistant', content: sentence })

      // 逐句生成語音並播放，顯示回覆
      const currentAssistantMessage = sentences.join(' ')

      speakCharacter(
        aiTalks[0],
        () => {
          homeStore.setState({
            assistantMessage: currentAssistantMessage,
          })
          hs.incrementChatProcessingCount()
        },
        () => {
          hs.decrementChatProcessingCount()
        }
      )
    } else {
      // 沒有匹配的句子時跳出迴圈
      break
    }
  }
}

/**
 * 處理 AI 回應的函數
 * @param currentChatLog 記錄中保留的訊息陣列
 * @param messages 用於生成解答的訊息陣列
 */
// TODO: 與上方函數的處理重疊相當多，將來需要整合
export const processAIResponse = async (
  currentChatLog: Message[],
  messages: Message[]
) => {
  console.warn('processAIResponse...')
  homeStore.setState({ chatProcessing: true })
  let stream

  const ss = settingsStore.getState()
  const hs = homeStore.getState()

  try {
    stream = await getAIChatResponseStream(
      ss.selectAIService as AIService,
      messages
    )
  } catch (e) {
    console.error(e)
    stream = null
  }

  if (stream == null) {
    homeStore.setState({ chatProcessing: false })
    return
  }

  const reader = stream.getReader()
  let receivedMessage = ''
  let aiTextLog: Message[] = [] // 用於對話記錄欄位
  let tag = ''
  let isCodeBlock = false
  let codeBlockText = ''
  const sentences = new Array<string>() // 用於助理訊息欄位
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done && receivedMessage.length === 0) break

      if (value) receivedMessage += value

      // 分離回覆內容的標籤部分和回覆部分
      const tagMatch = receivedMessage.match(/^\[(.*?)\]/)
      if (tagMatch && tagMatch[0]) {
        tag = tagMatch[0]
        receivedMessage = receivedMessage.slice(tag.length)
      }

      // 以單句為單位切分並處理回覆
      while (receivedMessage.length > 0) {
        const sentenceMatch = receivedMessage.match(
          /^(.+?[。．.!?！？\n]|.{20,}[、,])/
        )
        if (sentenceMatch?.[0]) {
          let sentence = sentenceMatch[0]
          // 將分割的文字加入 sentences
          sentences.push(sentence)
          // 用分割文字的餘下部分更新 receivedMessage
          receivedMessage = receivedMessage.slice(sentence.length).trimStart()

          // 如果是不需要或無法發話的字串則跳過
          if (
            !sentence.includes('```') &&
            !sentence.replace(
              /^[\s\u3000\t\n\r\[\(\{「［（【『〈《〔｛«‹〘〚〛〙›»〕》〉』】）］」\}\)\]'"''""・、。,.!?！？:：;；\-_=+~～*＊@＠#＃$＄%％^＾&＆|｜\\＼/／`｀]+$/gu,
              ''
            )
          ) {
            continue
          }

          // 結合標籤與回覆（用於語音播放）
          let aiText = `${tag} ${sentence}`
          console.log('aiText', aiText)

          if (isCodeBlock && !sentence.includes('```')) {
            codeBlockText += sentence
            continue
          }

          if (sentence.includes('```')) {
            if (isCodeBlock) {
              // 程式碼區塊的結束處理
              const [codeEnd, ...restOfSentence] = sentence.split('```')
              aiTextLog.push({
                role: 'code',
                content: codeBlockText + codeEnd,
              })
              aiText += `${tag} ${restOfSentence.join('```') || ''}`

              // AssistantMessage 欄位的更新
              homeStore.setState({ assistantMessage: sentences.join(' ') })

              codeBlockText = ''
              isCodeBlock = false
            } else {
              // 程式碼區塊的開始處理
              isCodeBlock = true
              ;[aiText, codeBlockText] = aiText.split('```')
            }

            sentence = sentence.replace(/```/g, '')
          }

          const aiTalks = textsToScreenplay([aiText])
          aiTextLog.push({ role: 'assistant', content: sentence })

          // 逐句生成語音並播放，顯示回覆
          const currentAssistantMessage = sentences.join(' ')

          // * ############################################################
          // * 大語言模型覆述特定回答的解析規則
          // * ############################################################
          interface ResponseConfig {
            logText: string
            pattern: RegExp
            targetElementId: string
            inputType: 'input' | 'select' | 'radio'
            obtainedState: string
            valueTransformer?: (match: string) => string
          }

          const RESPONSE_CONFIGS: Record<string, ResponseConfig> = {
            name: {
              logText:
                '# handlers.ts#processAIResponse 大語言模型覆述意圖: name ',
              pattern: /好的，我可以稱呼您是?(.+)。/,
              targetElementId: 'name',
              inputType: 'input',
              obtainedState: 'nameObtained',
            },
            sex: {
              logText:
                '# handlers.ts#processAIResponse 大語言模型覆述意圖: sex ',
              pattern: /好的，您的性別是?(.+)。/,
              targetElementId: 'sex',
              inputType: 'radio',
              obtainedState: 'sexObtained',
              valueTransformer: (match: string) =>
                match.includes('男') ||
                match.includes('男生') ||
                match.includes('男性')
                  ? 'M'
                  : 'F',
            },
            age: {
              logText:
                '# handlers.ts#processAIResponse 大語言模型覆述意圖: age ',
              pattern: /好的，您今年(\d+)歲/,
              targetElementId: 'age',
              inputType: 'input',
              obtainedState: 'ageObtained',
            },
            height: {
              logText:
                '# handlers.ts#processAIResponse 大語言模型覆述意圖: height ',
              pattern: /好的，您的身高是?(\d+)公分/,
              targetElementId: 'height',
              inputType: 'input',
              obtainedState: 'heightObtained',
            },
            weight: {
              logText:
                '# handlers.ts#processAIResponse 大語言模型覆述意圖: weight ',
              pattern: /好的，您的體重是?(\d+)公斤/,
              targetElementId: 'weight',
              inputType: 'input',
              obtainedState: 'weightObtained',
            },
            confirm: {
              logText:
                '# handlers.ts#processAIResponse 大語言模型覆述意圖: confirm ',
              pattern: /好的，資料(.+)，/,
              targetElementId: 'confirm',
              inputType: 'input',
              obtainedState: 'confirmObtained',
            },
            update: {
              logText:
                '# handlers.ts#processAIResponse 大語言模型覆述意圖: update ',
              pattern: /好的，您想要修改(.+)資料為多少？/,
              targetElementId: 'update',
              inputType: 'input',
              obtainedState: 'updateObtained',
            },
            topic: {
              logText:
                '# handlers.ts#processAIResponse 大語言模型覆述意圖: topic ',
              pattern: /好的，您的選擇是?(\d+)。/,
              targetElementId: 'topic',
              inputType: 'input',
              obtainedState: 'topicObtained',
            },
          }

          const handleAIResponse = (
            answerType: string,
            currentAssistantMessage: string,
            answerInput: HTMLTextAreaElement
          ): void => {
            const config = RESPONSE_CONFIGS[answerType]
            if (!config) return

            console.log(config.logText)
            console.log('currentAssistantMessage:', currentAssistantMessage)

            const match = currentAssistantMessage.match(config.pattern)
            console.log('match:', match)
            const element =
              config.inputType === 'radio'
                ? (document.querySelector(
                    `input[name="${config.targetElementId}"]`
                  ) as HTMLInputElement)
                : (document.getElementById(
                    config.targetElementId
                  ) as HTMLInputElement)

            // * 基本資料完成確認
            // -> handleSendChatFn/unsubscribe 於 AI 語音完全結束後，重新提問
            if (!element) {
              if (config.targetElementId === 'confirm') {
                console.log('match:', match?.[1])
                if (
                  match?.[1].includes('正確') &&
                  !match?.[1].includes('不正確')
                ) {
                  console.log('正確')
                  answerInput.setAttribute(
                    'data-answer-input',
                    config.obtainedState
                  )
                } else {
                  console.log('不正確')
                  answerInput.setAttribute('data-answer-input', 'confirmError')
                }
              } else if (config.targetElementId === 'update') {
                console.log('match?.[1]:', match?.[1])

                const fieldMap: Record<
                  string,
                  { field: string; nextState: string }
                > = {
                  姓名: { field: 'name', nextState: 'name' },
                  性別: { field: 'sex', nextState: 'sex' },
                  年齡: { field: 'age', nextState: 'age' },
                  身高: { field: 'height', nextState: 'height' },
                  體重: { field: 'weight', nextState: 'weight' },
                } as const

                const field = match?.[1]
                  ? fieldMap[match[1] as keyof typeof fieldMap]
                  : undefined
                if (field) {
                  answerInput.setAttribute('data-answer-input', field.nextState)
                }
                // answerInput.setAttribute('data-answer-input', 'update')
              } else if (config.targetElementId === 'topic') {
                console.log('match?.[1]:', match?.[1])

                if (match?.[1]) {
                  // answerInput.setAttribute('data-answer-input', 'topicObtained')
                  const buttons = document.querySelectorAll('#options button')
                  const index = parseInt(match[1]) - 1
                  buttons[index].classList.add('choosing')
                  // 找到對應的選項按鈕並點擊
                  setTimeout(() => {
                    if (buttons[index]) {
                      // 移除所有按鈕的 choosing class
                      buttons.forEach((btn) => btn.classList.remove('choosing'))
                      ;(buttons[index] as HTMLButtonElement).click()
                    }
                  }, 500) // 延遲 0.5 秒後點擊，確保按鈕已啟用
                }
              }
              return
            }

            if (match?.[1]) {
              const value = config.valueTransformer
                ? config.valueTransformer(match[1])
                : match[1]

              // 更新 store 中的狀態
              const currentProfile = settingsStore.getState().basicProfile
              settingsStore.setState({
                basicProfile: {
                  ...currentProfile,
                  [config.targetElementId]: value,
                },
              })

              if (config.inputType === 'radio') {
                // 保留 focus 操作
                const radioButtons = document.querySelectorAll(
                  `input[name="${config.targetElementId}"]`
                ) as NodeListOf<HTMLInputElement>
                const firstRadio = radioButtons[0]
                if (firstRadio) {
                  firstRadio.focus()
                }
              } else {
                // 其他類型的 input 只保留 focus
                if (element) {
                  // element.focus()
                }
              }

              const isUpdateFlow =
                answerInput.getAttribute('data-update-flow') === 'true'

              // 修改這裡：如果是更新流程，設置為 weightObtained
              if (isUpdateFlow) {
                answerInput.setAttribute('data-answer-input', 'weightObtained')
                answerInput.removeAttribute('data-update-flow')
              } else {
                answerInput.setAttribute(
                  'data-answer-input',
                  config.obtainedState
                )
              }
              // element.focus()
            } else {
              // element.focus()
            }
          }

          // 大語言模型回應語音播放
          speakCharacter(
            aiTalks[0],
            () => {
              homeStore.setState({
                assistantMessage: currentAssistantMessage,
              })
              hs.incrementChatProcessingCount()

              const answerInput = document.getElementById(
                'answerInput'
              ) as HTMLTextAreaElement

              if (answerInput) {
                const answerType = answerInput.getAttribute('data-answer-input')

                const config = answerType ? RESPONSE_CONFIGS[answerType] : null

                if (config) {
                  const match = currentAssistantMessage.match(config.pattern)
                  if (match?.[1]) {
                    const buttons = document.querySelectorAll('#options button')
                    if (buttons.length > 0) {
                      const index = parseInt(match[1]) - 1
                      buttons[index]?.classList.add('choosing')
                    }
                  }
                }
              }

              // const answerInput = document.getElementById(
              //   'answerInput'
              // ) as HTMLTextAreaElement
              // if (answerInput) {
              //   const answerType = answerInput.getAttribute('data-answer-input')
              //   console.warn('answerType', answerType)
              //   if (answerType) {
              //     handleAIResponse(
              //       answerType,
              //       homeStore.getState().assistantMessage,
              //       answerInput
              //     )
              //   }
              // }
            },
            () => {
              const answerInput = document.getElementById(
                'answerInput'
              ) as HTMLTextAreaElement
              if (answerInput) {
                const answerType = answerInput.getAttribute('data-answer-input')
                console.warn('answerType', answerType)
                if (answerType) {
                  handleAIResponse(
                    answerType,
                    homeStore.getState().assistantMessage,
                    answerInput
                  )
                }
              }

              // const answerInput = document.getElementById(
              //   'answerInput'
              // ) as HTMLTextAreaElement

              // const isUpdateFlow =
              //   answerInput.getAttribute('data-update-flow') === 'true'

              // // 修改這裡：如果是更新流程，設置為 weightObtained
              // if (isUpdateFlow) {
              //   answerInput.setAttribute('data-answer-input', 'weightObtained')
              //   answerInput.removeAttribute('data-update-flow')
              // } else {
              //   const answerType = answerInput.getAttribute('data-answer-input')
              //   const config = answerType ? RESPONSE_CONFIGS[answerType] : null
              //   if (config) {
              //     answerInput.setAttribute(
              //       'data-answer-input',
              //       config.obtainedState
              //     )
              //   }
              // }

              hs.decrementChatProcessingCount()
            }
          )
        } else {
          // 沒有匹配的句子時跳出迴圈
          break
        }
      }

      // 當串流結束且 receivedMessage 非空時的處理
      if (done && receivedMessage.length > 0) {
        // 處理剩餘的訊息
        let aiText = `${tag} ${receivedMessage}`
        const aiTalks = textsToScreenplay([aiText])
        aiTextLog.push({ role: 'assistant', content: receivedMessage })
        sentences.push(receivedMessage)

        const currentAssistantMessage = sentences.join(' ')

        speakCharacter(
          aiTalks[0],
          () => {
            homeStore.setState({
              assistantMessage: currentAssistantMessage,
            })
            hs.incrementChatProcessingCount()
          },
          () => {
            hs.decrementChatProcessingCount()
          }
        )

        receivedMessage = ''
      }
    }
  } catch (e) {
    console.error(e)
  } finally {
    reader.releaseLock()
  }

  // 如果直前的 role 相同，將 content 結合，並排除空的 content
  let lastImageUrl = ''
  aiTextLog = aiTextLog
    .reduce((acc: Message[], item: Message) => {
      if (
        typeof item.content != 'string' &&
        item.content[0] &&
        item.content[1]
      ) {
        lastImageUrl = item.content[1].image
      }

      const lastItem = acc[acc.length - 1]
      if (lastItem && lastItem.role === item.role) {
        if (typeof item.content != 'string') {
          lastItem.content += ' ' + item.content[0].text
        } else {
          lastItem.content += ' ' + item.content
        }
      } else {
        const text =
          typeof item.content != 'string' ? item.content[0].text : item.content
        if (lastImageUrl != '') {
          acc.push({
            ...item,
            content: [
              { type: 'text', text: text.trim() },
              { type: 'image', image: lastImageUrl },
            ],
          })
          lastImageUrl = ''
        } else {
          acc.push({ ...item, content: text.trim() })
        }
      }
      return acc
    }, [])
    .filter((item) => item.content !== '')

  homeStore.setState({
    chatLog: [...currentChatLog, ...aiTextLog],
    chatProcessing: false,
  })
}

/**
 * 與助理進行對話
 * 當從畫面的聊天欄輸入時執行的處理
 */
export const handleSendChatFn =
  (errors: {
    NotConnectedToExternalAssistant: string
    APIKeyNotEntered: string
  }) =>
  async (text: string) => {
    const newMessage = text

    if (newMessage === null) return

    const ss = settingsStore.getState()
    const hs = homeStore.getState()

    if (ss.webSocketMode) {
      // 無維護狀態，可能有錯誤
      console.log('websocket mode: true')
      homeStore.setState({ chatProcessing: true })

      // WebSocket 傳送處理
      if (hs.ws?.readyState === WebSocket.OPEN) {
        // 新增並顯示使用者的發言
        const updateLog: Message[] = [
          ...hs.chatLog,
          { role: 'user', content: newMessage },
        ]
        homeStore.setState({
          chatLog: updateLog,
        })

        // WebSocket 傳送
        hs.ws.send(JSON.stringify({ content: newMessage, type: 'chat' }))
      } else {
        homeStore.setState({
          assistantMessage: errors['NotConnectedToExternalAssistant'],
          chatProcessing: false,
        })
      }
    } else {
      let systemPrompt = ss.systemPrompt

      homeStore.setState({ chatProcessing: true })
      // ユーザーの発言を追加して表示
      const messageLog: Message[] = [
        ...hs.chatLog,
        {
          role: 'user',
          content: hs.modalImage
            ? [
                { type: 'text', text: newMessage },
                { type: 'image', image: hs.modalImage },
              ]
            : newMessage,
        },
      ]
      if (hs.modalImage) {
        homeStore.setState({ modalImage: '' })
      }
      homeStore.setState({ chatLog: messageLog })

      // TODO: 傳送給 AI 的訊息加工和處理很糕糕，需要修正
      // 圖像只傳送最近的一張
      const processedMessageLog = messageLog.map((message, index) => ({
        role: ['assistant', 'user', 'system'].includes(message.role)
          ? message.role
          : 'assistant',
        content:
          index === messageLog.length - 1
            ? message.content
            : Array.isArray(message.content)
              ? message.content[0].text
              : message.content,
      }))

      // * ############################################################
      // * 為特定的使用者回答，在傳給 AI 解析前，修改合適系統提示詞
      // * ############################################################
      interface IntentConfig {
        systemContent: string
        logText?: string
      }

      const INTENT_CONFIGS: Record<string, IntentConfig> = {
        name: {
          logText: '# handlers.ts#handleSendChatFn 大語言模型解析意圖: name ',
          systemContent: `你是一個友善的AI助理，設計用來與台灣用戶進行對話。你的任務是以親近的朋友身份與用戶互動，使用台灣常用的繁體中文和口語表達。
      以下是用戶提供的姓名或稱呼：
      
      <姓名>
      {{姓名}}
      </姓名>
      
      {{姓名}}是 user 對他姓名或稱呼的回答，通常是兩到四個字，請你根據使用者輸入的內容，判斷他的姓名或稱呼，並且回答：「好的，我可以稱呼您是{{姓名}}」，不要講其他無關的話。
      
      例如：
      user: 張曼娟
      請回答:「好的，我可以稱呼您是張曼娟」
      
      user: 我是許家寶
      請回答:「好的，我可以稱呼您是許家寶」
      
      請記住：
      - 使用非正式、親切的語氣。
      - 回答時只使用繁體中文。
      - 不要使用敬語或正式用語。
      - 確保回應簡潔，只包含指定的句子，不要添加其他內容。
      
      請開始你的回應。`,
        },
        sex: {
          logText: '# handlers.ts#handleSendChatFn 大語言模型解析意圖: sex ',
          systemContent: `You will act and converse as one of user's close friends from now on.
      這邊是 user 對他性別的回答，如果回答能夠明確判斷出屬於男性或女性，請回答：「好的，您的性別是{性別}」，如果無法判斷，請回答：「我無法判斷您的性別，麻煩再說一遍。」，不要講其他無關的話。
      
      Please respond with the most appropriate conversation line.
      Please answer in Traditional Chinese and use Mandarin commonly used in Taiwan as much as possible.
      Do not use polite or formal speech.`,
        },
        age: {
          logText: '# handlers.ts#handleSendChatFn 大語言模型解析意圖: age ',
          systemContent: `You will act and converse as one of user's close friends from now on.
      這邊是 user 對他年齡的回答，請你判斷他回答的年齡的數字，通常介於 0 到 150 歲之間，並且回答：「好的，您今年{年齡}歲」，不要講其他無關的話。
      
      例如：
      user: 我今年{30}歲
      請回答：「好的，您今年{30}歲」
      
      user: {1967}年生
      <不要講出來>一步一步思考: 如果回答{某某}年生，像這個例子，這個數字通常指的是西元的年，{1967} 年通常是西元{1967}年，今年是{2024}年，{2024} - {1967} = {57}</不要講出來>
      請直接回答年齡：「好的，您今年{57}歲」，不要講其他無關的話。
      
      user: 民國{50}年生
      <不要講出來>一步一步思考: 如果回答{某某}年生，像這個例子，這個數字通常指的是民國的年，{50}年生通常指的是民國50年出生，今年是民國 113 年，{113} - {50} = {63}</不要講出來>
      請直接回答年齡：「好的，您今年{63}歲」，不要講其他無關的話。
      
      user: {60}年次
      <不要講出來>一步一步思考: 如果回答{某某}年次，像這個例子，這個數字通常指的是民國的年，{60}年次通常指的是民國60年出生，今年是民國 113 年，{113} - {60} = {53}</不要講出來>
      請直接回答年齡：「好的，您今年{53}歲」，不要講其他無關的話。
      
      Please answer in Traditional Chinese and use Mandarin commonly used in Taiwan as much as possible.
      Do not use polite or formal speech.
      Now, let's start the conversation.`,
        },
        height: {
          logText: '# handlers.ts#handleSendChatFn 大語言模型解析意圖: height ',
          systemContent: `You will act and converse as one of user's close friends from now on.
      這邊是 user 對他身高的回答，請你判斷他回答的身高的數字，這個身高通常介於 0 到 300 公分之間，並且回答：「好的，您的身高是{身高}公分」，不要講其他無關的話。
      
      請記住：
      - 使用非正式、親切的語氣。
      - 回答時只使用繁體中文。
      - 不要使用敬語或正式用語。
      - 確保回應簡潔，只包含指定的句子，不要添加其他內容。
      
      請開始你的回應。`,
        },
        weight: {
          logText: '# handlers.ts#handleSendChatFn 大語言模型解析意圖: weight ',
          systemContent: `You will act and converse as one of user's close friends from now on.
      這邊是 user 對他體重的回答，請你判斷他回答的���重的數字，這個體重通常介於 0 到 300 公斤之間，並且回答：「好的，您的體重是{體重}公斤」，不要講其他無關的話。

      請記住：
      - 使用非正式、親切的語氣。
      - 回答時只使用繁體中文。
      - 不要使用敬語或正式用語。
      - 確保回應簡潔，只包含指定的句子，不要添加其他內容。
      
      請開始你的回應。`,
        },
        confirm: {
          logText:
            '# handlers.ts#handleSendChatFn 大語言模型解析意圖: confirm ',
          systemContent: `You will act and converse as one of user's close friends from now on.
          這邊是 user 對資料正確與否的回答，請你判斷他的意思，是正確還是不正確(需要修改)，如果正確，就回答：「好的，{資料正確與否}，那我們開始囉！」，如果需要修改，就回答：「好的，{資料正確與否}，請稍候！」，不要講其他無關的話。

例如：
user 回答：正確喔
請回答：「好的，資料正確，那我們開始囉！」

user 回答：不對
請回答：「好的，資料不對，請稍候！」
          
          請記住：
          - 使用非正式、親切的語氣。
          - 回答時只使用繁體中文。
          - 不要使用敬語或正式用語。
          - 確保回應簡潔，只包含指定的句子，不要添加其他內容。
          
          請開始你的回應。`,
        },
        update: {
          logText: '# handlers.ts#handleSendChatFn 大語言模型解析意圖: update ',
          systemContent: `You will act and converse as one of user's close friends from now on.
          這邊是 user 對他想要修改的欄位，請你判斷他想要修改的是「姓名」、「性別」、「年齡」、「身高」、「體重」的哪個欄位，並且回答：「好的，您想要修改{欄位}資料為多少？」，不要講其他無關的話。
          
          請記住：
          - 使用非正式、親切的語氣。
          - 回答時只使用繁體中文。
          - 不要使用敬語或正式用語。
          - 確保回應簡潔，只包含指定的句子，不要添加其他內容。
          
          請開始你的回應。`,
        },
        topic: {
          logText: '# handlers.ts#handleSendChatFn 大語言模型解析意圖: topic ',
          systemContent: `You will act and converse as one of user’s close friends from now on.
這邊是 user 對問題選項的回答，請你判斷他的意思，是選擇第幾個選項，並且回答：「好的，您的選擇是{選擇}。」，不要講其他無關的話。

例如：
user 回答：完全不會
請回答：「好的，您的選擇是1。」

user 回答：從來沒有
請回答：「好的，您的選擇是1。」

user 回答：稍微會
請回答：「好的，您的選擇是2。」

user 回答：偶爾有
請回答：「好的，您的選擇是2。」

user 回答：中等程度會
請回答：「好的，您的選擇是3。」

user 回答：一半有一半沒有
請回答：「好的，您的選擇是3。」

user 回答：很會
請回答：「好的，您的選擇是4。」

user 回答：常常有
請回答：「好的，您的選擇是4。」

user 回答：最嚴重會
請回答：「好的，您的選擇是5。」

user 回答：一直都有
請回答：「好的，您的選擇是5。」

請記住：
- 回答時只使用繁體中文。
- 不要使用敬語或正式用語。
- 確保回應簡潔，只包含指定的句子，不要添加其他內容。

請開始你的回應。`,
        },
      }

      const handleIntent = (
        answerType: string | null,
        messageLog: Message[],
        newMessage: string,
        processedMessageLog: Message[],
        systemPrompt: string
      ): Message[] => {
        if (!answerType || !INTENT_CONFIGS[answerType]) {
          return [
            { role: 'system', content: systemPrompt },
            ...processedMessageLog.slice(-10),
          ]
        }

        const config = INTENT_CONFIGS[answerType]

        if (config.logText) {
          console.log(config.logText)
          // console.log('即將傳送給 AI 的訊息內容:', newMessage)
        }

        messageLog.length = 0
        messageLog[0] = { role: 'user', content: newMessage }

        console.log('即將傳送給 AI 的user回答內容:', newMessage)
        return [
          { role: 'system', content: config.systemContent },
          ...messageLog,
        ]
      }

      const answerInput = document.getElementById(
        'answerInput'
      ) as HTMLTextAreaElement

      let messages: Message[] = []

      if (answerInput) {
        messages = handleIntent(
          answerInput.getAttribute('data-answer-input'),
          messageLog,
          newMessage,
          processedMessageLog,
          systemPrompt
        )
      } else {
        messages = [
          { role: 'system', content: systemPrompt },
          ...processedMessageLog.slice(-10),
        ]
      }

      // const messages: Message[] = [
      //   {
      //     role: 'system',
      //     content: systemPrompt,
      //   },
      //   ...processedMessageLog.slice(-10),
      // ]

      // * ############################################################
      // * 語音播放完成後，根據 data-answer-input 的值，進行下一步
      // * ############################################################
      interface InputStateConfig {
        type: 'error' | 'obtained'
        errorConfig?: {
          logMessage: string
          targetElementId: string
          nextState?: string
        }
        obtainedConfig?: {
          logMessage: string
          voicePrompt: string
          nextElementId: string
          nextState: string
        }
      }

      const INPUT_STATE_CONFIGS: Record<string, InputStateConfig> = {
        name: {
          type: 'error',
          errorConfig: {
            logMessage: 'data-answer-input parsing name error!',
            targetElementId: 'name',
            nextState: 'name',
          },
        },
        nameObtained: {
          type: 'obtained',
          obtainedConfig: {
            logMessage:
              '# handlers.ts#processAIResponse 輸入完成: nameObtained ',
            voicePrompt: '接下來請告訴我您的性別',
            nextElementId: 'sex',
            nextState: 'sex',
          },
        },
        sex: {
          type: 'error',
          errorConfig: {
            logMessage: 'data-answer-input parsing sex error!',
            targetElementId: 'sex',
          },
        },
        sexObtained: {
          type: 'obtained',
          obtainedConfig: {
            logMessage:
              '# handlers.ts#processAIResponse 輸入完成: sexObtained ',
            voicePrompt: '請問您的年齡',
            nextElementId: 'age',
            nextState: 'age',
          },
        },
        age: {
          type: 'error',
          errorConfig: {
            logMessage: 'data-answer-input parsing age error!',
            targetElementId: 'age',
          },
        },
        ageObtained: {
          type: 'obtained',
          obtainedConfig: {
            logMessage:
              '# handlers.ts#processAIResponse 輸入完成: ageObtained ',
            voicePrompt: '請問您身高多少？',
            nextElementId: 'height',
            nextState: 'height',
          },
        },
        height: {
          type: 'error',
          errorConfig: {
            logMessage: 'data-answer-input parsing height error!',
            targetElementId: 'height',
          },
        },
        heightObtained: {
          type: 'obtained',
          obtainedConfig: {
            logMessage:
              '# handlers.ts#processAIResponse 輸入完成: heightObtained ',
            voicePrompt: '請問您的體重',
            nextElementId: 'weight',
            nextState: 'weight',
          },
        },
        weight: {
          type: 'error',
          errorConfig: {
            logMessage: 'data-answer-input parsing weight error!',
            targetElementId: 'weight',
          },
        },
        weightObtained: {
          type: 'obtained',
          obtainedConfig: {
            logMessage:
              '# handlers.ts#processAIResponse 輸入完成: weightObtained ',
            voicePrompt: '謝謝您的回答，請確認以上資料是否正確',
            nextElementId: 'confirm',
            nextState: 'confirm',
          },
        },
        confirm: {
          type: 'error',
          errorConfig: {
            logMessage: 'data-answer-input parsing confirm error!',
            targetElementId: 'confirm',
          },
        },
      }

      class InputStateHandler {
        private static async triggerPickUpButton(
          pickUpButton: HTMLElement | null
        ): Promise<void> {
          if (!pickUpButton) return

          const isProcessing =
            pickUpButton?.getAttribute('data-processing') === 'true'
          console.log('當前錄音狀態:', isProcessing)

          if (!isProcessing) {
            pickUpButton.click()
            const newProcessingState =
              pickUpButton?.getAttribute('data-processing') === 'true'
            console.log('點擊後錄音狀態:', newProcessingState)
          }
        }

        private static handleErrorState(
          config: NonNullable<InputStateConfig['errorConfig']>,
          answerInput: HTMLTextAreaElement,
          pickUpButton: HTMLElement | null
        ): void {
          console.log(config.logMessage)

          // const targetElement = document.getElementById(
          //   config.targetElementId
          // ) as HTMLElement
          // if (targetElement) {
          //   targetElement.focus()
          // }

          if (config.nextState) {
            const isUpdateFlow =
              answerInput.getAttribute('data-update-flow') === 'true'
            answerInput.setAttribute(
              'data-answer-input',
              isUpdateFlow ? 'confirm' : config.nextState
            )
            if (isUpdateFlow) {
              answerInput.removeAttribute('data-update-flow')
            }
          }

          this.triggerPickUpButton(pickUpButton)
        }

        private static handleObtainedState(
          config: NonNullable<InputStateConfig['obtainedConfig']>,
          answerInput: HTMLTextAreaElement,
          pickUpButton: HTMLElement | null,
          voiceController: any
        ): void {
          console.warn(config.logMessage)

          voiceController.play(
            config.voicePrompt,
            false,
            () => console.log(`${config.nextElementId} 問題開始`),
            () => {
              if (config.nextState) {
                const isUpdateFlow =
                  answerInput.getAttribute('data-update-flow') === 'true'
                answerInput.setAttribute(
                  'data-answer-input',
                  isUpdateFlow ? 'confirm' : config.nextState
                )
                if (isUpdateFlow) {
                  answerInput.removeAttribute('data-update-flow')
                }
              }

              // const nextElement = document.getElementById(config.nextElementId)
              // if (nextElement) {
              //   nextElement.focus()
              // }

              this.triggerPickUpButton(pickUpButton)
            }
          )
        }

        static handleInputState(
          currentState: string | null,
          answerInput: HTMLTextAreaElement,
          pickUpButton: HTMLElement | null,
          voiceController: any
        ): void {
          if (!currentState) return

          const config = INPUT_STATE_CONFIGS[currentState]
          if (!config) return

          if (config.type === 'error' && config.errorConfig) {
            this.handleErrorState(config.errorConfig, answerInput, pickUpButton)
          } else if (config.type === 'obtained' && config.obtainedConfig) {
            this.handleObtainedState(
              config.obtainedConfig,
              answerInput,
              pickUpButton,
              voiceController
            )
          }
        }
      }

      try {
        // 創建監控並保存取消訂閱函數
        createChatProcessingMonitor(() => {
          console.log('AI 回答完全結束，包含所有語音播放')

          const pickUpButton = document.getElementById('pickUp')

          if (answerInput) {
            InputStateHandler.handleInputState(
              answerInput.getAttribute('data-answer-input'),
              answerInput,
              pickUpButton,
              voiceController
            )

            switch (answerInput.getAttribute('data-answer-input')) {
              case 'confirmObtained':
                console.log('開始答題')
                document.getElementById('basicInfoSubmit')?.click()
                break
              case 'confirmError':
                console.log('資料有誤，請重新輸入')
                // todo: 重新輸入邏輯
                voiceController.play(
                  '請問您要修改哪個欄位？',
                  false,
                  () => console.log(`詢問修改欄位`),
                  () => {
                    console.log('詢問修改欄位 結束')
                    answerInput.setAttribute('data-answer-input', 'update')
                    answerInput.setAttribute('data-update-flow', 'true')
                    pickUpButton?.click()
                  }
                )

                // 1. 播放語音提示，詢問使用者要重新輸入哪個資料
                // 2. 將 data-answer-input 設為 update
                // 3. 根據系統提示詞規則，判斷使用者要重新輸入哪個欄位資料
                // 4. 播放AI語音覆述，好的，您想要修改{欄位}資料
                // 5. 將 data-answer-input 設為修改欄位的{欄位-修改}狀態，並讓該資料的 input 可以 focus
                // // 1. 將 data-answer-input 設為 'name'
                // // 2. 將 answerInput 的 value 清空
                // // 3. 讓 answerInput 重新 focus
                // answerInput.setAttribute('data-answer-input', 'name')
                // answerInput.value = ''
                // answerInput.focus()
                break
            }
          }
        })

        await processAIResponse(messageLog, messages)
      } catch (e) {
        console.error(e)
      }

      homeStore.setState({ chatProcessing: false })
    }
  }

/**
 * WebSocketからのテキストを受信したときの処理
 */
export const handleReceiveTextFromWsFn =
  () => async (text: string, role?: string, state?: string) => {
    if (text === null || role === undefined) return

    const ss = settingsStore.getState()
    const hs = homeStore.getState()

    if (!ss.webSocketMode) {
      console.log('websocket mode: false')
      return
    }

    console.log('websocket mode: true')
    homeStore.setState({ chatProcessing: true })

    if (role !== 'user') {
      const updateLog: Message[] = [...hs.chatLog]

      if (state === 'start') {
        // startの場合は何もしない（textは空文字のため）
        console.log('Starting new response')
        homeStore.setState({ wsStreaming: false })
      } else if (
        updateLog.length > 0 &&
        updateLog[updateLog.length - 1].role === role &&
        hs.wsStreaming
      ) {
        // 既存のメッセージに追加
        updateLog[updateLog.length - 1].content += text
      } else {
        // 新しいメッセージを追加
        updateLog.push({ role: role, content: text })
        homeStore.setState({ wsStreaming: true })
      }

      if (role === 'assistant' && text !== '') {
        let aiText = `${'[neutral]'} ${text}`
        try {
          const aiTalks = textsToScreenplay([aiText])

          // 逐句生成語音並播放，顯示回覆
          speakCharacter(
            aiTalks[0],
            () => {
              homeStore.setState({
                chatLog: updateLog,
                assistantMessage: (() => {
                  const content = updateLog[updateLog.length - 1].content
                  return typeof content === 'string' ? content : ''
                })(),
              })
            },
            () => {
              // hs.decrementChatProcessingCount()
            }
          )
        } catch (e) {
          console.error('Error in speakCharacter:', e)
        }
      } else {
        homeStore.setState({
          chatLog: updateLog,
        })
      }

      if (state === 'end') {
        // レスポンスの終了処理
        console.log('Response ended')
        homeStore.setState({ wsStreaming: false })
        homeStore.setState({ chatProcessing: false })
      }
    }

    homeStore.setState({ chatProcessing: state !== 'end' })
  }

// 新增一個訂閱管理器
export const createChatProcessingMonitor = (onComplete?: () => void) => {
  let isMonitoring = false
  let unsubscribed = false

  const unsubscribe = homeStore.subscribe((state) => {
    if (unsubscribed) return

    const count = state.chatProcessingCount
    // 當 chatProcessingCount 開始增加時，開始監控
    if (count > 0 && !isMonitoring) {
      isMonitoring = true
      console.log('開始監控 chatProcessingCount')
    }

    if (count === 0 && isMonitoring) {
      isMonitoring = false
      console.log('AI 回答完全結束')
      onComplete?.()
      unsubscribed = true
      unsubscribe()
    }
  })

  return unsubscribe
}
