;(() => {
  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  function sendMessageAsync<T = any>(message: any): Promise<T> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response: T) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message))
          return
        }
        resolve(response)
      })
    })
  }

  function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })
  }

  function getTotalPageHeight() {
    const body = document.body
    const html = document.documentElement
    return Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight,
    )
  }

  async function captureFullPage() {
    const originalX = window.scrollX
    const originalY = window.scrollY
    const dpr = window.devicePixelRatio || 1
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const totalHeight = getTotalPageHeight()

    const steps = Math.ceil(totalHeight / viewportHeight)
    const images: { dataUrl: string; y: number }[] = []

    for (let i = 0; i < steps; i++) {
      const targetY = i * viewportHeight
      window.scrollTo(0, targetY)
      await delay(300)
      const actualY = window.scrollY
      const resp = await sendMessageAsync<{ dataUrl: string }>({ action: 'capture-screenshot' })
      images.push({ dataUrl: resp.dataUrl, y: actualY })
    }

    window.scrollTo(originalX, originalY)

    const canvasWidth = Math.floor(viewportWidth * dpr)
    const canvasHeight = Math.floor(totalHeight * dpr)
    const canvas = document.createElement('canvas')
    canvas.width = canvasWidth
    canvas.height = canvasHeight
    const ctx = canvas.getContext('2d')!

    for (const { dataUrl, y } of images) {
      const img = await loadImage(dataUrl)
      const visibleHeight = Math.min(viewportHeight, totalHeight - y)
      const sourceWidth = Math.floor(viewportWidth * dpr)
      const drawHeight = Math.floor(visibleHeight * dpr)
      const destY = Math.floor(y * dpr)
      ctx.drawImage(img, 0, 0, sourceWidth, drawHeight, 0, destY, sourceWidth, drawHeight)
    }

    const finalDataUrl = canvas.toDataURL('image/png')
    return { success: true, dataUrl: finalDataUrl, width: canvasWidth, height: canvasHeight }
  }

  chrome.runtime.onMessage.addListener((request: any, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
    if (request && request.action === 'FULLPAGE_START') {
      ;(async () => {
        try {
          const result = await captureFullPage()
          sendResponse(result)
        } catch (err: any) {
          sendResponse({ success: false, error: String(err?.message) })
        }
      })()
      return true
    }
  })
})()


