import { useState } from 'react'

interface LinkItem {
  label: string
  url: string
  icon: string
}

interface Props {
  links: LinkItem[]
  onSave: (links: LinkItem[]) => void
  onClose: () => void
}

const DEFAULT_ICON = 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1'

export default function QuickLinksEditor({ links: initialLinks, onSave, onClose }: Props) {
  const [links, setLinks] = useState<LinkItem[]>(initialLinks)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ label: '', url: '', icon: '' })

  const addLink = () => {
    setLinks([...links, { label: 'New Link', url: 'https://', icon: DEFAULT_ICON }])
  }

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index))
  }

  const startEditing = (index: number) => {
    setEditingIndex(index)
    setEditForm(links[index])
  }

  const saveEdit = () => {
    if (editingIndex !== null) {
      const newLinks = [...links]
      newLinks[editingIndex] = editForm
      setLinks(newLinks)
      setEditingIndex(null)
      setEditForm({ label: '', url: '', icon: '' })
    }
  }

  const cancelEdit = () => {
    setEditingIndex(null)
    setEditForm({ label: '', url: '', icon: '' })
  }

  const handleSave = () => {
    onSave(links)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-zinc-950/95 backdrop-blur-sm text-white rounded-2xl p-6 shadow-2xl border border-gray-700/50 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-100">Edit Quick Links</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors duration-200"
            aria-label="Close editor"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 mb-6">
          {links.map((link, index) => (
            <div key={index} className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-lg">
              {editingIndex === index ? (
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Label"
                    value={editForm.label}
                    onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                    className="px-3 py-2 bg-gray-600/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="url"
                    placeholder="URL"
                    value={editForm.url}
                    onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                    className="px-3 py-2 bg-gray-600/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Icon SVG path"
                    value={editForm.icon}
                    onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                    className="px-3 py-2 bg-gray-600/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                  />
                  <div className="flex gap-2 md:col-span-3">
                    <button
                      onClick={saveEdit}
                      className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-sm font-medium transition-colors duration-200"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm font-medium transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d={link.icon} />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-200">{link.label}</div>
                    <div className="text-sm text-gray-400 truncate">{link.url}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditing(index)}
                      className="p-2 text-gray-400 hover:text-gray-200 transition-colors duration-200"
                      aria-label="Edit link"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => removeLink(index)}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors duration-200"
                      aria-label="Remove link"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
          <button
            onClick={addLink}
            className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-lg transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Link
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors duration-200"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
