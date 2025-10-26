import SearchBar from '../components/SearchBar'
import PortsList from '../components/PortsList'
import QuickLinks from '../components/QuickLinks'
import QuickLinksEditor from '../components/QuickLinksEditor'
import Clock from '../components/Clock'
import SettingsPanel, { type DashboardPrefs } from '../components/SettingsPanel'
import { useEffect, useState } from 'react'

interface LinkItem {
  label: string
  url: string
  icon: string
}

const DEFAULT_LINKS: LinkItem[] = [
  {
    label: 'GitHub',
    url: 'https://github.com',
    icon: 'M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z'
  },
  {
    label: 'OpenAI',
    url: 'https://chat.openai.com',
    icon: 'M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z'
  }
]

export default function Dashboard() {
  const [prefs, setPrefs] = useState<DashboardPrefs>({
    showSearch: true,
    showPorts: true,
    showLinks: true,
    showClock: true,
  })
  const [showSettings, setShowSettings] = useState(false)
  const [customLinks, setCustomLinks] = useState<LinkItem[]>(DEFAULT_LINKS)
  const [showLinksEditor, setShowLinksEditor] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('dashboard_prefs')
    if (saved) {
      try { setPrefs({ ...prefs, ...JSON.parse(saved) }) } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    localStorage.setItem('dashboard_prefs', JSON.stringify(prefs))
  }, [prefs])

  useEffect(() => {
    const saved = localStorage.getItem('custom_quick_links')
    if (saved) {
      try { setCustomLinks(JSON.parse(saved)) } catch {}
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('custom_quick_links', JSON.stringify(customLinks))
  }, [customLinks])

  const handleSaveLinks = (newLinks: LinkItem[]) => {
    setCustomLinks(newLinks)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white relative overflow-visible">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(75,85,99,0.05),transparent_50%)] pointer-events-none" />

      {/* Settings button */}
      <button
        onClick={() => setShowSettings(true)}
        className="absolute top-6 right-6 z-10 p-3 hover:bg-gray-800/20 rounded-full transition-all duration-200"
        aria-label="Open settings"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12 max-w-6xl mx-auto">
        {/* Main content grid */}
        <div className="w-full max-w-4xl space-y-8">
          {/* Ports section */}
          {prefs.showPorts && (
            <PortsList />
          )}

          {/* Search section */}
          {prefs.showSearch && (
            <div className="flex justify-center">
              <div className="w-full max-w-2xl">
                <SearchBar />
              </div>
            </div>
          )}

          {/* Quick links */}
          {prefs.showLinks && (
            <QuickLinks links={customLinks} />
          )}

          {/* Bottom info */}
          <div className="flex items-center justify-center gap-4 text-gray-400">
            {prefs.showClock && <Clock />}
          </div>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <SettingsPanel
          prefs={prefs}
          onChange={setPrefs}
          onClose={() => setShowSettings(false)}
          onEditLinks={() => setShowLinksEditor(true)}
        />
      )}

      {/* Quick links editor */}
      {showLinksEditor && (
        <QuickLinksEditor
          links={customLinks}
          onSave={handleSaveLinks}
          onClose={() => setShowLinksEditor(false)}
        />
      )}
    </div>
  )
}
