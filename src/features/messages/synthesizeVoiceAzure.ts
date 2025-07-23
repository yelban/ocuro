// types.ts
export interface AzureTTSRequest {
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

export interface AzureTTSResponse {
  audio: ArrayBuffer
  contentType: string
}

// azureTtsClient.ts
export async function synthesizeVoiceAzureApi({
  message,
  apiKey,
  region,
  language,
  voice,
  style,
  role,
  rate,
  pitch,
  volume,
}: AzureTTSRequest): Promise<AzureTTSResponse> {
  try {
    message = message
      .replace(/乾/g, '甘')
      .replace(/重重的/g, '仲仲的')
      .replace(/質/g, '值')
      .replace(/吧/g, '巴')
      .replace(/天旋地轉/g, '天旋帝轉')
      .replace(/啦/g, '拉')

    const body = {
      message,
      apiKey,
      region,
      language,
      voice,
      style,
      role,
      rate,
      pitch,
      volume,
    }

    // console.log('Azure TTS Request body:', {
    //   ...body,
    //   apiKey: apiKey.slice(0, 5) + '...', // 只顯示 API Key 前五個字元
    // })

    const res = await fetch('/api/azureTts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    // console.log('Response:', {
    //   status: res.status,
    //   statusText: res.statusText,
    //   headers: Object.fromEntries(res.headers.entries()),
    //   type: res.type,
    //   url: res.url,
    // })

    // const clone = res.clone()
    // const responseText = await clone.text()
    // console.log('Response body:', responseText)

    // 檢查響應狀態
    if (!res.ok) {
      const errorText = await res.text()
      console.error('Azure TTS API Error:', errorText)
      throw new Error(`Failed to synthesize speech: ${errorText}`)
    }

    // // 新增：檢查響應頭
    // console.log('Response headers:', {
    //   contentType: res.headers.get('content-type'),
    //   contentLength: res.headers.get('content-length'),
    // })

    // 直接獲取 ArrayBuffer
    const audioData = await res.arrayBuffer()

    // 驗證音頻數據
    if (!audioData || audioData.byteLength === 0) {
      throw new Error('Received empty audio data from Azure TTS')
    }

    // // 記錄接收到的音頻數據
    // console.log('Received audio data:', {
    //   byteLength: audioData.byteLength,
    //   contentType: res.headers.get('content-type'),
    // })

    return {
      audio: audioData,
      contentType: res.headers.get('content-type') || 'audio/wav',
    }
  } catch (error) {
    console.error('Error in synthesizeVoiceAzureApi:', error)
    throw error
  }
}
