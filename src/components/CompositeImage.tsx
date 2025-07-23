import { useEffect, useRef } from 'react'
import { createCanvasComposition } from '@/utils/canvasComposer'
import GIF from 'gif.js'
import { parseGIF, decompressFrames } from 'gifuct-js'
import { useCanvasDebug } from '@/hooks/useCanvasDebug'

interface TextLayer {
  text: string
  x: number
  y: number
  fonts?: string[]
  color?: string
  fontSize?: number
  fontWeight?: string
  textAlign?: CanvasTextAlign
  zIndex?: number
  scale?: number
  maxWidth?: number
}

interface CompositeImageProps {
  backgroundPath: string
  overlays: Array<{
    imagePath: string
    x: number
    y: number
    width?: number
    height?: number
    isGif?: boolean
    zIndex?: number
    scale?: number
    gifType?: 'type1' | 'type2' // 新增 gifType 屬性
  }>
  textLayers?: (TextLayer | null)[]
  width?: number
  height?: number
  type1Speed?: number // type1 GIF 的播放速度倍率
  type2Speed?: number // type2 GIF 的播放速度倍率
  defaultFonts?: string[] // 預設字型陣列
  id?: string
}

interface LineOverlay {
  type: 'line'
  x: number
  y: number
  length: number
  width: number
  color: string
  zIndex?: number
}

