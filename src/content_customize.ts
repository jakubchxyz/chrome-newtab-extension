;(() => {
  const STYLE_ID = '__site_customizer_style__'

  function ensureStyleElement(): HTMLStyleElement {
    let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null
    if (!el) {
      el = document.createElement('style')
      el.id = STYLE_ID
      el.type = 'text/css'
      document.documentElement.appendChild(el)
    }
    return el
  }

  function clearCustomization() {
    const el = document.getElementById(STYLE_ID)
    if (el && el.parentNode) el.parentNode.removeChild(el)
  }

  function buildHideCssFromSelectors(hideSelectors?: string[]) {
    const selectors = (hideSelectors || []).map((s) => s.trim()).filter(Boolean)
    if (!selectors.length) return ''
    return `${selectors.join(', ')} { display: none !important; }\n`
  }

  function buildHideCssFromClasses(hideClasses?: string[]) {
    const classes = (hideClasses || []).map((s) => s.trim()).filter(Boolean)
    if (!classes.length) return ''
    const selectors = classes.map((c) => `.${CSS.escape(c)}`)
    return `${selectors.join(', ')} { display: none !important; }\n`
  }

  function buildHideCssFromIds(hideIds?: string[]) {
    const ids = (hideIds || []).map((s) => s.trim()).filter(Boolean)
    if (!ids.length) return ''
    const selectors = ids.map((id) => `#${CSS.escape(id)}`)
    return `${selectors.join(', ')} { display: none !important; }\n`
  }

  function applyRules(rules: any) {
    if (!rules || rules.enabled !== true) {
      clearCustomization()
      return
    }
    const styleEl = ensureStyleElement()
    const hideSelCss = buildHideCssFromSelectors(rules.hideSelectors)
    const hideClsCss = buildHideCssFromClasses(rules.hideClasses)
    const hideIdCss = buildHideCssFromIds(rules.hideIds)
    const userCss = String(rules.css || '')
    styleEl.textContent = `${hideSelCss}${hideClsCss}${hideIdCss}${userCss}`
  }

  const origin = location.origin
  chrome.storage.sync.get(['customRules'], (result) => {
    const all = (result && (result as any).customRules) || {}
    const rules = all[origin]
    applyRules(rules)
  })

  chrome.runtime.onMessage.addListener((req, _sender, sendResponse) => {
    if (req && req.action === 'CUSTOM_RULES_APPLY') {
      applyRules(req.rules)
      sendResponse({ ok: true })
      return true
    }
  })
})()


