import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

type CustomRules = {
  enabled: boolean
  css: string
  hideSelectors: string[]
  hideClasses: string[]
  hideIds: string[]
}

type CustomRulesByOrigin = Record<string, CustomRules | undefined>

export default function Popup() {
  const [status, setStatus] = React.useState<string>('')
  const [customCss, setCustomCss] = React.useState<string>('')
  const [hideSelectors, setHideSelectors] = React.useState<string>('')
  const [hideClasses, setHideClasses] = React.useState<string>('')
  const [hideIds, setHideIds] = React.useState<string>('')
  const [enabled, setEnabled] = React.useState<boolean>(false)

  async function captureVisible() {
    setStatus('Capturing visible...')
    chrome.runtime.sendMessage({ action: 'capture-screenshot' }, (resp) => {
      if (!resp || !resp.success) {
        setStatus('Failed')
        return
      }
      const link = document.createElement('a')
      link.href = resp.dataUrl
      link.download = `screenshot_${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      link.remove()
      setStatus('Saved')
      setTimeout(() => setStatus(''), 1500)
    })
  }

  function downloadDataUrl(dataUrl: string, filename: string) {
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async function downloadSections(
    sections: Array<{ index: number; dataUrl: string }>,
    timestamp: number,
  ) {
    for (const section of sections) {
      const paddedIndex = String(section.index).padStart(3, '0')
      downloadDataUrl(section.dataUrl, `fullpage_section_${timestamp}_${paddedIndex}.png`)
      // Small spacing prevents dropped downloads on some browsers.
      await delay(120)
    }
  }

  async function captureFull(splitCapture: boolean = false) {
    setStatus(splitCapture ? 'Starting split full page capture...' : 'Starting full page capture...')

    const startTime = Date.now()
    const timeout = setTimeout(() => {
      setStatus('Taking longer than expected... This can happen with large pages.')
    }, 10000)

    chrome.runtime.sendMessage({ action: 'capture-fullpage', splitCapture }, async (resp) => {
      clearTimeout(timeout)

      if (!resp) {
        setStatus('❌ No response received')
        setTimeout(() => setStatus(''), 3000)
        return
      }

      if (!resp.success) {
        const errorMsg = resp.error || 'Unknown error'
        console.error('Full page capture failed:', errorMsg, resp.details)
        setStatus(`❌ Failed: ${errorMsg}`)
        setTimeout(() => setStatus(''), 5000)
        return
      }

      try {
        const timestamp = Date.now()
        if (splitCapture) {
          const sections = Array.isArray(resp.sections) ? resp.sections : []
          if (sections.length === 0) {
            setStatus('❌ Failed: No section images received')
            setTimeout(() => setStatus(''), 3000)
            return
          }
          await downloadSections(sections, timestamp)
        } else {
          if (!resp.dataUrl) {
            setStatus('❌ Failed: No image data received')
            setTimeout(() => setStatus(''), 3000)
            return
          }
          downloadDataUrl(resp.dataUrl, `fullpage_${timestamp}.png`)
        }

        const duration = ((Date.now() - startTime) / 1000).toFixed(1)
        if (splitCapture) {
          const sectionCount = Array.isArray(resp.sections) ? resp.sections.length : 0
          setStatus(`✅ Saved ${sectionCount} sections (${duration}s)`)
        } else {
          setStatus(`✅ Saved (${duration}s)`)
        }
        setTimeout(() => setStatus(''), 2000)
      } catch {
        setStatus(splitCapture ? '❌ Failed to download section images' : '❌ Failed to download image')
        setTimeout(() => setStatus(''), 3000)
      }
    })
  }

  const getOriginFromUrl = React.useCallback((url: string | undefined) => {
    if (!url) return null
    try {
      const u = new URL(url)
      return u.origin
    } catch {
      return null
    }
  }, [])

  const getCurrentTab = React.useCallback(async (): Promise<chrome.tabs.Tab | undefined> => {
    const tabs = await new Promise<chrome.tabs.Tab[]>((resolve) =>
      chrome.tabs.query({ active: true, currentWindow: true }, resolve),
    )
    return tabs[0]
  }, [])

  const loadRulesForCurrentSite = React.useCallback(async () => {
    const tab = await getCurrentTab()
    const origin = getOriginFromUrl(tab?.url)
    if (!origin) return
    chrome.storage.sync.get(['customRules'], (result) => {
      const all = ((result as { customRules?: CustomRulesByOrigin }).customRules) || {}
      const rules = all[origin] || {
        enabled: false,
        css: '',
        hideSelectors: [],
        hideClasses: [],
        hideIds: [],
      }
      setEnabled(!!rules.enabled)
      setCustomCss(String(rules.css || ''))
      setHideSelectors((rules.hideSelectors || []).join(', '))
      setHideClasses((rules.hideClasses || []).join(', '))
      setHideIds((rules.hideIds || []).join(', '))
    })
  }, [getCurrentTab, getOriginFromUrl])

  React.useEffect(() => {
    loadRulesForCurrentSite()
  }, [loadRulesForCurrentSite])

  async function saveRules() {
    const tab = await getCurrentTab()
    const origin = getOriginFromUrl(tab?.url)
    if (!origin) return
    chrome.storage.sync.get(['customRules'], (result) => {
      const all = ((result as { customRules?: CustomRulesByOrigin }).customRules) || {}
      const newRules = {
        enabled,
        css: customCss,
        hideSelectors: hideSelectors
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        hideClasses: hideClasses
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        hideIds: hideIds
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      }
      all[origin] = newRules
      chrome.storage.sync.set({ customRules: all }, () => {
        if (tab?.id) {
          chrome.tabs.sendMessage(tab.id, { action: 'CUSTOM_RULES_APPLY', rules: newRules }, () => {})
        }
        setStatus('Saved rules')
        setTimeout(() => setStatus(''), 1200)
      })
    })
  }

  return (
    <div className="popup-shell min-w-80 p-4 bg-zinc-950 text-white">
      <div className="text-lg font-semibold mb-3">Screenshot & Customize</div>
      <div className="flex gap-2 mb-4">
        <button
          onClick={captureVisible}
          className="inline-flex items-center gap-2 px-3 py-2 rounded bg-zinc-800 hover:bg-zinc-700"
        >
          <svg
            aria-hidden="true"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14.5 4 16 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l1.5-3h5Z" />
            <circle cx="12" cy="13" r="3" />
          </svg>
          <span>Visible</span>
        </button>
        <button onClick={() => captureFull(false)} className="px-3 py-2 rounded bg-zinc-800 hover:bg-zinc-700">Full page</button>
        <button onClick={() => captureFull(true)} className="px-3 py-2 rounded bg-zinc-800 hover:bg-zinc-700">Full split</button>
      </div>

      <div className="space-y-2 mb-2">
        <label className="block text-xs text-zinc-400">Custom CSS</label>
        <textarea className="w-full h-20 rounded bg-zinc-900 p-2 text-sm" value={customCss} onChange={(e) => setCustomCss(e.target.value)} />
      </div>
      <div className="space-y-2 mb-2">
        <label className="block text-xs text-zinc-400">Hide selectors (comma separated)</label>
        <input className="w-full rounded bg-zinc-900 p-2 text-sm" value={hideSelectors} onChange={(e) => setHideSelectors(e.target.value)} />
      </div>
      <div className="space-y-2 mb-2">
        <label className="block text-xs text-zinc-400">Hide classes (comma separated)</label>
        <input className="w-full rounded bg-zinc-900 p-2 text-sm" value={hideClasses} onChange={(e) => setHideClasses(e.target.value)} />
      </div>
      <div className="space-y-2 mb-3">
        <label className="block text-xs text-zinc-400">Hide IDs (comma separated)</label>
        <input className="w-full rounded bg-zinc-900 p-2 text-sm" value={hideIds} onChange={(e) => setHideIds(e.target.value)} />
      </div>

      <div className="flex items-center justify-between">
        <button onClick={saveRules} className="px-3 py-2 rounded bg-zinc-800 hover:bg-zinc-700">Save for site</button>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
          Enabled
        </label>
      </div>

      <div className="mt-3 text-xs text-zinc-400 h-4">{status}</div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
)

