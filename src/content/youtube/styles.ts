;(() => {
  const STYLE_ID = 'sac-youtube-styles'
  const YOUTUBE_CSS = `
ytd-masthead #voice-search-button,
ytd-masthead #create-button,
ytd-masthead #notifications-button,
ytd-masthead ytd-notification-topbar-button-renderer,
ytd-masthead ytd-searchbox #keyboard,
ytd-masthead yt-searchbox #keyboard,
ytd-masthead .ytSearchboxComponentYtdTextInputAssistantWrapper,
ytd-masthead ytd-text-input-assistant,
ytd-masthead form#search-form button[aria-label*='keyboard' i],
ytd-masthead form#search-form button[aria-label*='klawiatur' i],
ytd-masthead ytd-button-renderer:has(button[aria-label='Utwórz']),
ytd-masthead ytd-button-renderer:has(button[aria-label='Create']),
ytd-masthead yt-button-view-model:has(button[aria-label='Utwórz']),
ytd-masthead yt-button-view-model:has(button[aria-label='Create']),
ytd-watch-metadata ytd-sponsor-button-renderer,
ytd-watch-metadata ytd-button-renderer:has(button[aria-label^='Wesprzyj']),
ytd-watch-metadata ytd-button-renderer:has(button[aria-label^='Join']),
ytd-watch-metadata yt-button-view-model:has(button[aria-label^='Wesprzyj']),
ytd-watch-metadata yt-button-view-model:has(button[aria-label^='Join']),
ytd-watch-metadata #actions ytd-button-renderer:has(button[aria-label^='Podziękuj']),
ytd-watch-metadata #actions ytd-button-renderer:has(button[aria-label^='Thanks']),
ytd-watch-metadata #actions yt-button-view-model:has(button[aria-label^='Podziękuj']),
ytd-watch-metadata #actions yt-button-view-model:has(button[aria-label^='Thanks']),
ytd-watch-metadata #actions ytd-button-renderer:has(button[aria-label^='Udostępnij']),
ytd-watch-metadata #actions ytd-button-renderer:has(button[aria-label^='Share']),
ytd-watch-metadata #actions ytd-button-renderer:has(button[aria-label^='Zapisz']),
ytd-watch-metadata #actions ytd-button-renderer:has(button[aria-label^='Save']),
ytd-watch-metadata #actions yt-button-view-model:has(button[aria-label^='Udostępnij']),
ytd-watch-metadata #actions yt-button-view-model:has(button[aria-label^='Share']),
ytd-watch-metadata #actions yt-button-view-model:has(button[aria-label^='Zapisz']),
ytd-watch-metadata #actions yt-button-view-model:has(button[aria-label^='Save']) {
  display: none !important;
}
`

  if (document.getElementById(STYLE_ID)) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = YOUTUBE_CSS
  document.documentElement.appendChild(style)
})()
