import axios from 'axios'
import { Message } from '../messages/messages'

export async function getLocalLLMChatResponseStream(
  messages: Message[],
  localLlmUrl: string,
  model?: string
) {
  const response = await axios.post(
    localLlmUrl.replace(/\/$/, ''),
    {
      model: model,
      messages: messages,
      stream: true,
    },
    {
      responseType: 'stream',
    }
  )

  const stream = response.data

  const res = new ReadableStream({
    async start(controller: ReadableStreamDefaultController) {
      let accumulatedChunks = ''
      try {
        for await (const chunk of stream) {
          accumulatedChunks += chunk
          // console.log(accumulatedChunks);
          try {
            // 解析累積的資料塊
            const trimmedChunks = accumulatedChunks.trimStart()
            const data = JSON.parse(trimmedChunks.slice(6))

            // 如果 JSON 解析成功，提取必要的資料
            if (data.choices && data.choices.length > 0) {
              const content = data.choices[0].delta.content
              controller.enqueue(content)
              accumulatedChunks = '' // JSON 解析成功，重置資料塊
            }
          } catch (error) {
            // console.log("accumulatedChunks: `" + accumulatedChunks + "`");
            // JSON 不完整，繼續累積資料塊
          }
        }
      } catch (error) {
        controller.error(error)
      } finally {
        controller.close()
      }
    },
  })

  return res
}
