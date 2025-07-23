import type { NextApiRequest, NextApiResponse } from 'next'

interface InferencePayload {
  user_id: string
  age: number
  sex: string
  height: number
  weight: number
  answers: {
    [key: string]: number
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const payload: InferencePayload = req.body

    if (typeof payload.age === 'string') {
      payload.age = parseInt(payload.age, 10)
    }

    if (isNaN(payload.age)) {
      return res.status(400).json({ error: 'Invalid age value' })
    }

    // const isDev = process.env.NODE_ENV === 'development'
    const isDev = false
    let data

    if (isDev) {
      // 開發環境：從本地 JSON 檔案讀取模擬資料
      const fs = require('fs')
      const path = require('path')
      const jsonPath = path.join(process.cwd(), 'src/data/inference.json')
      data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
    } else {
      // 生產環境：呼叫遠端 API
      const response = await fetch(
        'https://dev-api.auohealth.com/api/v1/bcqs/type/inference',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      )
      data = await response.json()
    }

    res.status(200).json(data)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inference result' })
  }
}
