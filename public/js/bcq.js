console.log('bcq.js')

// 或者如果需要回調函數
// setTimeout(() => {
//   window.voiceController.playVoiceGuideInternal(
//     '要播放的訊息',
//     false,
//     () => console.log('開始播放'),
//     () => console.log('播放結束')
//   )
// }, 2000)

// if (window.voiceController?.isReady()) {
//   window.voiceController.playVoiceGuideInternal('語音播放已就緒')
// } else {
//   // * 語音播放才就緒
//   window.addEventListener('voiceControllerReady', () => {
//     window.voiceController.playVoiceGuideInternal('語音播放就緒')
//   })
// }

document.addEventListener('DOMContentLoaded', () => {
  console.log('頁面已就緒')

  //   const menu = document.getElementById('menu')
  //   if (menu) {
  //     menu.style.visibility = 'hidden'
  //   }

  //   const resizeCanvas = () => {
  //     const canvases = document.querySelectorAll('canvas')
  //     canvases.forEach((canvas) => {
  //       const height = window.visualViewport
  //         ? window.visualViewport.height
  //         : window.innerHeight
  //       canvas.style.height = `${height}px`
  //       console.log('canvas height', canvas.style.height)
  //     })
  //   }

  //   // 初始化時調用
  //   resizeCanvas()

  //   // 監聽事件
  //   window.visualViewport?.addEventListener('resize', resizeCanvas)
  //   window.addEventListener('resize', resizeCanvas)

  // function onCanvasResize(canvas, callback) {
  //   let lastWidth = canvas.width
  //   let lastHeight = canvas.height

  //   function checkSize() {
  //     // 重新計算並設置 canvas 高度
  //     const canvas = document.querySelector('canvas')
  //     if (canvas) {
  //       canvas.style.height = `${window.innerHeight}px`
  //       callback()
  //     }
  //     // if (canvas.width !== lastWidth || canvas.height !== lastHeight) {
  //     //   lastWidth = canvas.width
  //     //   lastHeight = canvas.height
  //     //   callback()
  //     // }
  //   }

  //   window.addEventListener('resize', checkSize)

  //   // 可選：添加 MutationObserver 來監聽 DOM 變化
  //   const observer = new MutationObserver(checkSize)
  //   observer.observe(canvas, {
  //     attributes: true,
  //     attributeFilter: ['width', 'height'],
  //   })

  //   // 可選：定期檢查大小變化
  //   setInterval(checkSize, 1000)
  // }

  // const canvases = document.querySelectorAll('canvas')

  // if (canvases.length > 0) {
  //   onCanvasResize(canvases[0], () => {
  //     console.log('Canvas 大小已變化')
  //     console.log('新寬度:', canvases[0].width)
  //     console.log('新高度:', canvases[0].height)

  //     canvases[0].style.marginTop = '25px'
  //     canvases[0].style.marginTop = '25px'
  //   })
  // }

  // 語音播放已就緒
  // window.voiceController.playVoice(
  //   '歡迎使用中醫體質智析',
  //   true,
  //   () => {
  //     console.log('開始播放 歡迎')
  //     const readAgreement = document.getElementById('readAgreement')
  //     if (readAgreement) {
  //       readAgreement.disabled = true
  //       readAgreement.style.opacity = '0.5'
  //       readAgreement.style.cursor = 'not-allowed'
  //     }
  //   },
  //   () => {
  //     console.log('播放結束 歡迎')
  //     const readAgreement = document.getElementById('readAgreement')
  //     if (readAgreement) {
  //       readAgreement.disabled = false
  //       readAgreement.style.opacity = '1'
  //       readAgreement.style.cursor = 'pointer'
  //     }
  //   }
  // )

  // // 在頁面載入時隱藏 canvas 元素
  // const canvasElement = document.querySelector('canvas')

  // if (canvasElement) {
  //   canvasElement.style.visibility = 'hidden'
  // }

  // if (window.voiceController?.isReady()) {
  //   // * 語音播放已就緒
  //   window.voiceController.playVoiceGuideInternal('語音播放已就緒')
  // } else {
  //   window.addEventListener('voiceControllerReady', () => {
  //     window.voiceController.playVoiceGuideInternal('語音播放才就緒')
  //   })
  // }
})
