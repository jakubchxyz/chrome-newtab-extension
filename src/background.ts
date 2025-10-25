chrome.runtime.onInstalled.addListener(() => {
  console.log('My Dev Dashboard installed')
})

function captureVisible(windowId: number): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.tabs.captureVisibleTab(
      windowId,
      { format: 'png', quality: 100 },
      (dataUrl) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message))
          return
        }
        if (!dataUrl) {
          reject(new Error('No dataUrl received'))
          return
        }
        resolve(dataUrl)
      },
    )
  })
}

chrome.runtime.onMessage.addListener((req: any, sender: chrome.runtime.MessageSender, sendResponse) => {
  if (!req) return

  if (req.action === 'capture-screenshot') {
    const windowIdFromSender = sender && sender.tab && sender.tab.windowId
    const respond = async (windowId: number) => {
      try {
        const dataUrl = await captureVisible(windowId)
        sendResponse({ success: true, dataUrl })
      } catch (e: any) {
        sendResponse({ success: false, error: e?.message })
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
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs && tabs[0]
      if (!currentTab || !currentTab.id) {
        sendResponse({ success: false, error: 'No active tab' })
        return
      }
      chrome.tabs.sendMessage(currentTab.id!, { action: 'FULLPAGE_START' }, (resp) => {
        if (chrome.runtime.lastError) {
          sendResponse({ success: false, error: chrome.runtime.lastError.message })
          return
        }
        sendResponse(resp)
      })
    })
    return true
  }
})

