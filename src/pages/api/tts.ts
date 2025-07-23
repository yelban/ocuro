import { googleTts } from '@/features/googletts/googletts'

import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  audio: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const message = req.body.message
  const ttsType = req.body.ttsType

  const voice = await googleTts(message, ttsType)

  res.status(200).json(voice)
}
