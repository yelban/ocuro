import { useCallback, useEffect, useRef, useState } from 'react'
import { buildUrl } from '@/utils/buildUrl'

import homeStore from '@/features/stores/home'

export default function VrmViewer() {
  const isCanvasVisible = homeStore((s) => s.isCanvasVisible)
  const originalHeightRef = useRef(0)

  // 初始化狀態為預設值
  const [viewportInfo, setViewportInfo] = useState({
    visualWidth: 0,
    visualHeight: 0,
    innerWidth: 0,
    innerHeight: 0,
    devicePixelRatio: 1,
    canvasWidth: 0,
    canvasHeight: 0,
    screenWidth: 0,
    screenHeight: 0,
    canvasX: 0,
    canvasY: 0,
  })

  // 在 useEffect 中更新視口信息
  useEffect(() => {
    // 只在客戶端執行
    setViewportInfo({
      visualWidth: window.visualViewport?.width || 0,
      visualHeight: window.visualViewport?.height || 0,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
      canvasWidth: 0,
      canvasHeight: 0,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      canvasX: 0,
      canvasY: 0,
    })
  }, []) // 空依賴陣列表示只在組件掛載時執行一次

  // 修改 resize 處理函數
  const handleResize = useCallback(() => {
    const canvas = document.querySelector('canvas')
    if (!canvas) return

    // // 使用 window.innerHeight 而不是 visualViewport
    // const currentHeight = window.innerHeight
    // const currentWidth = window.innerWidth

    // // 設置 canvas 尺寸並保持寬高比
    // const aspectRatio = currentWidth / currentHeight
    // canvas.width = currentWidth * window.devicePixelRatio
    // canvas.height = currentHeight * window.devicePixelRatio

    // 使用 visualViewport 的值
    const currentWidth = window.visualViewport?.width || window.innerWidth
    const currentHeight = window.visualViewport?.height || window.innerHeight

    // 計算實際像素大小
    const pixelRatio = window.devicePixelRatio || 1
    const pixelWidth = Math.floor(currentWidth * pixelRatio)
    const pixelHeight = Math.floor(currentHeight * pixelRatio)

    // 設置 canvas 的實際像素尺寸
    canvas.width = pixelWidth
    canvas.height = pixelHeight

    // 設置 canvas 的顯示尺寸
    canvas.style.width = `${currentWidth}px`
    canvas.style.height = `${currentHeight}px`

    // 更新容器尺寸
    const container = canvas.parentElement
    if (container) {
      // container.style.width = '100vw'
      // container.style.height = '100vh'
      container.style.width = `${currentWidth}px`
      container.style.height = `${currentHeight}px`
    }

    // 強制更新 WebGL renderer 尺寸
    const { viewer } = homeStore.getState()
    if (viewer) {
      viewer.resize()
    }

    // 獲取 canvas 的位置資訊
    const rect = canvas.getBoundingClientRect()

    // 更新視口信息狀態
    setViewportInfo({
      visualWidth: window.visualViewport?.width || 0,
      visualHeight: window.visualViewport?.height || 0,
      innerWidth: currentWidth,
      innerHeight: currentHeight,
      devicePixelRatio: window.devicePixelRatio,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      canvasX: Math.round(rect.x),
      canvasY: Math.round(rect.y),
    })
  }, [])

  // 監聽視口變化
  useEffect(() => {
    // 初始化時立即調用一次
    handleResize()

    // 添加事件監聽
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [handleResize])

  const canvasRef = useCallback((canvas: HTMLCanvasElement) => {
    if (canvas) {
      const { viewer } = homeStore.getState()
      viewer.setup(canvas)
      viewer.loadVrm(buildUrl('/2413980852884241452.vrm'))

      // Drag and DropでVRMを差し替え
      canvas.addEventListener('dragover', function (event) {
        event.preventDefault()
      })

      canvas.addEventListener('drop', function (event) {
        event.preventDefault()

        const files = event.dataTransfer?.files
        if (!files) {
          return
        }

        const file = files[0]
        if (!file) {
          return
        }
        const file_type = file.name.split('.').pop()
        if (file_type === 'vrm') {
          const blob = new Blob([file], { type: 'application/octet-stream' })
          const url = window.URL.createObjectURL(blob)
          viewer.loadVrm(url)
        } else if (file.type.startsWith('image/')) {
          const reader = new FileReader()
          reader.readAsDataURL(file)
          reader.onload = function () {
            const image = reader.result as string
            image !== '' && homeStore.setState({ modalImage: image })
          }
        }
      })
    }
  }, [])

  return (
    <div className={'fixed top-0 left-0 w-full h-full z-5'}>
      <canvas
        ref={canvasRef}
        className={`block w-full h-full ${!isCanvasVisible ? 'invisible' : ''}`}
      />
      {/* 添加浮動的調試信息 div */}
      {/* <div className="fixed top-8 right-8 bg-black/30 text-white p-4 rounded text-xs font-mono">
        <div>visualViewport width: {viewportInfo.visualWidth}px</div>
        <div>visualViewport height: {viewportInfo.visualHeight}px</div>
        <div>innerWidth: {viewportInfo.innerWidth}px</div>
        <div>innerHeight: {viewportInfo.innerHeight}px</div>
        <div>devicePixelRatio: {viewportInfo.devicePixelRatio}</div>
        <div>canvas width: {viewportInfo.canvasWidth}px</div>
        <div>canvas height: {viewportInfo.canvasHeight}px</div>
        <div>screen width: {viewportInfo.screenWidth}px</div>
        <div>screen height: {viewportInfo.screenHeight}px</div>
        <div>canvas X: {viewportInfo.canvasX}px</div>
        <div>canvas Y: {viewportInfo.canvasY}px</div>
      </div> */}
    </div>
  )
}
