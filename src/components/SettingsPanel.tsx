
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
  onEditLinks?: () => void
}

export default function SettingsPanel({ prefs, onChange, onClose, onEditLinks }: Props) {
  function toggle(key: keyof DashboardPrefs) {
    const next = { ...prefs, [key]: !prefs[key] }
    onChange(next)
  }


  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-zinc-950/95 backdrop-blur-sm text-white rounded-2xl p-6 shadow-2xl border border-gray-700/50 animate-in fade-in zoom-in-95 duration-300">
        <div className="flex justify-end mb-6">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800/20 rounded-lg transition-colors duration-200"
            aria-label="Close settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors duration-200">
            <span className="text-gray-200 font-medium">Search bar</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={prefs.showSearch}
                onChange={() => toggle('showSearch')}
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-500/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors duration-200">
            <span className="text-gray-200 font-medium">Local servers</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={prefs.showPorts}
                onChange={() => toggle('showPorts')}
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-500/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors duration-200">
            <span className="text-gray-200 font-medium">Quick links</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={prefs.showLinks}
                onChange={() => toggle('showLinks')}
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-500/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors duration-200">
            <span className="text-gray-200 font-medium">Clock</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={prefs.showClock}
                onChange={() => toggle('showClock')}
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-500/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {onEditLinks && (
          <div className="mt-6 pt-4 border-t border-gray-700/50">
            <button
              onClick={onEditLinks}
              className="w-full px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all duration-200 flex items-center justify-center gap-2 font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Quick Links
            </button>
          </div>
        )}
      </div>
    </div>
  )
}


