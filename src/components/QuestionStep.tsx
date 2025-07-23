import { useState, useEffect } from 'react'
import { voiceController } from '@/features/messages/voiceController'
import homeStore from '@/features/stores/home'

interface Option {
  id: number
  value: number
  label: string
}

interface QuestionStepProps {
  question: string
  id: number
  options: {
    value: number
    label: string
  }[]
  onSelect: (value: number) => void
}

export const QuestionStep = ({
  question,
  options,
  onSelect,
}: QuestionStepProps) => {
  const [isEnabled, setIsEnabled] = useState(false)

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
    setIsEnabled(false)
    const timer = setTimeout(() => {
      setIsEnabled(true)
    }, 1250)

    return () => clearTimeout(timer)
  }, [question])

  return (
    <div className="space-y-6 w-1/2 ml-auto">
      <div className="bg-white rounded-8 border border-gray-200 shadow-sm ml-16 py-8">
        {/* <h3 className="text-lg font-bold mb-4">{question}</h3> */}
        <div id="options" className="flex flex-col gap-4 w-full mb-16 px-16">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                console.log('click')
                // stopVoice() // 在選擇選項前停止語音
                onSelect(option.value)
              }}
              disabled={!isEnabled}
              className={`px-8 py-4 mt-16 text-left rounded-8 border border-[#004099] bg-[#D6E7FF] hover:bg-gray-50 shadow transition-colors ${
                !isEnabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div className="flex items-center">
                <div className="w-[30px] flex-shrink-0 pl-8">
                  <span
                    className="inline-flex items-center justify-center w-6 h-6 min-w-[18px] min-h-[18px] bg-white text-[#004099] rounded-[50%] font-bold"
                    style={{ aspectRatio: '1' }}
                  >
                    {option.value}
                  </span>
                </div>
                <div className="text-left flex-grow pl-4 text-[1.25rem]">
                  {option.label}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
