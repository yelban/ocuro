import GIF from 'gif.js'

interface CanvasOverlay {
  imagePath: string
  x: number
  y: number
  width?: number
  height?: number
  isGif?: boolean
  zIndex?: number
}

export async function createCanvasComposition(
  backgroundPath: string,
  overlays: CanvasOverlay[],
  width: number,
  height: number
): Promise<HTMLCanvasElement> {
  // 創建 canvas
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  if (!ctx) throw new Error('無法獲取 canvas context')

  // 載入背景圖片
  const backgroundImg = new Image()
  backgroundImg.src = backgroundPath
  await new Promise((resolve) => {
    backgroundImg.onload = resolve
  })
  ctx.drawImage(backgroundImg, 0, 0, width, height)

  // 根據 zIndex 排序圖層，預設 zIndex 為 0
  const sortedOverlays = [...overlays].sort(
    (a, b) => (a.zIndex || 0) - (b.zIndex || 0)
  )

  // 使用排序後的圖層
  for (const overlay of sortedOverlays) {
    if (overlay.isGif) {
      // 使用 gif.js 處理 GIF
      const gif = new GIF({
        workers: 2,
        quality: 10,
        width: overlay.width || 100,
        height: overlay.height || 100,
      })

      // 載入 GIF 幀
      const gifImg = new Image()
      gifImg.src = overlay.imagePath
      await new Promise((resolve) => {
        gifImg.onload = resolve
      })

      // 添加到 canvas
      ctx.drawImage(
        gifImg,
        overlay.x,
        overlay.y,
        overlay.width || gifImg.width,
        overlay.height || gifImg.height
      )
    } else {
      // 處理普通圖片
      const img = new Image()
      img.src = overlay.imagePath
      await new Promise((resolve) => {
        img.onload = resolve
      })
      ctx.drawImage(
        img,
        overlay.x,
        overlay.y,
        overlay.width || img.width,
        overlay.height || img.height
      )
    }
  }

  return canvas
}
