;(() => {
  const ROOT_CLASS = 'sac-youtube-recommendations-row'
  const BUTTON_ID = 'sac-youtube-recommendations-button'
  const STYLE_ID = 'sac-youtube-recommendations-style'

  let enabled = false
  let injectTimer: number | undefined

  const CSS = `
html.${ROOT_CLASS} #columns.ytd-watch-flexy {
  flex-direction: row-reverse !important;
}

#${BUTTON_ID} {
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: 50%;
  color: var(--yt-spec-text-primary, #0f0f0f);
  cursor: pointer;
  display: inline-flex;
  flex: 0 0 40px;
  height: 40px;
  justify-content: center;
  margin-right: 8px;
  padding: 0;
  transition:
    background-color 150ms cubic-bezier(0.05, 0, 0, 1),
    transform 100ms cubic-bezier(0.05, 0, 0, 1);
  width: 40px;
}

#${BUTTON_ID}:hover,
#${BUTTON_ID}:focus-visible {
  background: var(--yt-spec-badge-chip-background, rgba(0, 0, 0, 0.1));
}

#${BUTTON_ID}:active {
  transform: scale(0.92);
}

html[dark] #${BUTTON_ID} {
  color: #fff;
}

html[dark] #${BUTTON_ID}:hover,
html[dark] #${BUTTON_ID}:focus-visible {
  background: rgba(255, 255, 255, 0.1);
}

#${BUTTON_ID}[aria-pressed='true'] {
  color: #ff0033;
}

#${BUTTON_ID} svg {
  fill: currentColor;
  height: 24px;
  width: 24px;
}
`

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return
    const style = document.createElement('style')
    style.id = STYLE_ID
    style.textContent = CSS
    document.documentElement.appendChild(style)
  }

  function updateButton() {
    const button = document.getElementById(BUTTON_ID)
    if (!(button instanceof HTMLButtonElement)) return

    button.setAttribute('aria-pressed', String(enabled))
    button.setAttribute(
      'aria-label',
      enabled ? 'Restore recommendation layout' : 'Reverse recommendation layout',
    )
    button.title = enabled ? 'Restore recommendation layout' : 'Reverse recommendation layout'
  }

  function setEnabled(nextEnabled: boolean) {
    enabled = nextEnabled
    document.documentElement.classList.toggle(ROOT_CLASS, enabled)
    updateButton()
    window.dispatchEvent(new Event('resize'))
  }

  function createButton() {
    const button = document.createElement('button')
    button.id = BUTTON_ID
    button.type = 'button'
    button.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m7.41 7.41-1.42-1.42L2 10l3.99 4.01 1.42-1.42L5.83 11H16v-2H5.83l1.58-1.59ZM16.59 16.59l1.42 1.42L22 14l-3.99-4.01-1.42 1.42L18.17 13H8v2h10.17l-1.58 1.59Z" />
      </svg>
    `
    button.addEventListener('click', () => setEnabled(!enabled))
    return button
  }

  function ensureButton() {
    ensureStyle()

    const headerControls = document.querySelector('ytd-masthead #end')
    if (!headerControls || document.getElementById(BUTTON_ID)) {
      updateButton()
      return
    }

    headerControls.prepend(createButton())
    updateButton()
  }

  function scheduleEnsureButton() {
    window.clearTimeout(injectTimer)
    injectTimer = window.setTimeout(ensureButton, 50)
  }

  const observer = new MutationObserver(scheduleEnsureButton)
  observer.observe(document.documentElement, { childList: true, subtree: true })

  ensureButton()
})()
