chrome.runtime.onInstalled.addListener(() => {
  console.log('Screenshot & Customize installed')
})

type ExtensionMessage = {
  action?: string
  splitCapture?: boolean
}

function captureVisible(windowId: number): Promise<string> {
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
