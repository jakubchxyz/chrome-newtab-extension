
interface LinkItem {
  label: string
  url: string
  icon: string
}

interface Props {
  links: LinkItem[]
}

export default function QuickLinks({ links }: Props) {
  return (
    <div className="flex justify-center">
      <div className={`grid gap-4 ${
        links.length === 1 ? 'grid-cols-1' :
        links.length === 2 ? 'grid-cols-2' :
        links.length === 3 ? 'grid-cols-3' :
        'grid-cols-2 md:grid-cols-4'
      }`}>
        {links.map((link, index) => (
          <button
            key={link.url}
            onClick={() => window.open(link.url, '_blank')}
            className="group flex flex-col items-center justify-center p-3 hover:bg-gray-800/20 rounded-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 max-w-20"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="w-8 h-8 mb-2 flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-300 group-hover:text-blue-400 transition-colors duration-200" fill="currentColor" viewBox="0 0 24 24">
                <path d={link.icon} />
              </svg>
            </div>
            <span className="text-xs font-medium text-gray-200 group-hover:text-white transition-colors duration-200 text-center leading-tight">
              {link.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
