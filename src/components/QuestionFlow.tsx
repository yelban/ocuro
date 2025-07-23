import { useState, useEffect } from 'react'
import { QuestionStep } from './QuestionStep'
import { voiceController } from '@/features/messages/voiceController'
import homeStore from '@/features/stores/home'

type Question = {
  id: number
  question: string
  options: {
    value: number
    label: string
  }[]
}

// 定義 BasicInfo 類型
type BasicInfo = {
  sex: string
  // birthDate: string
  age: number
  answers: Record<number, number>
  name: string
  height: number
  weight: number
}

// 首先定義並導出 QuestionAnswer 介面
export interface QuestionAnswer {
  questionId: number
  value: number
}

type Props = {
  onComplete: (answers: Record<string, number>) => void
  sex: 'M' | 'F'
  // birthDate: string
  age: number
}

export const QuestionFlow = ({ onComplete, sex, age }: Props) => {
  // const [questions, setQuestions] = useState<Question[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const audioPlaying = homeStore((s) => s.audioPlaying)
  const questions = homeStore((s) => s.questions)

  // 添加停止語音播放的函數
  const stopVoice = () => {
    voiceController.stopAll()
    homeStore.setState({ audioPlaying: false })
  }

  // 在組件卸載時停止語音播放
  useEffect(() => {
    return () => {
      stopVoice()
    }
  }, [])

  useEffect(() => {
    if (!isLoading && questions.length >= 0 && !audioPlaying) {
      // 統一的播放邏輯
      voiceController.play(
        questions[currentStep].question,
        false,
        () => {
          console.log(`開始播放問題: ${currentStep + 1}`)
          // 先停止麥克風收音
          const pickUpButton = document.getElementById('pickUp')
          const micIcon = pickUpButton?.querySelector('pixiv-icon')
          const isMicRecording = micIcon?.getAttribute('name') === '24/Dot'
          if (isMicRecording) {
            pickUpButton?.click()
          }
          document
            .getElementById('answerInput')
            ?.setAttribute('data-answer-input', 'topic')
        },
        () => {
          console.log(`問題: ${currentStep + 1} 播放結束`)
          // 只有在不是最後一題且沒有選項被按下時時才自動開啟麥克風
          console.log('currentStep:', currentStep)
          console.log('questions.length:', questions.length)
          if (currentStep <= questions.length - 1) {
            const answerInput = document.getElementById('answerInput')
            const isAnswerObtained =
              answerInput?.getAttribute('data-answer-input') === 'topicObtained'

            if (!isAnswerObtained) {
              setTimeout(() => {
                const pickUpButton = document.getElementById('pickUp')
                const micIcon = pickUpButton?.querySelector('pixiv-icon')
                const isMicRecording =
                  micIcon?.getAttribute('name') === '24/Dot'
                if (!isMicRecording) {
                  pickUpButton?.click()
                }
              }, 100)
            }
          }
        }
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, questions, currentStep])

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        // // 計算年齡
        // const birthYear = new Date(birthDate).getFullYear()
        // const currentYear = new Date().getFullYear()
        // const age = currentYear - birthYear

        const response = await fetch(`/api/questions?sex=${sex}&age=${age}`)
        const data = await response.json()
        homeStore.setState({ questions: data.data })
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to fetch questions:', error)
        setIsLoading(false)
      }
    }

    fetchQuestions()
  }, [sex, age])

  const handleSelect = async (value: number) => {
    // // 增加 500ms 延遲
    // await new Promise((resolve) => setTimeout(resolve, 500))

    // 如果不是最後一題才停止語音
    if (currentStep < questions.length - 1) {
      stopVoice() // 在處理新答案前停止當前語音
    }

    // 先停止麥克風收音
    const pickUpButton = document.getElementById('pickUp')
    const micIcon = pickUpButton?.querySelector('pixiv-icon')
    const isMicRecording = micIcon?.getAttribute('name') === '24/Dot'
    if (isMicRecording) {
      pickUpButton?.click()
    }

    // 1. 先更新答案和步驟
    const newAnswers = {
      ...answers,
      [questions[currentStep].id]: value,
    }
    console.log('newAnswers:', newAnswers)
    setAnswers(newAnswers)

    document
      .getElementById('answerInput')
      ?.setAttribute('data-answer-input', 'topicObtained')

    if (currentStep < questions.length - 1) {
      // 2. 更新到下一步
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)

      // // 3. 播放下一個問題
      // voiceController.play(
      //   questions[nextStep].question,
      //   false,
      //   () => console.log(`開始播放問題: ${nextStep + 1}`),
      //   () => console.log(`問題: ${nextStep + 1} 播放結束`)
      // )
    } else {
      // 最後一題的處理邏輯
      console.log('end newAnswers:', newAnswers)
      const answersArray = Object.entries(newAnswers).reduce(
        (acc, [questionId, value]) => ({
          ...acc,
          [questionId]: value,
        }),
        {}
      )

      // 等待語音播放完成
      await new Promise<void>((resolve) => {
        voiceController.play(
          '問卷已完成，AI 正在分析您的答案',
          true,
          () => console.log('開始播放完成語音'),
          () => {
            console.log('完成語音播放結束')
            resolve()
          }
        )
      })

      // 語音播放完成後才執行 onComplete
      onComplete(answersArray)
    }
  }

  if (isLoading) {
    return <div className="w-full text-center">載入中...</div>
  }

  return (
    <div className="w-full">
      {questions?.length > 0 && currentStep < questions.length && (
        <QuestionStep
          key={currentStep} // 添加 key 屬性以強制重新渲染
          id={questions[currentStep].id}
          question={questions[currentStep].question}
          options={questions[currentStep].options}
          onSelect={handleSelect}
        />
      )}
    </div>
  )
}
