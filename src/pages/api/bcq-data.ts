import type { NextApiRequest, NextApiResponse } from 'next'
import path from 'path'
import fs from 'fs/promises'

type Data = {
  bcq?: any
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const jsonPath = path.join(process.cwd(), 'src/data/data.json')

    try {
      await fs.access(jsonPath)
    } catch (error) {
      console.error('找不到 data.json 檔案:', jsonPath)
      return res.status(404).json({ error: '找不到 data.json 檔案' })
    }

    const jsonData = await fs.readFile(jsonPath, 'utf8')
    const data = JSON.parse(jsonData)

    res.status(200).json({ bcq: data })
  } catch (error) {
    console.error('讀取 bcq data 時發生錯誤:', error)
    res.status(500).json({ error: '讀取 bcq data 失敗' })
  }
}
