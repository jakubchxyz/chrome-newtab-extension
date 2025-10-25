import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

function Popup() {
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

  async function captureFull() {
    setStatus('Capturing full page...')
    chrome.runtime.sendMessage({ action: 'capture-fullpage' }, (resp) => {
      if (!resp || !resp.success) {
        setStatus('Failed')
        return
      }
      const link = document.createElement('a')
      link.href = resp.dataUrl
      link.download = `fullpage_${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      link.remove()
      setStatus('Saved')
      setTimeout(() => setStatus(''), 1500)
    })
  }

  function getOriginFromUrl(url: string | undefined) {
    if (!url) return null
    try {
      const u = new URL(url)
      return u.origin
    } catch {
      return null
    }
  }

  async function getCurrentTab(): Promise<chrome.tabs.Tab | undefined> {
    const tabs = await new Promise<chrome.tabs.Tab[]>((resolve) =>
      chrome.tabs.query({ active: true, currentWindow: true }, resolve),
    )
    return tabs[0]
  }

  async function loadRulesForCurrentSite() {
    const tab = await getCurrentTab()
    const origin = getOriginFromUrl(tab?.url)
    if (!origin) return
    chrome.storage.sync.get(['customRules'], (result) => {
      const all = (result && (result as any).customRules) || {}
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
  }

  React.useEffect(() => {
    loadRulesForCurrentSite()
  }, [])

  async function saveRules() {
    const tab = await getCurrentTab()
    const origin = getOriginFromUrl(tab?.url)
    if (!origin) return
    chrome.storage.sync.get(['customRules'], (result) => {
      const all = (result && (result as any).customRules) || {}
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
    <div className="min-w-80 p-4 bg-zinc-950 text-white">
      <div className="text-lg font-semibold mb-3">Screenshot & Customize</div>
      <div className="flex gap-2 mb-4">
        <button onClick={captureVisible} className="px-3 py-2 rounded bg-zinc-800 hover:bg-zinc-700">Visible</button>
        <button onClick={captureFull} className="px-3 py-2 rounded bg-zinc-800 hover:bg-zinc-700">Full page</button>
        <a className="px-3 py-2 rounded bg-zinc-800 hover:bg-zinc-700" href="chrome://newtab" target="_blank">New Tab</a>
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


