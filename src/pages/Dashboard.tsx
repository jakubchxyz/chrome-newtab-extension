import SearchBar from '../components/SearchBar'
import PortsList from '../components/PortsList'
import QuickLinks from '../components/QuickLinks'
import Clock from '../components/Clock'
import SettingsPanel, { type DashboardPrefs } from '../components/SettingsPanel'
import { useEffect, useState } from 'react'

export default function Dashboard() {
  const [prefs, setPrefs] = useState<DashboardPrefs>({
    showSearch: true,
    showPorts: true,
    showLinks: true,
    showClock: true,
  })
  const [showSettings, setShowSettings] = useState(false)

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

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center gap-8 p-6">
      <div className="absolute top-4 right-4">
        <button onClick={() => setShowSettings(true)} className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded">Settings</button>
      </div>
      {prefs.showSearch && <SearchBar />}
      {prefs.showPorts && <PortsList />}
      {prefs.showLinks && <QuickLinks />}
      {prefs.showClock && <Clock />}
      {showSettings && (
        <SettingsPanel
          prefs={prefs}
          onChange={setPrefs}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}
