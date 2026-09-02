;(() => {
  const ROOT_CLASS = 'sac-youtube-cinema'
  const BUTTON_ID = 'sac-youtube-cinema-button'
  const STYLE_ID = 'sac-youtube-cinema-style'

  let enabled = false
  let lastWatchUrl = location.href
  let previousScrollX = 0
  let previousScrollY = 0
  let injectTimer: number | undefined

  const CINEMA_CSS = `
html.${ROOT_CLASS},
html.${ROOT_CLASS} body,
html.${ROOT_CLASS} ytd-app,
html.${ROOT_CLASS} #content,
html.${ROOT_CLASS} ytd-page-manager {
  overflow: hidden !important;
  background: #000 !important;
}

html.${ROOT_CLASS} ytd-masthead,
html.${ROOT_CLASS} #secondary,
html.${ROOT_CLASS} #below,
html.${ROOT_CLASS} #comments,
html.${ROOT_CLASS} #related,
html.${ROOT_CLASS} #chat-container,
html.${ROOT_CLASS} #panels,
html.${ROOT_CLASS} #guide,
html.${ROOT_CLASS} tp-yt-app-drawer {
  display: none !important;
}

html.${ROOT_CLASS} ytd-watch-flexy {
  --ytd-watch-flexy-masthead-height: 0px !important;
  padding-top: 0 !important;
  min-width: 0 !important;
}

html.${ROOT_CLASS} #columns.ytd-watch-flexy {
  display: block !important;
  margin: 0 !important;
  padding: 0 !important;
  max-width: none !important;
}

html.${ROOT_CLASS} #primary.ytd-watch-flexy,
html.${ROOT_CLASS} #primary-inner.ytd-watch-flexy {
  margin: 0 !important;
  padding: 0 !important;
  max-width: none !important;
  width: 100vw !important;
  height: 100vh !important;
}

html.${ROOT_CLASS} #player.ytd-watch-flexy {
  position: fixed !important;
  inset: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  max-width: none !important;
  margin: 0 !important;
  background: #000 !important;
}

html.${ROOT_CLASS} #player-container-outer.ytd-watch-flexy,
html.${ROOT_CLASS} #player-container-inner.ytd-watch-flexy,
html.${ROOT_CLASS} #movie_player,
html.${ROOT_CLASS} .html5-video-container {
  width: 100% !important;
  height: 100% !important;
  max-width: none !important;
}

html.${ROOT_CLASS} video.html5-main-video {
  width: 100% !important;
  height: 100% !important;
  left: 0 !important;
  top: 0 !important;
  object-fit: contain !important;
}

html.${ROOT_CLASS} #player-container-inner.ytd-watch-flexy {
  padding-top: 0 !important;
  position: absolute !important;
  inset: 0 !important;
}

html.${ROOT_CLASS} #player-container-outer.ytd-watch-flexy {
  padding: 0 !important;
  min-width: 0 !important;
}

#${BUTTON_ID} {
  align-items: center;
  display: inline-flex !important;
  height: 100%;
  justify-content: center;
  opacity: 0.9;
  padding: 0 !important;
  vertical-align: top;
  width: 48px !important;
}

#${BUTTON_ID}:hover,
#${BUTTON_ID}:focus-visible {
  opacity: 1;
}

#${BUTTON_ID}[aria-pressed='true'] {
  color: #ff0033;
}

#${BUTTON_ID} .sac-youtube-cinema-icon {
  display: block;
  flex: 0 0 24px;
  fill: currentColor;
  height: 24px;
  width: 24px;
}
`

  function isWatchPage() {
    return location.pathname === '/watch'
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return
    const style = document.createElement('style')
    style.id = STYLE_ID
    style.textContent = CINEMA_CSS
    document.documentElement.appendChild(style)
  }

  function refreshPlayerLayout() {
    window.dispatchEvent(new Event('resize'))
    window.setTimeout(() => window.dispatchEvent(new Event('resize')), 120)
  }

  function updateButton() {
    const button = document.getElementById(BUTTON_ID)
    if (!(button instanceof HTMLButtonElement)) return

    button.setAttribute('aria-pressed', String(enabled))
    button.setAttribute(
      'aria-label',
      enabled ? 'Exit browser cinema mode' : 'Enter browser cinema mode',
    )
    button.title = enabled ? 'Exit browser cinema mode' : 'Browser cinema mode'
  }

  function setEnabled(nextEnabled: boolean) {
    if (nextEnabled === enabled) {
      updateButton()
      return
    }

    enabled = nextEnabled
    if (enabled) {
      previousScrollX = window.scrollX
      previousScrollY = window.scrollY
      document.documentElement.classList.add(ROOT_CLASS)
    } else {
      document.documentElement.classList.remove(ROOT_CLASS)
      window.scrollTo({ left: previousScrollX, top: previousScrollY, behavior: 'instant' })
    }

    updateButton()
    refreshPlayerLayout()
  }

  function createButton() {
    const button = document.createElement('button')
    button.id = BUTTON_ID
    button.className = 'ytp-button'
    button.type = 'button'
    button.innerHTML = `
      <svg class="sac-youtube-cinema-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 8V3h5v2H5v3H3Zm13-5h5v5h-2V5h-3V3ZM3 16h2v3h3v2H3v-5Zm16 0h2v5h-5v-2h3v-3ZM7 9h10v6H7V9Z" />
      </svg>
    `
    button.addEventListener('click', (event) => {
      event.preventDefault()
      event.stopPropagation()
      setEnabled(!enabled)
    })
    return button
  }

  function ensureButton() {
    ensureStyle()

    if (!isWatchPage()) {
      setEnabled(false)
      document.getElementById(BUTTON_ID)?.remove()
      return
    }

    const controls = document.querySelector('.ytp-right-controls')
    if (!controls || document.getElementById(BUTTON_ID)) {
      updateButton()
      return
    }

    const button = createButton()
    const theaterButton = controls.querySelector('.ytp-size-button')
    const theaterControl = Array.from(controls.children).find(
      (child) => child === theaterButton || child.contains(theaterButton),
    )
    controls.insertBefore(button, theaterControl || controls.firstChild)
    updateButton()
  }

  function scheduleEnsureButton() {
    window.clearTimeout(injectTimer)
    injectTimer = window.setTimeout(ensureButton, 50)
  }

  function handleNavigation() {
    const currentUrl = location.href
    if (currentUrl !== lastWatchUrl) {
      lastWatchUrl = currentUrl
      setEnabled(false)
    }
    scheduleEnsureButton()
  }

  document.addEventListener('yt-navigate-finish', handleNavigation)
  window.addEventListener('popstate', handleNavigation)

  const observer = new MutationObserver(scheduleEnsureButton)
  observer.observe(document.documentElement, { childList: true, subtree: true })

  ensureButton()
})()
