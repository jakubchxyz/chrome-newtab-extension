// React import not needed with automatic JSX runtime

export type DashboardPrefs = {
  showSearch: boolean
  showPorts: boolean
  showLinks: boolean
  showClock: boolean
}

type Props = {
  prefs: DashboardPrefs
  onChange: (next: DashboardPrefs) => void
  onClose: () => void
}

export default function SettingsPanel({ prefs, onChange, onClose }: Props) {
  function toggle(key: keyof DashboardPrefs) {
    const next = { ...prefs, [key]: !prefs[key] }
    onChange(next)
  }

  function reset() {
    onChange({ showSearch: true, showPorts: true, showLinks: true, showClock: true })
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="w-full max-w-md bg-zinc-900 text-white rounded-xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="text-lg font-semibold">Settings</div>
          <button onClick={onClose} className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700">Close</button>
        </div>
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span>Show search bar</span>
            <input type="checkbox" checked={prefs.showSearch} onChange={() => toggle('showSearch')} />
          </label>
          <label className="flex items-center justify-between">
            <span>Show local ports</span>
            <input type="checkbox" checked={prefs.showPorts} onChange={() => toggle('showPorts')} />
          </label>
          <label className="flex items-center justify-between">
            <span>Show quick links</span>
            <input type="checkbox" checked={prefs.showLinks} onChange={() => toggle('showLinks')} />
          </label>
          <label className="flex items-center justify-between">
            <span>Show clock</span>
            <input type="checkbox" checked={prefs.showClock} onChange={() => toggle('showClock')} />
          </label>
        </div>
        <div className="mt-4 flex justify-between">
          <button onClick={reset} className="px-3 py-2 rounded bg-zinc-800 hover:bg-zinc-700">Reset</button>
          <div className="text-xs text-zinc-400">Prefs save automatically</div>
        </div>
      </div>
    </div>
  )
}