export function CompositeImage({
  backgroundPath,
  overlays,
  textLayers = [],
  width = 1600,
  height = 2020,
  type1Speed = 10,
  type2Speed = 6,
  defaultFonts = ['Arial', 'Helvetica', 'sans-serif'], // 預設字型
  id,
}: CompositeImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // 使用 Canvas Debug Hook
  useCanvasDebug(canvasRef, 'CompositeImage')
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    const initCanvas = async () => {
      if (!canvasRef.current) return
      const ctx = canvasRef.current.getContext('2d', {
        alpha: true,
        willReadFrequently: true,
      })
      if (!ctx) return

      // 排序所有可見層（包括圖片和文字）
      const sortedOverlays = [...overlays].sort(
        (a, b) => (a.zIndex || 0) - (b.zIndex || 0)
      )
      const sortedTextLayers = textLayers
        .filter((layer): layer is TextLayer => layer !== null)
        .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))

      const gifFrames: {
        [key: string]: {
          frames: any[]
          frameIndex: number
          lastFrameTime: number
          canvas: HTMLCanvasElement
          frameBuffers: ImageData[]
          x: number
          y: number
          zIndex: number
          width: number
          height: number
          delayTime: number
          gifType?: 'type1' | 'type2'
        }
      } = {}

      const staticCanvas = await createCanvasComposition(
        backgroundPath,
        sortedOverlays.filter((o) => !o.isGif),
        width,
        height
      )

      await Promise.all(
        sortedOverlays
          .filter((o) => o.isGif)
          .map(async (overlay, index) => {
            try {
              const uniqueKey = `${overlay.imagePath}_${index}`
              const response = await fetch(overlay.imagePath)
              const buffer = await response.arrayBuffer()
              const gif = parseGIF(buffer)
              const frames = decompressFrames(gif, true)

              const offscreenCanvas = document.createElement('canvas')
              offscreenCanvas.width = gif.lsd.width
              offscreenCanvas.height = gif.lsd.height
              const offscreenCtx = offscreenCanvas.getContext('2d')
              if (!offscreenCtx) return

              const frameBuffers: ImageData[] = []
              let previousImageData = new ImageData(
                new Uint8ClampedArray(gif.lsd.width * gif.lsd.height * 4),
                gif.lsd.width,
                gif.lsd.height
              )

              frames.forEach((frame) => {
                const imageData = new ImageData(
                  new Uint8ClampedArray(previousImageData.data),
                  gif.lsd.width,
                  gif.lsd.height
                )

                const patchData = new Uint8ClampedArray(frame.patch)
                for (let i = 0; i < frame.dims.height; i++) {
                  for (let j = 0; j < frame.dims.width; j++) {
                    const x = frame.dims.left + j
                    const y = frame.dims.top + i
                    const patchIndex = (i * frame.dims.width + j) * 4
                    const imageIndex = (y * gif.lsd.width + x) * 4

                    if (patchData[patchIndex + 3] !== 0) {
                      imageData.data[imageIndex] = patchData[patchIndex]
                      imageData.data[imageIndex + 1] = patchData[patchIndex + 1]
                      imageData.data[imageIndex + 2] = patchData[patchIndex + 2]
                      imageData.data[imageIndex + 3] = patchData[patchIndex + 3]
                    }
                  }
                }

                frameBuffers.push(imageData)
                previousImageData = imageData
              })

              // 根據 GIF 類型設定不同的基礎延遲時間
              const baseDelay = frames[0].delay * 10 // 轉換為毫秒
              const speedMultiplier =
                overlay.gifType === 'type1' ? type1Speed : type2Speed
              const delayTime = Math.max(baseDelay / speedMultiplier, 20) // 確保最小幀時間

              gifFrames[uniqueKey] = {
                frames,
                frameIndex: 0,
                lastFrameTime: 0,
                canvas: offscreenCanvas,
                frameBuffers,
                x: overlay.x,
                y: overlay.y,
                zIndex: overlay.zIndex || 0,
                width: gif.lsd.width,
                height: gif.lsd.height,
                delayTime,
                gifType: overlay.gifType,
              }
            } catch (error) {
              console.error('GIF processing error:', error)
            }
          })
      )

      // 渲染文字的函數
      const renderText = (ctx: CanvasRenderingContext2D) => {
        // 設置更好的字體渲染
        ctx.textBaseline = 'middle'
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'

        sortedTextLayers.forEach((textLayer) => {
          const {
            text,
            x,
            y,
            fonts = defaultFonts,
            fontSize = 16,
            fontWeight = 'normal',
            color = 'black',
            textAlign = 'left',
            scale = 1,
            maxWidth,
          } = textLayer

          ctx.save()
          // 添加縮放
          ctx.scale(scale, scale)
          // 設置字體大小時乘以縮放比例
          const actualFontSize = fontSize * scale
          // 將字型陣列組合成 CSS font-family 字串
          const fontFamily = fonts
            .map((font) => {
              // 如果字型名稱包含空格，加上引號
              return font.includes(' ') ? `"${font}"` : font
            })
            .join(', ')
          ctx.font = `${fontWeight} ${actualFontSize}px ${fontFamily}`
          ctx.fillStyle = color
          ctx.textAlign = textAlign

          if (maxWidth) {
            // 文字換行處理
            const words = text.split('') // 中文按字元分割
            let line = ''
            let lineHeight = actualFontSize * 1.05 // 行高為字體大小的 1.2 倍
            let currentY = y

            for (let i = 0; i < words.length; i++) {
              const testLine = line + words[i]
              const metrics = ctx.measureText(testLine)
              const testWidth = metrics.width

              if (testWidth > maxWidth && i > 0) {
                // 繪製當前行
                if (color === 'white') {
                  ctx.strokeStyle = 'rgba(0,0,0,0.3)'
                  ctx.lineWidth = fontSize / 16
                  ctx.strokeText(line, x, currentY)
                }
                ctx.fillText(line, x, currentY)

                line = words[i]
                currentY += lineHeight
              } else {
                line = testLine
              }
            }
            // 繪製最後一行
            if (color === 'white') {
              // 添加文字描邊以提高可讀性
              ctx.strokeStyle = 'rgba(0,0,0,0.1)'
              ctx.lineWidth = fontSize / 16
              ctx.strokeText(line, x, currentY)
            }
            ctx.fillText(line, x, currentY)
          } else {
            // 原有的不換行文字繪製邏輯
            if (color === 'white') {
              // 添加文字描邊以提高可讀性
              ctx.strokeStyle = 'rgba(0,0,0,0.1)'
              ctx.lineWidth = fontSize / 16
              ctx.strokeText(text, x, y)
            }
            ctx.fillText(text, x, y)
          }

          ctx.restore()
        })
      }

      const renderFrame = (timestamp: number) => {
        ctx.clearRect(0, 0, width, height)

        // 添加圓角剪裁
        ctx.save() // 保存當前狀態
        ctx.beginPath()
        const radius = 32 // 圓角半徑，可以根據需要調整

        // 繪製圓角矩形路徑
        ctx.moveTo(radius, 0)
        ctx.lineTo(width - radius, 0)
        ctx.arcTo(width, 0, width, radius, radius)
        ctx.lineTo(width, height - radius)
        ctx.arcTo(width, height, width - radius, height, radius)
        ctx.lineTo(radius, height)
        ctx.arcTo(0, height, 0, height - radius, radius)
        ctx.lineTo(0, radius)
        ctx.arcTo(0, 0, radius, 0, radius)
        ctx.closePath()

        ctx.clip() // 應用剪裁

        ctx.drawImage(staticCanvas, 0, 0)

        const sortedGifKeys = Object.keys(gifFrames).sort(
          (a, b) => gifFrames[a].zIndex - gifFrames[b].zIndex
        )

        sortedGifKeys.forEach((key) => {
          const gifData = gifFrames[key]

          if (timestamp - gifData.lastFrameTime >= gifData.delayTime) {
            const offscreenCtx = gifData.canvas.getContext('2d')
            if (!offscreenCtx) return

            offscreenCtx.putImageData(
              gifData.frameBuffers[gifData.frameIndex],
              0,
              0
            )

            gifData.frameIndex =
              gifData.frameIndex === gifData.frames.length - 1
                ? 0
                : gifData.frameIndex + 1
            gifData.lastFrameTime = timestamp
          }

          ctx.drawImage(gifData.canvas, gifData.x, gifData.y)
        })

        // 渲染文字層
        renderText(ctx)

        ctx.restore() // 恢復剪裁

        animationFrameRef.current = requestAnimationFrame(renderFrame)
      }

      animationFrameRef.current = requestAnimationFrame(renderFrame)
    }

    initCanvas()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [
    backgroundPath,
    overlays,
    textLayers,
    width,
    height,
    type1Speed,
    type2Speed,
    defaultFonts,
  ])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        width: '100%',
        height: 'auto',
        maxWidth: `${width}px`,
      }}
    />
  )
}
