import { NextApiRequest, NextApiResponse } from 'next'
import { azureTts } from '@/features/azuretts/azuretts'

// 定義請求體的類型
export interface AzureTTSRequestBody {
  message: string
  apiKey: string
  region: string
  language: string
  voice: string
  style: string
  role: string
  rate: number
  pitch: number
  volume: number
}

// 定義響應的類型
export type AzureTTSResponse =
  | {
      error?: string
      audio?: ArrayBuffer
    }
  | ArrayBuffer

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AzureTTSResponse>
) {
  // 1. 獲取 API Key
  if (!req.body.apiKey) {
    req.body.apiKey = process.env.AZURE_TTS_API_KEY
  }
  // console.log('Azure TTS API Key:', req.body.apiKey)

  // 2. 方法驗證
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // 3. 請求體驗證
    const body = req.body as AzureTTSRequestBody
    if (!body.message || !body.apiKey || !body.region) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // 4. 記錄請求（排除敏感信息）
    // console.log('Azure TTS API received params:', {
    //   message: body.message,
    //   region: body.region,
    //   language: body.language,
    //   voice: body.voice,
    //   style: body.style,
    //   role: body.role,
    //   rate: body.rate,
    //   pitch: body.pitch,
    //   volume: body.volume,
    //   hasApiKey: body.apiKey.slice(0, 5) + '...',
    // })

    // 5. 調用 Azure TTS 服務
    const voice = await azureTts({
      message: body.message,
      apiKey: body.apiKey,
      region: body.region,
      language: body.language,
      voice: body.voice,
      style: body.style,
      role: body.role,
      rate: body.rate,
      pitch: body.pitch,
      volume: body.volume,
    })

    // 6. 錯誤處理
    if (!voice) {
      throw new Error('No audio data received from Azure TTS')
    }

    // 7. 設置正確的響應頭
    res.setHeader('Content-Type', 'audio/wav')
    res.setHeader('Content-Length', voice.byteLength)

    // 8. 記錄發送的音頻數據
    // console.log('Sending audio data:', {
    //   byteLength: voice.byteLength,
    //   audio: voice,
    // })

    // 9. 直接發送音頻數據
    return res.status(200).send(Buffer.from(voice))
  } catch (error) {
    console.error('Azure TTS API error:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred'
    return res.status(500).json({ error: errorMessage })
  }
}
