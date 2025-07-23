interface AzureTTSOptions {
  message: string
  apiKey: string
  region: string
  language?: string
  voice?: string
  style?: string
  role?: string
  rate?: number
  pitch?: number
  volume?: number
}

export async function azureTts({
  message,
  apiKey,
  region,
  language = 'zh-TW',
  voice = 'zh-TW-HsiaoChenNeural',
  style = 'neutral',
  role = 'default',
  rate = 1,
  pitch = 1,
  volume = 100,
}: AzureTTSOptions): Promise<ArrayBuffer> {
  const endpoint = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`

  const ssml = `
    <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" 
      xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="${language}">
      <voice name="${voice}">
        <mstts:silence type="Sentenceboundary" value="10ms"/>
        <mstts:express-as style="${style}" role="${role}">
          <prosody rate="${rate}" pitch="${pitch}%" volume="${volume}%">
            ${message}
          </prosody>
        </mstts:express-as>
      </voice>
    </speak>`

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'raw-16khz-16bit-mono-pcm',
        'User-Agent': 'YourApp',
      },
      body: ssml,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.arrayBuffer()
  } catch (error) {
    console.error('Azure TTS error:', error)
    throw error
  }
}
