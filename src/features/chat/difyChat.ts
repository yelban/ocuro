import settingsStore from '@/features/stores/settings'
import { Message } from '../messages/messages'
import i18next from 'i18next'

function handleApiError(errorCode: string): string {
  const languageCode = settingsStore.getState().selectLanguage
  i18next.changeLanguage(languageCode)
  return i18next.t(`Errors.${errorCode || 'AIAPIError'}`)
}

export async function getDifyChatResponseStream(
  messages: Message[],
  apiKey: string,
  url: string,
  conversationId: string
): Promise<ReadableStream<string>> {
  const response = await fetch('/api/difyChat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: messages[messages.length - 1].content,
      apiKey,
      url,
      conversationId,
      stream: true,
    }),
  })

  try {
    if (!response.ok) {
      const responseBody = await response.json()
      throw new Error(
        `API request to Dify failed with status ${response.status} and body ${responseBody.error}`,
        { cause: { errorCode: responseBody.errorCode } }
      )
    }

    return new ReadableStream({
      async start(controller) {
        if (!response.body) {
          throw new Error('API response from Dify is empty', {
            cause: { errorCode: 'AIAPIError' },
          })
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder('utf-8')
        let buffer = ''

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            buffer += decoder.decode(value, { stream: true })

            // 以換行分割，將最後不完整的行保存在緩衝區中
            let lines = buffer.split('\n')
            buffer = lines.pop() || ''

            lines.forEach((line) => {
              if (line.startsWith('data:')) {
                const jsonStr = line.slice(5) // 移除 'data:' 前綴
                try {
                  const data = JSON.parse(jsonStr)
                  if (
                    data.event === 'agent_message' ||
                    data.event === 'message'
                  ) {
                    controller.enqueue(data.answer)
                    settingsStore.setState({
                      difyConversationId: data.conversation_id,
                    })
                  }
                } catch (error) {
                  console.error('Error parsing JSON:', error)
                }
              }
            })
          }
        } catch (error) {
          console.error(`Error fetching Dify API response:`, error)

          return new ReadableStream({
            start(controller) {
              const errorMessage = handleApiError('AIAPIError')
              controller.enqueue(errorMessage)
              controller.close()
            },
          })
        } finally {
          controller.close()
          reader.releaseLock()
        }
      },
    })
  } catch (error: any) {
    const errorMessage = handleApiError(error.cause.errorCode)
    return new ReadableStream({
      start(controller) {
        controller.enqueue(errorMessage)
        controller.close()
      },
    })
  }
}
