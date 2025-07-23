import React from 'react'

// TypeScript 的類型定義，定義了 FloatingPanel 組件接收的屬性（props）
type Props = {
  // 控制浮動面板是否顯示
  isVisible: boolean
  // 關閉浮動面板的回調函數
  onClose: () => void
  // 浮動面板的子組件 (面板內要顯示的子元素)
  children: React.ReactNode
}

export const FloatingPanel = ({ isVisible, onClose, children }: Props) => {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* 固定定位，覆蓋整個視窗，層級為30， <VrmViewer /> 在 z-5，<Form /> 在 z-20，<Menu /> 在 z-15 */}
      <div className="floating-panel-content">
        <button
          onClick={onClose}
          className="absolute top-16 right-16 p-8 bg-secondary hover:bg-secondary-hover active:bg-secondary-press disabled:bg-secondary-disabled rounded-[9999px] shadow-md z-50 hidden"
        >
          <span className="sr-only">關閉</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-24 w-24 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <div className="floating-panel-inner">
          <div className="max-w-xl mx-auto">{children}</div>
        </div>
      </div>
    </div>
  )
}
