
const LINKS = [
  { label: 'GitHub', url: 'https://github.com' },
  { label: 'Supabase', url: 'https://supabase.com' },
  { label: 'Notion', url: 'https://www.notion.so' },
  { label: 'OpenAI', url: 'https://chat.openai.com' },
]

export default function QuickLinks() {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {LINKS.map(link => (
        <button
          key={link.url}
          onClick={() => window.open(link.url, '_blank')}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg"
        >
          {link.label}
        </button>
      ))}
    </div>
  )
}
