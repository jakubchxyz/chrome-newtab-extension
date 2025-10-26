;(() => {
  interface CaptureProgress {
    current: number
    total: number
    step: string
  }

  function delay(ms: number): Promise<void> {
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
      img.onerror = (e) => reject(new Error(`Failed to load image: ${e}`))
      img.src = src
    })
  }

  function getTotalPageHeight(): number {
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

  async function waitForScrollStabilization(targetY: number, timeoutMs: number = 2000): Promise<void> {
    const startTime = Date.now()
    let lastScrollY = window.scrollY
    let stableCount = 0
    const requiredStableCount = 3

    while (Date.now() - startTime < timeoutMs) {
      await delay(50)

      const currentScrollY = window.scrollY
      const distance = Math.abs(currentScrollY - targetY)

      // If we're close enough to target and scroll hasn't changed much
      if (distance < 5 && Math.abs(currentScrollY - lastScrollY) < 2) {
        stableCount++
        if (stableCount >= requiredStableCount) {
          return
        }
      } else {
        stableCount = 0
      }

      lastScrollY = currentScrollY

      // Force scroll again if we're not at target
      if (distance > 10) {
        window.scrollTo({ top: targetY, behavior: 'instant' })
      }
    }

    throw new Error(`Scroll stabilization timeout after ${timeoutMs}ms`)
  }

  async function captureFullPage(onProgress?: (progress: CaptureProgress) => void): Promise<{ success: true, dataUrl: string, width: number, height: number }> {
    try {
      onProgress?.({ current: 0, total: 100, step: 'Preparing capture...' })

      // Check if page has content
      const totalHeight = getTotalPageHeight()
      if (totalHeight === 0) {
        throw new Error('Page has no height - cannot capture')
      }

      const originalX = window.scrollX
      const originalY = window.scrollY
      const dpr = window.devicePixelRatio || 1
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      // Ensure we have valid dimensions
      if (viewportWidth === 0 || viewportHeight === 0) {
        throw new Error('Invalid viewport dimensions')
      }

      const steps = Math.ceil(totalHeight / viewportHeight)
      const images: { dataUrl: string; y: number; height: number }[] = []

      onProgress?.({ current: 10, total: 100, step: `Capturing ${steps} sections...` })

      // Capture each section
      for (let i = 0; i < steps; i++) {
        const targetY = i * viewportHeight

        // Scroll to position with stabilization
        window.scrollTo({ top: targetY, behavior: 'instant' })
        await waitForScrollStabilization(targetY)

        // Additional delay for dynamic content
        await delay(200)

        const actualY = window.scrollY
        const visibleHeight = Math.min(viewportHeight, totalHeight - actualY)

        onProgress?.({
          current: 10 + (i / steps) * 70,
          total: 100,
          step: `Capturing section ${i + 1}/${steps}...`
        })

        try {
          const resp = await sendMessageAsync<{ success: boolean, dataUrl?: string, error?: string }>({ action: 'capture-screenshot' })
          if (!resp.success || !resp.dataUrl) {
            throw new Error(resp.error || 'Screenshot capture failed')
          }
          images.push({ dataUrl: resp.dataUrl, y: actualY, height: visibleHeight })
        } catch (error) {
          throw new Error(`Failed to capture section ${i + 1}: ${error}`)
        }
      }

      // Restore original scroll position
      window.scrollTo({ top: originalY, left: originalX, behavior: 'instant' })

      onProgress?.({ current: 80, total: 100, step: 'Compositing images...' })

      // Create canvas with proper dimensions
      const canvasWidth = Math.floor(viewportWidth * dpr)
      const canvasHeight = Math.floor(totalHeight * dpr)

      if (canvasWidth === 0 || canvasHeight === 0) {
        throw new Error('Invalid canvas dimensions calculated')
      }

      const canvas = document.createElement('canvas')
      canvas.width = canvasWidth
      canvas.height = canvasHeight
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        throw new Error('Failed to get canvas context')
      }

      // Clear canvas with white background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)

      // Composite images
      for (let i = 0; i < images.length; i++) {
        const { dataUrl, y, height } = images[i]

        try {
          const img = await loadImage(dataUrl)

          // Verify image dimensions
          if (img.width === 0 || img.height === 0) {
            console.warn(`Skipping invalid image at section ${i + 1}`)
            continue
          }

          const sourceWidth = img.width
          const sourceHeight = img.height
          const destY = Math.floor(y * dpr)
          const drawHeight = Math.floor(height * dpr)

          // Ensure we don't draw outside canvas bounds
          const clampedDrawHeight = Math.min(drawHeight, canvasHeight - destY)
          if (clampedDrawHeight > 0) {
            ctx.drawImage(
              img,
              0, 0, sourceWidth, sourceHeight,
              0, destY, sourceWidth, clampedDrawHeight
            )
          }
        } catch (error) {
          console.warn(`Failed to composite section ${i + 1}:`, error)
          // Continue with other sections
        }
      }

      onProgress?.({ current: 95, total: 100, step: 'Finalizing...' })

      // Generate final data URL
      const finalDataUrl = canvas.toDataURL('image/png', 0.95)

      if (!finalDataUrl || finalDataUrl === 'data:,') {
        throw new Error('Failed to generate final image data URL')
      }

      onProgress?.({ current: 100, total: 100, step: 'Complete!' })

      return {
        success: true,
        dataUrl: finalDataUrl,
        width: canvasWidth,
        height: canvasHeight
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('Full page capture failed:', error)
      throw new Error(`Full page capture failed: ${errorMessage}`)
    }
  }

  chrome.runtime.onMessage.addListener((request: any, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
    if (request && request.action === 'FULLPAGE_START') {
      ;(async () => {
        try {
          const result = await captureFullPage()
          sendResponse(result)
        } catch (err: any) {
          const errorMessage = err instanceof Error ? err.message : String(err?.message || err)
          sendResponse({
            success: false,
            error: errorMessage,
            details: err?.stack
          })
        }
      })()
      return true
    }
  })
})()


