import { VRMExpression, VRMExpressionPresetName } from '@pixiv/three-vrm'

// ChatGPT API
export type Message = {
  role: string // "assistant" | "system" | "user";
  content:
    | string
    | [{ type: 'text'; text: string }, { type: 'image'; image: string }] // 多模態擴展
}

const talkStyles = [
  'talk',
  'happy',
  'sad',
  'angry',
  'fear',
  'surprised',
] as const
export type TalkStyle = (typeof talkStyles)[number]

export type Talk = {
  style: TalkStyle
  speakerX: number
  speakerY: number
  message: string
  buffer?: ArrayBuffer
}

const emotions = ['neutral', 'happy', 'angry', 'sad', 'relaxed'] as const
type EmotionType = (typeof emotions)[number] & VRMExpressionPresetName

/**
 * 結合發話文字、語音情感與模型情感表現的組合
 */
export type Screenplay = {
  expression: EmotionType
  talk: Talk
}

export const splitSentence = (text: string): string[] => {
  const splitMessages = text.split(/(?<=[。．！？\n])/g)
  return splitMessages.filter((msg) => msg !== '')
}

export const textsToScreenplay = (texts: string[]): Screenplay[] => {
  const screenplays: Screenplay[] = []
  let prevExpression = 'neutral'
  for (let i = 0; i < texts.length; i++) {
    const text = texts[i]

    const match = text.match(/\[(.*?)\]/)

    const tag = (match && match[1]) || prevExpression

    const message = text.replace(/\[(.*?)\]/g, '')

    let expression = prevExpression
    if (emotions.includes(tag as any)) {
      expression = tag
      prevExpression = tag
    }

    screenplays.push({
      expression: expression as EmotionType,
      talk: {
        style: emotionToTalkStyle(expression as EmotionType),
        speakerX: 0,
        speakerY: 0,
        message: message,
      },
    })
  }

  return screenplays
}

const emotionToTalkStyle = (emotion: EmotionType): TalkStyle => {
  switch (emotion) {
    case 'angry':
      return 'angry'
    case 'happy':
      return 'happy'
    case 'sad':
      return 'sad'
    default:
      return 'talk'
  }
}
