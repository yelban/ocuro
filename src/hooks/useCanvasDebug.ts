// hooks/useCanvasDebug.ts
import { useEffect, useRef } from 'react'

export function useCanvasDebug(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  id: string = 'default'
) {
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const logCanvasInfo = () => {
      console.group(`Canvas Info (${id})`)
      console.log('Canvas element width:', canvas.width)
      console.log('Canvas element height:', canvas.height)
      console.log('Canvas CSS width:', canvas.style.width)
      console.log('Canvas CSS height:', canvas.style.height)

      const rect = canvas.getBoundingClientRect()
      console.log('Canvas bounding rect:', {
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
      })

      console.log('Device Pixel Ratio:', window.devicePixelRatio)

      if (ctx) {
        const transform = ctx.getTransform()
        console.log('Canvas transform:', {
          a: transform.a,
          d: transform.d,
          e: transform.e,
          f: transform.f,
        })
      }

      console.groupEnd()
    }

    logCanvasInfo()

    const resizeObserver = new ResizeObserver(() => {
      logCanvasInfo()
    })

    resizeObserver.observe(canvas)

    return () => {
      resizeObserver.disconnect()
    }
  }, [canvasRef, id])
}
