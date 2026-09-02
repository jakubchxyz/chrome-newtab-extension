chrome.runtime.onInstalled.addListener(() => {
  console.log('Screenshot & Customize installed')
})

type ExtensionMessage = {
  action?: string
  splitCapture?: boolean
}

const MIN_VISIBLE_CAPTURE_INTERVAL_MS = 650
const MAX_VISIBLE_CAPTURE_ATTEMPTS = 3

let nextVisibleCaptureAt = 0
let visibleCaptureQueue = Promise.resolve()

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isCaptureQuotaError(error: unknown): boolean {
  return error instanceof Error && error.message.includes('MAX_CAPTURE_VISIBLE_TAB_CALLS_PER_SECOND')
}

function captureVisibleOnce(windowId: number): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.tabs.captureVisibleTab(
      windowId,
      { format: 'png', quality: 100 },
      (dataUrl) => {
        if (chrome.runtime.lastError) {
          const errorMsg = chrome.runtime.lastError.message || 'Screenshot capture failed'
          reject(new Error(`Visible tab capture failed: ${errorMsg}`))
          return
        }
        if (!dataUrl) {
          reject(new Error('No screenshot data received from browser'))
          return
        }
        resolve(dataUrl)
      },
    )
  })
}

function captureVisible(windowId: number): Promise<string> {
  const queuedCapture = visibleCaptureQueue.then(async () => {
    let lastError: unknown

    for (let attempt = 1; attempt <= MAX_VISIBLE_CAPTURE_ATTEMPTS; attempt++) {
      const waitMs = nextVisibleCaptureAt - Date.now()
      if (waitMs > 0) {
        await delay(waitMs)
      }

      try {
        const dataUrl = await captureVisibleOnce(windowId)
        nextVisibleCaptureAt = Date.now() + MIN_VISIBLE_CAPTURE_INTERVAL_MS
        return dataUrl
      } catch (error) {
        lastError = error
        nextVisibleCaptureAt = Date.now() + MIN_VISIBLE_CAPTURE_INTERVAL_MS

        if (!isCaptureQuotaError(error) || attempt === MAX_VISIBLE_CAPTURE_ATTEMPTS) {
          break
        }
      }
    }

    throw lastError instanceof Error ? lastError : new Error('Screenshot capture failed')
  })

  visibleCaptureQueue = queuedCapture.then(
    () => undefined,
    () => undefined,
  )

  return queuedCapture
}

chrome.runtime.onMessage.addListener((req: ExtensionMessage, sender: chrome.runtime.MessageSender, sendResponse) => {
  if (!req) return

  if (req.action === 'capture-screenshot') {
    const windowIdFromSender = sender && sender.tab && sender.tab.windowId
    const respond = async (windowId: number) => {
      try {
        const dataUrl = await captureVisible(windowId)
        sendResponse({ success: true, dataUrl })
      } catch (e: unknown) {
        sendResponse({ success: false, error: e instanceof Error ? e.message : 'Screenshot capture failed' })
      }
    }
    if (windowIdFromSender !== undefined) {
      respond(windowIdFromSender)
    } else {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs && tabs[0]
        if (!currentTab || currentTab.windowId === undefined) {
          sendResponse({ success: false, error: 'No active tab' })
          return
        }
        respond(currentTab.windowId)
      })
    }
    return true
  }

  if (req.action === 'capture-fullpage') {
    const splitCapture = !!req.splitCapture
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs && tabs[0]
      if (!currentTab || !currentTab.id) {
        sendResponse({ success: false, error: 'No active tab found' })
        return
      }

      // Check if we can inject content scripts
      if (!currentTab.url || currentTab.url.startsWith('chrome://') || currentTab.url.startsWith('chrome-extension://')) {
        sendResponse({ success: false, error: 'Cannot capture Chrome system pages' })
        return
      }

      chrome.tabs.sendMessage(currentTab.id!, { action: 'FULLPAGE_START', splitCapture }, (resp) => {
        if (chrome.runtime.lastError) {
          const errorMsg = chrome.runtime.lastError.message || 'Unknown communication error'
          console.error('Content script communication failed:', errorMsg)
          sendResponse({
            success: false,
            error: `Failed to communicate with page: ${errorMsg}. Try refreshing the page.`
          })
          return
        }

        if (!resp) {
          sendResponse({ success: false, error: 'No response from content script' })
          return
        }

        sendResponse(resp)
      })
    })
    return true
  }
})
