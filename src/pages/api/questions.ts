import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { sex, age } = req.query

  if (!sex || !age) {
    return res.status(400).json({ error: 'Missing required parameters' })
  }

  try {
    let data
    // const isDev = process.env.NODE_ENV === 'development'
    const isDev = false

    if (isDev) {
      const fs = require('fs')
      const path = require('path')
      const jsonPath = path.join(process.cwd(), 'src/data/questions.json')

      console.log('JSON 檔案路徑:', jsonPath)

      if (!fs.existsSync(jsonPath)) {
        throw new Error(`找不到檔案: ${jsonPath}`)
      }

      data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
    } else {
      // 從遠端 API 取得資料
      const response = await fetch(
        `https://dev-api.auohealth.com/api/v1/bcqs/questions?sex=${sex}&age=${age}`
      )
      data = await response.json()
      console.log('data', data)
    }

    // 檢查 data 是否為字串類型
    if (typeof data === 'string') {
      data = data.replace(/^我/g, '你').replace(/我/g, '你')
    } else if (typeof data === 'object') {
      // 如果是物件或陣列，需要先轉成字串再處理
      data = JSON.stringify(data)
      data = data.replace(/^我/g, '你').replace(/我/g, '你')
      data = JSON.parse(data)
    }

    res.status(200).json(data)
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({
      error: 'Failed to fetch questions',
      details: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
