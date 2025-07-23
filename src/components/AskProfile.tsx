import React, { useState, useEffect } from 'react'
import { QuestionFlow, QuestionAnswer } from '@/components/QuestionFlow'
import { BasicInfoForm, BasicInfo } from '@/components/BasicInfoForm'
import { voiceController } from '@/features/messages/voiceController'
import homeStore, { InferenceResult } from '@/features/stores/home'

type Props = {
  isVisible: boolean
  onClose: () => void
}

// interface InferenceResult {
//   // 依據實際 API 回傳結果定義相關欄位
//   type?: string
//   score?: number
//   // ... 其他欄位
// }

export const AskProfile = ({ isVisible, onClose }: Props) => {
  const [step, setStep] = useState<'basicInfo' | 'questions'>('basicInfo')
  const [basicInfo, setBasicInfo] = useState<BasicInfo | null>(null)

  useEffect(() => {
    const answerInput = document.getElementById('answerInput')

    if (isVisible && step === 'basicInfo') {
      answerInput?.setAttribute('data-answer-input', 'name')
      voiceController.play(
        '為了增加體質分類的準確性，請協助我完成基本資料填寫。首先請問您怎麼稱呼。',
        false,
        () => {
          console.log('詢問姓名語音')
        },
        () => {
          if (answerInput?.getAttribute('data-answer-input') === 'name') {
            console.log('詢問姓名語音結束', 'Click pickUp')
            // document.getElementById('name')?.focus()
            document.getElementById('pickUp')?.click()
          }
        }
      )
      // '為了增加體質分類的準確性，請協助我完成基本資料填寫。首先請問您怎麼稱呼。',
    } else if (isVisible && step === 'questions') {
      answerInput?.setAttribute('data-answer-input', 'questions')
      // '接下來我們將進行一系列問題評估',
    }
  }, [isVisible, step])

  const handleBasicInfoComplete = (data: BasicInfo) => {
    // * 1. 基本資料填寫完成時，呼叫 setStep('questions')
    // * 2. 當 step 變更為 'questions' 時，渲染 QuestionFlow 組件
    // * 3. QuestionFlow 初始化時會載入問題列表
    // * 4. 當問題列表載入完成後，useEffect 偵測到 questions 有內容且 currentStep 為 0
    // * 5. 觸發 voiceController.play() 播放第一個問題的語音
    setBasicInfo(data)

    const answerInput = document.getElementById('answerInput')
    if (answerInput) {
      answerInput.setAttribute('data-answer-input', 'confirmObtained')
    }

    voiceController.play(
      '接下來我們將進行一系列問題評估',
      false,
      () => {
        console.log('問題評估開始語音')
        // 先停止麥克風收音
        const pickUpButton = document.getElementById('pickUp')
        const micIcon = pickUpButton?.querySelector('pixiv-icon')
        const isMicRecording = micIcon?.getAttribute('name') === '24/Dot'
        if (isMicRecording) {
          pickUpButton?.click()
        }
      },
      () => {
        console.log('問題評估語音結束')
        setStep('questions')
      }
    )
  }

  const handleQuestionsComplete = async (answers: Record<string, number>) => {
    const timestamp = Date.now()
    const postData = {
      // user_id: crypto.randomUUID(), // 產生唯一識別碼
      user_id: `${basicInfo?.name}-${basicInfo?.age}-${basicInfo?.sex}-${timestamp}`,
      age: basicInfo?.age,
      sex: basicInfo?.sex,
      height: basicInfo?.height,
      weight: basicInfo?.weight,
      answers,
    }
    console.log('postData:', postData)

    const response = await fetch('/api/inference', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    })

    if (!response.ok) {
      throw new Error('推論請求失敗')
    }

    const result: InferenceResult = await response.json()
    console.log('推論結果:', result)
    homeStore.setState({ bcqResult: result })

    // TODO: 處理推論結果，例如：
    // - 更新狀態
    // - 觸發下一步動作
    // - 顯示結果等

    onClose()
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 mx-16 z-10 flex items-center justify-center">
      <div className="floating-askprofile-content max-h-[40vh]">
        <div className="floating-askprofile-inner">
          <div className="w-full">
            {step === 'basicInfo' ? (
              <BasicInfoForm onComplete={handleBasicInfoComplete} />
            ) : (
              basicInfo && (
                <QuestionFlow
                  onComplete={handleQuestionsComplete}
                  sex={basicInfo.sex || 'M'}
                  age={basicInfo.age || 0}
                />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
